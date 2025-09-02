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

    try {
      // Query the nominations table directly with the current schema
      let query = supabase
        .from('nominations')
        .select('*')
        .eq('status', 'approved')
        .order('additional_votes', { ascending: false })
        .order('created_at', { ascending: false });

      if (subcategoryId) {
        query = query.eq('category', subcategoryId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data: nominees, error } = await query;

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
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      // Return demo data if database is not accessible
      return NextResponse.json({
        success: true,
        data: getDemoNomineesData(subcategoryId, limit),
        count: getDemoNomineesData(subcategoryId, limit).length,
        message: 'Demo data - database not accessible'
      });
    }

    console.log(`Found ${nominees?.length || 0} nominees`);

    // Transform nominees data from the nominations table
    const transformedNominees = (nominees || []).map((nomination: any) => {
      // Safety check
      if (!nomination) {
        console.warn('Missing nomination data');
        return null;
      }
      
      // Extract nominee data from the nomination
      const nomineeData = nomination.nominee_data || {};
      const displayName = nomineeData.name || nomineeData.displayName || 
                         (nomineeData.firstName && nomineeData.lastName ? 
                          `${nomineeData.firstName} ${nomineeData.lastName}` : '') || 
                         'Unknown';
      
      const imageUrl = nomination.image_url || nomineeData.headshotUrl || nomineeData.logoUrl || null;
      const liveUrl = nomination.live_url || '';

      return {
        // Basic nomination info
        id: nomination.id,
        nomineeId: nomination.id,
        category: nomination.category,
        type: nomination.type,
        votes: (nomination.votes || 0) + (nomination.additional_votes || 0), // Total votes
        status: 'approved' as const,
        createdAt: nomination.created_at,
        approvedAt: nomination.moderated_at,
        uniqueKey: nomination.id,

        // Display fields
        name: displayName,
        displayName: displayName,
        imageUrl: imageUrl,
        title: nomineeData.title || nomineeData.jobTitle || '',
        linkedin: nomineeData.linkedin || '',
        whyVote: nomination.why_vote_for_me || nomineeData.whyVoteForMe || nomineeData.whyMe || nomineeData.whyUs || '',
        liveUrl: liveUrl,

        // Complete nominee object with ALL available form details
        nominee: {
          id: nomination.id,
          type: nomination.type,
          name: displayName,
          displayName: displayName,
          imageUrl: imageUrl,
          
          // Contact details
          email: nomineeData.email || '',
          phone: nomineeData.phone || '',
          country: nomineeData.country || '',
          linkedin: nomineeData.linkedin || '',
          liveUrl: liveUrl,
          bio: nomineeData.bio || '',
          achievements: nomineeData.achievements || '',
          socialMedia: nomineeData.socialMedia || '',

          // Person-specific fields
          ...(nomination.type === 'person' ? {
            firstName: nomineeData.firstName || '',
            lastName: nomineeData.lastName || '',
            jobTitle: nomineeData.jobTitle || nomineeData.title || '',
            title: nomineeData.jobTitle || nomineeData.title || '',
            company: nomineeData.company || '',
            headshotUrl: nomineeData.headshotUrl || imageUrl || '',
            whyMe: nomineeData.whyMe || nomineeData.whyVoteForMe || ''
          } : {}),

          // Company-specific fields  
          ...(nomination.type === 'company' ? {
            companyName: nomineeData.name || nomineeData.companyName || '',
            companyDomain: nomineeData.domain || nomineeData.companyDomain || '',
            companyWebsite: nomineeData.website || nomineeData.companyWebsite || '',
            website: nomineeData.website || nomineeData.companyWebsite || '',
            companySize: nomineeData.size || nomineeData.companySize || '',
            industry: nomineeData.industry || nomineeData.companyIndustry || '',
            logoUrl: nomineeData.logoUrl || imageUrl || '',
            whyUs: nomineeData.whyUs || nomineeData.whyVoteForMe || ''
          } : {}),

          // Computed fields for easy access
          whyVote: nomination.why_vote_for_me || nomineeData.whyVoteForMe || nomineeData.whyMe || nomineeData.whyUs || ''
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