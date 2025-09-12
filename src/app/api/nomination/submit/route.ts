import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { NominationSubmitSchema } from '@/lib/zod/nomination';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse JSON with timeout
    const body = await Promise.race([
      request.json(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Request parsing timeout')), 5000)
      )
    ]);
    
    // Check if this is an admin bypass request
    const bypassNominationStatus = body.bypassNominationStatus === true;
    
    // Check nomination status (unless admin bypass)
    if (!bypassNominationStatus) {
      try {
        // Check if nominations are open - try multiple table names for compatibility
        let settings = null;
        
        // Try system_settings first
        const { data: systemSettings, error: systemError } = await supabase
          .from('system_settings')
          .select('setting_key, setting_value')
          .eq('setting_key', 'nominations_enabled')
          .single();
        
        if (!systemError && systemSettings) {
          settings = { nominations_open: systemSettings.setting_value === 'true' };
        } else {
          // Fallback to settings table
          const { data: fallbackSettings, error: fallbackError } = await supabase
            .from('settings')
            .select('nominations_open')
            .single();
          
          if (!fallbackError) {
            settings = fallbackSettings;
          }
        }

        // If we can't check settings, allow nominations (fail open for better UX)
        if (settings && !settings.nominations_open) {
          return NextResponse.json(
            { 
              success: false,
              error: 'Nominations are currently closed',
              timestamp: new Date().toISOString()
            },
            { status: 403 }
          );
        }
      } catch (settingsError) {
        console.warn('Could not check nomination status, allowing submission:', settingsError);
        // Continue with submission if we can't check settings
      }
    }
    
    // Fast validation
    const validatedData = NominationSubmitSchema.parse(body);
    
    console.log('Processing nomination submission:', {
      type: validatedData.type,
      subcategoryId: validatedData.subcategoryId,
      nominatorEmail: validatedData.nominator.email
    });

    // 1. Upsert nominator
    const nominatorData = {
      email: validatedData.nominator.email.toLowerCase(),
      firstname: validatedData.nominator.firstname,
      lastname: validatedData.nominator.lastname,
      linkedin: validatedData.nominator.linkedin || null,
      company: validatedData.nominator.company || null,
      job_title: validatedData.nominator.jobTitle || null,
      phone: validatedData.nominator.phone || null,
      country: validatedData.nominator.country || null
    };

    const { data: existingNominator } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', nominatorData.email)
      .single();

    let nominator;
    if (existingNominator) {
      // Update existing nominator
      const { data: updatedNominator, error: updateError } = await supabase
        .from('nominators')
        .update(nominatorData)
        .eq('id', existingNominator.id)
        .select()
        .single();

      if (updateError) throw updateError;
      nominator = updatedNominator;
    } else {
      // Insert new nominator
      const { data: newNominator, error: insertError } = await supabase
        .from('nominators')
        .insert(nominatorData)
        .select()
        .single();

      if (insertError) throw insertError;
      nominator = newNominator;
    }

    // 2. Create nominee
    const nomineeData: any = {
      type: validatedData.type
    };

    if (validatedData.type === 'person') {
      const nominee = validatedData.nominee as any;
      nomineeData.firstname = nominee.firstname;
      nomineeData.lastname = nominee.lastname;
      nomineeData.person_email = nominee.email || null;
      nomineeData.person_linkedin = nominee.linkedin || null;
      nomineeData.person_phone = nominee.phone || null;
      nomineeData.jobtitle = nominee.jobtitle || null;
      nomineeData.person_company = nominee.company || null;
      nomineeData.person_country = nominee.country || null;
      nomineeData.headshot_url = nominee.headshotUrl;
      nomineeData.why_me = nominee.whyMe || null;
      nomineeData.live_url = nominee.liveUrl || null;
      nomineeData.bio = nominee.bio || null;
      nomineeData.achievements = nominee.achievements || null;
    } else {
      const nominee = validatedData.nominee as any;
      nomineeData.company_name = nominee.name;
      nomineeData.company_domain = nominee.domain || null;
      nomineeData.company_website = nominee.website || null;
      nomineeData.company_linkedin = nominee.linkedin || null;
      nomineeData.company_phone = nominee.phone || null;
      nomineeData.company_country = nominee.country || null;
      nomineeData.company_size = nominee.size || null;
      nomineeData.company_industry = nominee.industry || null;
      nomineeData.logo_url = nominee.logoUrl;
      nomineeData.why_us = nominee.whyUs || null;
      nomineeData.live_url = nominee.liveUrl || null;
      nomineeData.bio = nominee.bio || null;
      nomineeData.achievements = nominee.achievements || null;
    }

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) throw nomineeError;

    // 3. Create nomination linking nominator and nominee
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: validatedData.categoryGroupId,
      subcategory_id: validatedData.subcategoryId,
      state: 'submitted' as const, // Changed from 'pending' to 'submitted' to match schema
      votes: 0,
      admin_notes: body.adminNotes || null
      // Note: nomination_source column removed for compatibility
    };

    const { data: nomination, error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData)
      .select()
      .single();

    if (nominationError) throw nominationError;

    // 4. Real-time HubSpot and Loops sync for BOTH nominator AND nominee
    let nominatorSyncSuccess = false;
    let nomineeSyncSuccess = false;
    let nominatorLoopsSyncSuccess = false;
    let nomineeLoopsSyncSuccess = false;
    
    try {
      // Check if HubSpot sync is enabled
      const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true' && (process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN);
      
      if (hubspotEnabled) {
        console.log('🔄 Starting HubSpot real-time sync...');
        
        // Dynamic import with better error handling
        const hubspotModule = await import('@/server/hubspot/realtime-sync').catch(importError => {
          console.warn('Failed to import HubSpot sync module:', importError);
          return null;
        });
        
        if (hubspotModule) {
          const { syncNominatorToHubSpot, syncNomineeToHubSpot } = hubspotModule;
          
          // Sync nominator immediately
          const nominatorSyncData = {
            firstname: validatedData.nominator.firstname,
            lastname: validatedData.nominator.lastname,
            email: validatedData.nominator.email,
            linkedin: validatedData.nominator.linkedin,
            company: validatedData.nominator.company,
            jobTitle: validatedData.nominator.jobTitle,
            phone: validatedData.nominator.phone,
            country: validatedData.nominator.country,
          };

          console.log('🔄 Syncing nominator to HubSpot:', nominatorSyncData.email);
          const nominatorSyncResult = await syncNominatorToHubSpot(nominatorSyncData).catch(syncError => {
            console.warn('Nominator sync error:', syncError);
            return { success: false, error: syncError.message };
          });
          
          if (nominatorSyncResult.success) {
            nominatorSyncSuccess = true;
            console.log(`✅ Nominator synced to HubSpot: ${nominatorSyncResult.contactId}`);
          } else {
            console.warn(`⚠️ HubSpot sync failed for nominator: ${nominatorSyncResult.error}`);
          }

          // Sync nominee immediately as well (don't wait for approval)
          const nomineeSyncData = {
            type: validatedData.type as 'person' | 'company',
            subcategoryId: validatedData.subcategoryId,
            nominationId: nomination.id,
            // Person fields
            firstname: validatedData.type === 'person' ? (validatedData.nominee as any).firstname : undefined,
            lastname: validatedData.type === 'person' ? (validatedData.nominee as any).lastname : undefined,
            email: validatedData.type === 'person' ? (validatedData.nominee as any).email : undefined,
            linkedin: validatedData.type === 'person' ? (validatedData.nominee as any).linkedin : undefined,
            jobtitle: validatedData.type === 'person' ? (validatedData.nominee as any).jobtitle : undefined,
            company: validatedData.type === 'person' ? (validatedData.nominee as any).company : undefined,
            phone: validatedData.type === 'person' ? (validatedData.nominee as any).phone : undefined,
            country: validatedData.type === 'person' ? (validatedData.nominee as any).country : undefined,
            // Company fields
            companyName: validatedData.type === 'company' ? (validatedData.nominee as any).name : undefined,
            companyWebsite: validatedData.type === 'company' ? (validatedData.nominee as any).website : undefined,
            companyLinkedin: validatedData.type === 'company' ? (validatedData.nominee as any).linkedin : undefined,
            companyEmail: validatedData.type === 'company' ? (validatedData.nominee as any).email : undefined,
            companyPhone: validatedData.type === 'company' ? (validatedData.nominee as any).phone : undefined,
            companyCountry: validatedData.type === 'company' ? (validatedData.nominee as any).country : undefined,
            companyIndustry: validatedData.type === 'company' ? (validatedData.nominee as any).industry : undefined,
            companySize: validatedData.type === 'company' ? (validatedData.nominee as any).size : undefined,
          };

          console.log('🔄 Syncing nominee to HubSpot:', nomineeSyncData.email || nomineeSyncData.companyName);
          const nomineeSyncResult = await syncNomineeToHubSpot(nomineeSyncData).catch(syncError => {
            console.warn('Nominee sync error:', syncError);
            return { success: false, error: syncError.message };
          });
          
          if (nomineeSyncResult.success) {
            nomineeSyncSuccess = true;
            console.log(`✅ Nominee synced to HubSpot immediately: ${nomineeSyncResult.contactId}`);
          } else {
            console.warn(`⚠️ HubSpot sync failed for nominee: ${nomineeSyncResult.error}`);
          }
        } else {
          console.warn('⚠️ HubSpot sync module not available');
        }
      } else {
        console.log('ℹ️ HubSpot sync disabled or not configured');
      }
    } catch (error) {
      console.warn('HubSpot real-time sync failed (non-blocking):', error);
    }

    // 4b. Real-time Loops sync for nominator (nominees sync on approval)
    try {
      // Check if Loops sync is enabled
      const loopsEnabled = process.env.LOOPS_SYNC_ENABLED === 'true' && process.env.LOOPS_API_KEY;
      
      if (loopsEnabled) {
        console.log('🔄 Starting Loops real-time sync...');
        
        // Dynamic import with better error handling
        const loopsModule = await import('@/server/loops/realtime-sync').catch(importError => {
          console.warn('Failed to import Loops sync module:', importError);
          return null;
        });
        
        if (loopsModule) {
          const { syncNominatorToLoops } = loopsModule;
          
          // Sync nominator immediately with "Nominator 2026" tag
          const nominatorLoopsData = {
            firstname: validatedData.nominator.firstname,
            lastname: validatedData.nominator.lastname,
            email: validatedData.nominator.email,
            linkedin: validatedData.nominator.linkedin,
            company: validatedData.nominator.company,
            jobTitle: validatedData.nominator.jobTitle,
            phone: validatedData.nominator.phone,
            country: validatedData.nominator.country,
          };

          console.log('🔄 Syncing nominator to Loops:', nominatorLoopsData.email);
          const nominatorLoopsResult = await syncNominatorToLoops(nominatorLoopsData).catch(syncError => {
            console.warn('Nominator Loops sync error:', syncError);
            return { success: false, error: syncError.message };
          });
          
          if (nominatorLoopsResult.success) {
            nominatorLoopsSyncSuccess = true;
            console.log(`✅ Nominator synced to Loops: ${nominatorLoopsResult.contactId}`);
          } else {
            console.warn(`⚠️ Loops sync failed for nominator: ${nominatorLoopsResult.error}`);
          }
        } else {
          console.warn('⚠️ Loops sync module not available');
        }
      } else {
        console.log('ℹ️ Loops sync disabled or not configured');
      }
    } catch (error) {
      console.warn('Loops real-time sync failed (non-blocking):', error);
    }

    // 5. Insert hubspot_outbox row for backup sync
    const outboxPayload = {
      nominationId: nomination.id,
      nominatorId: nominator.id,
      nomineeId: nominee.id,
      type: validatedData.type,
      subcategoryId: validatedData.subcategoryId,
      nominator: validatedData.nominator,
      nominee: validatedData.nominee
    };

    const { error: outboxError } = await supabase
      .from('hubspot_outbox')
      .insert({
        event_type: 'nomination_submitted',
        payload: outboxPayload
      });

    if (outboxError) throw outboxError;

    // 5b. Insert loops_outbox row for backup sync
    try {
      const { error: loopsOutboxError } = await supabase
        .from('loops_outbox')
        .insert({
          event_type: 'nomination_submitted',
          payload: outboxPayload
        });

      if (loopsOutboxError) {
        console.warn('Failed to add to Loops outbox (non-blocking):', loopsOutboxError);
      }
    } catch (loopsOutboxError) {
      console.warn('Loops outbox not available (non-blocking):', loopsOutboxError);
    }

    // 6. Send emails
    let nominatorEmailSent = false;
    let nomineeEmailSent = false;
    
    try {
      const { loopsTransactional } = await import('@/server/loops/transactional');
      
      // Get category name for email
      const { data: categoryData } = await supabase
        .from('subcategories')
        .select('name, category_groups(name)')
        .eq('id', validatedData.subcategoryId)
        .single();

      const categoryName = categoryData?.category_groups?.name || 'Unknown Category';
      const subcategoryName = categoryData?.name || 'Unknown Subcategory';
      
      const nomineeDisplayName = validatedData.type === 'person' 
        ? `${(validatedData.nominee as any).firstname || ''} ${(validatedData.nominee as any).lastname || ''}`.trim()
        : (validatedData.nominee as any).name || '';

      // Send nominator confirmation email (always)
      const nominatorEmailResult = await loopsTransactional.sendNominatorConfirmationEmail({
        nominatorFirstName: validatedData.nominator.firstname,
        nominatorLastName: validatedData.nominator.lastname,
        nominatorEmail: validatedData.nominator.email,
        nominatorCompany: validatedData.nominator.company,
        nominatorJobTitle: validatedData.nominator.jobTitle,
        nomineeDisplayName,
        categoryName,
        subcategoryName,
        submissionTimestamp: new Date().toISOString()
      });

      if (nominatorEmailResult.success) {
        nominatorEmailSent = true;
        console.log('✅ Nominator confirmation email sent successfully');
      } else {
        console.warn('⚠️ Failed to send nominator confirmation email:', nominatorEmailResult.error);
      }

      // Send nominee direct nomination email (only for admin nominations)
      // NOTE: This is disabled to prevent duplicate emails since admin approval also sends emails
      if (bypassNominationStatus && body.sendNomineeEmail === true) {
        const nomineeEmail = validatedData.type === 'person' 
          ? (validatedData.nominee as any).email 
          : (validatedData.nominee as any).email;

        if (nomineeEmail) {
          console.log('📧 Admin requested nominee email to be sent immediately');
          const nomineeEmailResult = await loopsTransactional.sendNomineeDirectNominationEmail({
            nomineeFirstName: validatedData.type === 'person' ? (validatedData.nominee as any).firstname : undefined,
            nomineeLastName: validatedData.type === 'person' ? (validatedData.nominee as any).lastname : undefined,
            nomineeEmail,
            nomineeDisplayName,
            categoryName,
            subcategoryName,
            nominationTimestamp: new Date().toISOString()
          });

          if (nomineeEmailResult.success) {
            nomineeEmailSent = true;
            console.log('✅ Nominee direct nomination email sent successfully');
          } else {
            console.warn('⚠️ Failed to send nominee direct nomination email:', nomineeEmailResult.error);
          }
        } else {
          console.warn('⚠️ No email address found for nominee, skipping nominee notification email');
        }
      } else if (bypassNominationStatus) {
        console.log('📧 Admin nomination: Nominee email will be sent during approval process to prevent duplicates');
      }
    } catch (error) {
      console.warn('Email sending failed (non-blocking):', error);
    }

    const totalTime = Date.now() - startTime;
    console.log(`Nomination submitted successfully: ${nomination.id} (${totalTime}ms)`);

    return NextResponse.json({
      success: true,
      nominationId: nomination.id,
      nominatorId: nominator.id,
      nomineeId: nominee.id,
      state: 'submitted',
      processingTime: totalTime,
      hubspotSync: {
        nominatorSynced: nominatorSyncSuccess,
        nomineeSynced: nomineeSyncSuccess,
        outboxCreated: true
      },
      loopsSync: {
        nominatorSynced: nominatorLoopsSyncSuccess,
        outboxCreated: true
      },
      emails: {
        nominatorConfirmationSent: nominatorEmailSent
      },
      timestamp: new Date().toISOString()
    }, { status: 201 });

  } catch (error) {
    console.error('POST /api/nomination/submit error:', error);
    console.error('Error type:', typeof error);
    console.error('Error constructor:', error?.constructor?.name);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    if (error instanceof z.ZodError) {
      console.error('Zod validation error:', error.issues);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid nomination data',
          details: error.issues,
          validationErrors: error.issues.map(issue => ({
            field: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          })),
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }

    // Handle database errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      console.error('Database error code:', error.code);
      console.error('Database error details:', error.details);
      console.error('Database error hint:', error.hint);
      console.error('Database error message:', error.message);
      
      let userFriendlyMessage = 'Database error occurred';
      if (error.code === '23505') {
        userFriendlyMessage = 'A nomination with similar details already exists';
      } else if (error.code === '23503') {
        userFriendlyMessage = 'Invalid category or reference data';
      } else if (error.code === '23502') {
        userFriendlyMessage = 'Missing required field data';
      }
      
      return NextResponse.json(
        {
          success: false,
          error: userFriendlyMessage,
          details: process.env.NODE_ENV === 'development' ? {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          } : undefined,
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }

    const errorMessage = error instanceof Error ? error.message : 'Failed to submit nomination';
    console.error('Final error message:', errorMessage);

    return NextResponse.json(
      {
        success: false,
        error: errorMessage || 'An unexpected error occurred',
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : 'Unknown error') : undefined,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}