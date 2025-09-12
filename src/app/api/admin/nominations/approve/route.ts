import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/nominations/approve - Approve a draft nomination
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✅ Admin nomination approval request:', body);

    const { nominationId, approvedBy = 'admin' } = body;

    if (!nominationId) {
      return NextResponse.json(
        { error: 'Nomination ID is required' },
        { status: 400 }
      );
    }

    // Get the draft nomination
    const { data: draft, error: fetchError } = await supabase
      .from('admin_nominations')
      .select('*')
      .eq('id', nominationId)
      .eq('state', 'draft')
      .single();

    if (fetchError || !draft) {
      console.error('❌ Draft not found:', fetchError);
      return NextResponse.json(
        { error: 'Draft nomination not found' },
        { status: 404 }
      );
    }

    // Start transaction: Create nominator, nominee, and nomination
    console.log('🔄 Creating nominator, nominee, and nomination...');

    // 1. Create or get nominator (admin user)
    const nominatorData = {
      email: 'admin@worldstaffingawards.com',
      firstname: 'Admin',
      lastname: 'User',
      company: 'World Staffing Awards',
      job_title: 'Administrator',
      country: 'Global'
    };

    const { data: existingNominator } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', nominatorData.email)
      .single();

    let nominator;
    if (existingNominator) {
      nominator = existingNominator;
    } else {
      const { data: newNominator, error: nominatorError } = await supabase
        .from('nominators')
        .insert(nominatorData)
        .select()
        .single();

      if (nominatorError) {
        console.error('❌ Nominator creation error:', nominatorError);
        return NextResponse.json(
          { error: `Failed to create nominator: ${nominatorError.message}` },
          { status: 500 }
        );
      }
      nominator = newNominator;
    }

    // 2. Create nominee
    const nomineeData: any = {
      type: draft.nominee_type,
      bio: draft.nominee_bio,
      achievements: draft.nominee_achievements
    };

    if (draft.nominee_type === 'person') {
      nomineeData.firstname = draft.nominee_firstname;
      nomineeData.lastname = draft.nominee_lastname;
      nomineeData.person_email = draft.nominee_person_email;
      nomineeData.person_linkedin = draft.nominee_person_linkedin;
      nomineeData.person_phone = draft.nominee_person_phone;
      nomineeData.jobtitle = draft.nominee_jobtitle;
      nomineeData.person_company = draft.nominee_person_company;
      nomineeData.person_country = draft.nominee_person_country;
      nomineeData.headshot_url = draft.nominee_headshot_url;
      nomineeData.why_me = draft.nominee_why_me;
    } else {
      nomineeData.company_name = draft.nominee_company_name;
      nomineeData.company_website = draft.nominee_company_website;
      nomineeData.company_linkedin = draft.nominee_company_linkedin;
      nomineeData.company_phone = draft.nominee_company_phone;
      nomineeData.company_country = draft.nominee_company_country;
      nomineeData.company_size = draft.nominee_company_size;
      nomineeData.company_industry = draft.nominee_company_industry;
      nomineeData.logo_url = draft.nominee_logo_url;
      nomineeData.why_us = draft.nominee_why_us;
    }

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) {
      console.error('❌ Nominee creation error:', nomineeError);
      return NextResponse.json(
        { error: `Failed to create nominee: ${nomineeError.message}` },
        { status: 500 }
      );
    }

    // 3. Create nomination
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: draft.category_group_id,
      subcategory_id: draft.subcategory_id,
      state: 'approved',
      admin_notes: draft.admin_notes,
      approved_at: new Date().toISOString(),
      approved_by: approvedBy,
      votes: 0
    };

    const { data: nomination, error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData)
      .select()
      .single();

    if (nominationError) {
      console.error('❌ Nomination creation error:', nominationError);
      return NextResponse.json(
        { error: `Failed to create nomination: ${nominationError.message}` },
        { status: 500 }
      );
    }

    // 4. Update draft status to approved
    const { error: updateError } = await supabase
      .from('admin_nominations')
      .update({
        state: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: approvedBy
      })
      .eq('id', nominationId);

    if (updateError) {
      console.error('❌ Draft update error:', updateError);
      // Don't fail here, the nomination is already created
    }

    // 5. Send nominee approval email (with deduplication)
    let emailSent = false;
    try {
      const { loopsTransactional } = await import('@/server/loops/transactional');
      
      // Get category name for email
      const { data: categoryData } = await supabase
        .from('subcategories')
        .select('name, category_groups(name)')
        .eq('id', draft.subcategory_id)
        .single();

      const categoryName = categoryData?.category_groups?.name || 'Unknown Category';
      const subcategoryName = categoryData?.name || 'Unknown Subcategory';
      
      const nomineeDisplayName = draft.nominee_type === 'person' 
        ? `${draft.nominee_firstname || ''} ${draft.nominee_lastname || ''}`.trim()
        : draft.nominee_company_name || '';

      const nomineeEmail = draft.nominee_type === 'person' 
        ? draft.nominee_person_email 
        : draft.nominee_company_email;

      if (nomineeEmail) {
        // Check if we've already sent an approval email for this nominee recently (within 24 hours)
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: recentEmails } = await supabase
          .from('loops_outbox')
          .select('id, created_at')
          .eq('event_type', 'nominee_approved')
          .gte('created_at', twentyFourHoursAgo)
          .contains('payload', { nomineeEmail })
          .limit(1);

        if (recentEmails && recentEmails.length > 0) {
          console.log('⚠️ Nominee approval email already sent recently, skipping to prevent duplicates');
          emailSent = false; // Mark as not sent to indicate duplicate prevention
        } else {
          const emailResult = await loopsTransactional.sendNomineeApprovalEmail({
            nomineeFirstName: draft.nominee_type === 'person' ? draft.nominee_firstname : undefined,
            nomineeLastName: draft.nominee_type === 'person' ? draft.nominee_lastname : undefined,
            nomineeEmail,
            nomineeDisplayName,
            categoryName,
            subcategoryName,
            approvalTimestamp: new Date().toISOString(),
            nomineePageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://worldstaffingawards.com'}/nominee/${nominee.id}`
          });

          if (emailResult.success) {
            emailSent = true;
            console.log('✅ Nominee approval email sent successfully');
          } else {
            console.warn('⚠️ Failed to send nominee approval email:', emailResult.error);
          }
        }
      } else {
        console.warn('⚠️ No email address found for nominee, skipping approval email');
      }
    } catch (error) {
      console.warn('Email sending failed (non-blocking):', error);
    }

    // 6. Add to Loops outbox for backup sync
    try {
      const { error: loopsOutboxError } = await supabase
        .from('loops_outbox')
        .insert({
          event_type: 'nominee_approved',
          payload: {
            nominationId: nomination.id,
            nomineeId: nominee.id,
            nominatorId: nominator.id,
            type: draft.nominee_type,
            subcategoryId: draft.subcategory_id,
            categoryName,
            subcategoryName,
            nomineeDisplayName,
            nomineeEmail,
            approvalTimestamp: new Date().toISOString()
          }
        });

      if (loopsOutboxError) {
        console.warn('Failed to add to Loops outbox (non-blocking):', loopsOutboxError);
      }
    } catch (loopsOutboxError) {
      console.warn('Loops outbox not available (non-blocking):', loopsOutboxError);
    }

    console.log('✅ Admin nomination approved successfully:', nomination.id);

    return NextResponse.json({
      success: true,
      nomination,
      nominee,
      nominator,
      emailSent,
      message: 'Nomination approved successfully'
    });

  } catch (error) {
    console.error('❌ Admin nomination approval error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to approve nomination' },
      { status: 500 }
    );
  }
}