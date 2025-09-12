import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/nominations/submit - Admin-only nomination submission
 * Creates nominations in 'submitted' state for admin review (no loops sync until approval)
 */
export async function POST(request: NextRequest) {
  let body: any = {};
  try {
    body = await request.json();
    console.log('🔧 Admin nomination submission received');
    console.log('🔧 Body keys:', Object.keys(body));
    console.log('🔧 Full body:', JSON.stringify(body, null, 2));

    const {
      type,
      categoryGroupId,
      subcategoryId,
      nominator,
      nominee,
      adminNotes,
      bypassNominationStatus,
      isAdminNomination
    } = body;

    // Validate required fields
    if (!type || !categoryGroupId || !subcategoryId || !nominator || !nominee) {
      return NextResponse.json(
        { error: 'Missing required fields: type, categoryGroupId, subcategoryId, nominator, nominee' },
        { status: 400 }
      );
    }

    console.log('✅ Admin nomination validation passed');

    // 1. Create or get admin nominator
    const nominatorData: any = {
      email: nominator.email.toLowerCase(),
      firstname: nominator.firstname,
      lastname: nominator.lastname,
      linkedin: nominator.linkedin || null,
      company: nominator.company || null,
      job_title: nominator.jobTitle || null,
      phone: nominator.phone || null,
      country: nominator.country || null
    };

    const { data: existingNominator } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', nominatorData.email)
      .single();

    let nominatorRecord: any;
    if (existingNominator) {
      // Update existing nominator
      const { data: updatedNominator, error: updateError } = await supabase
        .from('nominators')
        .update(nominatorData)
        .eq('id', existingNominator.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error updating nominator:', updateError);
        throw updateError;
      }
      nominatorRecord = updatedNominator;
    } else {
      // Insert new nominator
      const { data: newNominator, error: insertError } = await supabase
        .from('nominators')
        .insert(nominatorData)
        .select()
        .single();

      if (insertError) {
        console.error('❌ Error creating nominator:', insertError);
        throw insertError;
      }
      nominatorRecord = newNominator;
    }

    console.log('✅ Nominator created/updated:', nominatorRecord.id);

    // 2. Create nominee
    const nomineeData: any = {
      type
    };

    if (type === 'person') {
      nomineeData.firstname = nominee.firstname;
      nomineeData.lastname = nominee.lastname;
      nomineeData.person_email = nominee.email || null;
      nomineeData.person_linkedin = nominee.linkedin || null;
      nomineeData.person_phone = nominee.phone || null;
      nomineeData.jobtitle = nominee.jobtitle || null;
      nomineeData.person_company = nominee.company || null;
      nomineeData.person_country = nominee.country || null;
      nomineeData.headshot_url = nominee.headshotUrl || null;
      nomineeData.why_me = nominee.whyMe || null;
      nomineeData.bio = nominee.bio || null;
      nomineeData.achievements = nominee.achievements || null;
    } else {
      nomineeData.company_name = nominee.name;
      nomineeData.company_website = nominee.website || null;
      nomineeData.company_linkedin = nominee.linkedin || null;
      nomineeData.company_email = nominee.email || null;
      nomineeData.company_phone = nominee.phone || null;
      nomineeData.company_country = nominee.country || null;
      nomineeData.company_size = nominee.size || null;
      nomineeData.company_industry = nominee.industry || null;
      nomineeData.logo_url = nominee.logoUrl || null;
      nomineeData.why_us = nominee.whyUs || null;
      nomineeData.bio = nominee.bio || null;
      nomineeData.achievements = nominee.achievements || null;
    }

    const { data: nomineeRecord, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) {
      console.error('❌ Error creating nominee:', nomineeError);
      throw nomineeError;
    }

    console.log('✅ Nominee created:', nomineeRecord.id);

    // 3. Create nomination (submitted state for admin review - no loops sync until approval)
    const nominationData: any = {
      nominator_id: nominatorRecord.id,
      nominee_id: nomineeRecord.id,
      category_group_id: categoryGroupId,
      subcategory_id: subcategoryId,
      state: 'submitted', // Admin nominations start as submitted for review
      admin_notes: adminNotes || 'Created via admin panel',
      votes: 0,
      additional_votes: 0,
      nomination_source: 'admin'
    };

    const { data: nominationRecord, error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData)
      .select()
      .single();

    if (nominationError) {
      console.error('❌ Error creating nomination:', nominationError);
      throw nominationError;
    }

    console.log('✅ Admin nomination created successfully:', nominationRecord.id);

    // Generate live URL for the nominee
    const displayName = type === 'person' 
      ? `${nominee.firstname || ''} ${nominee.lastname || ''}`.trim()
      : nominee.name || `nominee-${nomineeRecord.id}`;
    
    const slug = displayName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Get base URL - always use localhost for development
    let baseUrl = 'http://localhost:3000';
    
    // Only use production URLs if explicitly in production
    if (process.env.NODE_ENV === 'production') {
      if (process.env.VERCEL_URL) {
        baseUrl = `https://${process.env.VERCEL_URL}`;
      } else if (process.env.NEXT_PUBLIC_SITE_URL) {
        baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
      }
    }
    
    // Update nominee with live URL
    const { error: liveUrlError } = await supabase
      .from('nominees')
      .update({ live_url: `${baseUrl}/nominee/${slug}` })
      .eq('id', nomineeRecord.id);
    
    if (liveUrlError) {
      console.warn('Failed to update nominee live_url:', liveUrlError);
    }

    return NextResponse.json({
      success: true,
      nominationId: nominationRecord.id,
      nomineeId: nomineeRecord.id,
      nominatorId: nominatorRecord.id,
      state: 'submitted',
      message: 'Admin nomination created successfully and ready for approval'
    });

  } catch (error) {
    console.error('❌ Admin nomination submission error:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      body: JSON.stringify(body, null, 2)
    });
    
    // More specific error messages
    let errorMessage = 'Failed to submit admin nomination';
    if (error instanceof Error) {
      if (error.message.includes('duplicate key')) {
        errorMessage = 'A nomination with similar details already exists';
      } else if (error.message.includes('foreign key')) {
        errorMessage = 'Invalid category or reference data';
      } else if (error.message.includes('not null')) {
        errorMessage = 'Missing required field data';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}