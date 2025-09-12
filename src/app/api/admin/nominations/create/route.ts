import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/nominations/create - Create admin nomination (goes to draft first)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Admin nomination creation request:', body);

    const {
      type,
      subcategory_id,
      category_group_id,
      // Person fields
      firstname,
      lastname,
      jobtitle,
      person_email,
      person_linkedin,
      person_phone,
      person_company,
      person_country,
      headshot_url,
      why_me,
      bio,
      achievements,
      // Company fields
      company_name,
      company_website,
      company_linkedin,
      company_email,
      company_phone,
      company_country,
      company_size,
      company_industry,
      logo_url,
      why_us,
      // Admin fields
      admin_notes,
      created_by = 'admin'
    } = body;

    // Validate required fields
    if (!type || !subcategory_id || !category_group_id) {
      return NextResponse.json(
        { error: 'Type, subcategory_id, and category_group_id are required' },
        { status: 400 }
      );
    }

    if (type === 'person') {
      if (!firstname || !lastname || !jobtitle || !person_email || !why_me) {
        return NextResponse.json(
          { error: 'For person nominations: firstname, lastname, jobtitle, person_email, and why_me are required' },
          { status: 400 }
        );
      }
    } else if (type === 'company') {
      if (!company_name || !company_website || !why_us) {
        return NextResponse.json(
          { error: 'For company nominations: company_name, company_website, and why_us are required' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Type must be either "person" or "company"' },
        { status: 400 }
      );
    }

    console.log('🔄 Creating nomination directly (bypassing admin_nominations view)...');

    // 1. Create or get admin nominator
    const nominatorData = {
      email: 'admin@worldstaffingawards.com',
      firstname: 'Admin',
      lastname: 'User',
      linkedin: 'https://linkedin.com/company/world-staffing-awards',
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
      type,
      bio: bio || null,
      achievements: achievements || null
    };

    if (type === 'person') {
      nomineeData.firstname = firstname;
      nomineeData.lastname = lastname;
      nomineeData.person_email = person_email;
      nomineeData.person_linkedin = person_linkedin || null;
      nomineeData.person_phone = person_phone || null;
      nomineeData.jobtitle = jobtitle;
      nomineeData.person_company = person_company || null;
      nomineeData.person_country = person_country || null;
      nomineeData.headshot_url = headshot_url || null;
      nomineeData.why_me = why_me;
    } else {
      nomineeData.company_name = company_name;
      nomineeData.company_website = company_website;
      nomineeData.company_linkedin = company_linkedin || null;
      nomineeData.company_email = company_email || null;
      nomineeData.company_phone = company_phone || null;
      nomineeData.company_country = company_country || null;
      nomineeData.company_size = company_size || null;
      nomineeData.company_industry = company_industry || null;
      nomineeData.logo_url = logo_url || null;
      nomineeData.why_us = why_us;
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

    // 3. Create nomination (directly approved for admin nominations)
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id,
      subcategory_id,
      state: 'approved', // Admin nominations are auto-approved
      admin_notes: admin_notes || 'Created via admin panel',
      approved_at: new Date().toISOString(),
      approved_by: created_by,
      votes: 0,

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

    console.log('✅ Admin nomination created successfully:', nomination.id);

    return NextResponse.json({
      success: true,
      nomination,
      nominee,
      nominator,
      message: 'Admin nomination created and approved successfully'
    });

  } catch (error) {
    console.error('❌ Admin nomination creation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create admin nomination' },
      { status: 500 }
    );
  }
}