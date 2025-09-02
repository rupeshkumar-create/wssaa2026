import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Demo data function for when database is not configured
function getDemoNomineesData(subcategoryId?: string, limit?: number) {
  const demoData = [
    {
      id: 'demo-1',
      nomineeId: 'demo-nominee-1',
      category: subcategoryId || 'best-staffing-firm',
      categoryGroup: 'staffing',
      type: 'company',
      votes: 150,
      status: 'approved' as const,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      uniqueKey: 'demo-1',
      name: 'Demo Staffing Solutions',
      displayName: 'Demo Staffing Solutions',
      imageUrl: null,
      title: 'Leading Staffing Agency',
      linkedin: '',
      whyVote: 'Exceptional service and innovative solutions',
      liveUrl: 'https://demo-company.com',
      nominee: {
        id: 'demo-nominee-1',
        type: 'company',
        name: 'Demo Staffing Solutions',
        displayName: 'Demo Staffing Solutions',
        imageUrl: null,
        email: 'contact@demo-company.com',
        phone: '',
        country: 'United States',
        linkedin: '',
        liveUrl: 'https://demo-company.com',
        bio: 'A leading staffing agency with innovative solutions',
        achievements: 'Industry leader for 5+ years',
        socialMedia: '',
        companyName: 'Demo Staffing Solutions',
        companyDomain: 'demo-company.com',
        companyWebsite: 'https://demo-company.com',
        companySize: '100-500',
        industry: 'Staffing & Recruiting',
        logoUrl: null,
        whyUs: 'We provide exceptional staffing solutions',
        whyVote: 'Exceptional service and innovative solutions',
        titleOrIndustry: 'Leading Staffing Agency'
      },
      nominator: {
        name: 'Anonymous',
        email: '',
        displayName: 'Anonymous'
      }
    }
  ];

  let filteredData = demoData;
  if (subcategoryId) {
    filteredData = demoData.filter(item => item.category === subcategoryId);
  }
  if (limit) {
    filteredData = filteredData.slice(0, limit);
  }
  
  return filteredData;
}

/**
 * GET /api/nominees - Get approved nominees with complete form details
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subcategoryId = searchParams.get('subcategoryId') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    console.log('Fetching nominees with params:', { subcategoryId, limit });

    // Check if Supabase is configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.log('Supabase not configured, returning demo data');
      return NextResponse.json({
        success: true,
        data: getDemoNomineesData(subcategoryId, limit),
        count: getDemoNomineesData(subcategoryId, limit).length,
        message: 'Demo data - database not configured'
      });
    }

    // Query nominations with joined nominee and nominator data
    let query = supabase
      .from('nominations')
      .select(`
        *,
        nominees!inner(*),
        nominators!inner(*)
      `)
      .eq('state', 'approved')  // Use 'state' instead of 'status' to match current schema
      .order('additional_votes', { ascending: false })
      .order('created_at', { ascending: false });

    if (subcategoryId) {
      query = query.eq('subcategory_id', subcategoryId);  // Use subcategory_id instead of category
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data: nominations, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      // Return demo data if query fails
      return NextResponse.json({
        success: true,
        data: getDemoNomineesData(subcategoryId, limit),
        count: getDemoNomineesData(subcategoryId, limit).length,
        message: 'Demo data - database query failed'
      });
    }

    console.log(`Found ${nominations?.length || 0} approved nominations`);

    // Transform nominations data with joined nominee and nominator data
    const transformedNominees = (nominations || []).map((nomination: any) => {
      // Safety check
      if (!nomination || !nomination.nominees) {
        console.warn('Missing nomination or nominee data');
        return null;
      }
      
      // Extract nominee data from the joined table
      const nominee = nomination.nominees;
      const nominator = nomination.nominators;
      
      const displayName = nominee.type === 'person' 
        ? `${nominee.firstname || ''} ${nominee.lastname || ''}`.trim()
        : nominee.company_name || 'Unknown';
      
      const imageUrl = nominee.type === 'person' 
        ? nominee.headshot_url 
        : nominee.logo_url;
      
      const liveUrl = nominee.live_url || nomination.live_url || '';

      return {
        // Basic nomination info
        id: nomination.id,
        nomineeId: nominee.id,
        category: nomination.subcategory_id,
        categoryGroup: nomination.category_group_id,
        type: nominee.type,
        votes: (nomination.votes || 0) + (nomination.additional_votes || 0), // Total votes
        status: 'approved' as const,
        createdAt: nomination.created_at,
        approvedAt: nomination.approved_at,
        uniqueKey: nomination.id,

        // Display fields
        name: displayName,
        displayName: displayName,
        imageUrl: imageUrl,
        title: nominee.type === 'person' ? nominee.jobtitle : 'Company',
        linkedin: nominee.type === 'person' ? nominee.person_linkedin : nominee.company_linkedin,
        whyVote: nominee.type === 'person' ? nominee.why_me : nominee.why_us,
        liveUrl: liveUrl,

        // Complete nominee object with ALL available form details
        nominee: {
          id: nominee.id,
          type: nominee.type,
          name: displayName,
          displayName: displayName,
          imageUrl: imageUrl,
          
          // Contact details
          email: nominee.type === 'person' ? nominee.person_email : nominee.company_email,
          phone: nominee.type === 'person' ? nominee.person_phone : nominee.company_phone,
          country: nominee.type === 'person' ? nominee.person_country : nominee.company_country,
          linkedin: nominee.type === 'person' ? nominee.person_linkedin : nominee.company_linkedin,
          liveUrl: liveUrl,
          bio: nominee.bio || '',
          achievements: nominee.achievements || '',
          socialMedia: nominee.social_media || '',

          // Person-specific fields
          ...(nominee.type === 'person' ? {
            firstName: nominee.firstname || '',
            lastName: nominee.lastname || '',
            jobTitle: nominee.jobtitle || '',
            title: nominee.jobtitle || '',
            company: nominee.person_company || '',
            headshotUrl: nominee.headshot_url || '',
            whyMe: nominee.why_me || ''
          } : {}),

          // Company-specific fields  
          ...(nominee.type === 'company' ? {
            companyName: nominee.company_name || '',
            companyDomain: nominee.company_domain || '',
            companyWebsite: nominee.company_website || '',
            website: nominee.company_website || '',
            companySize: nominee.company_size || '',
            industry: nominee.company_industry || '',
            logoUrl: nominee.logo_url || '',
            whyUs: nominee.why_us || ''
          } : {}),

          // Computed fields for easy access
          whyVote: nominee.type === 'person' ? nominee.why_me : nominee.why_us,
          titleOrIndustry: nominee.type === 'person' ? nominee.jobtitle : nominee.company_industry
        },

        // Legacy nominator info (anonymous in public view)
        nominator: {
          name: 'Anonymous',
          email: '',
          displayName: 'Anonymous'
        }
      };
    }).filter(Boolean); // Remove any null entries

    return NextResponse.json({
      success: true,
      data: transformedNominees,
      count: transformedNominees.length,
      message: `Found ${transformedNominees.length} approved nominees${subcategoryId ? ` in category ${subcategoryId}` : ''}`
    });

  } catch (error) {
    console.error('GET /api/nominees error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nominees',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}