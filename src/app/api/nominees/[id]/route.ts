import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * Helper function to get total votes (real votes + additional votes)
 */
async function getTotalVotes(nominationId: string, additionalVotes: number = 0): Promise<number> {
  try {
    const { data: votes, error } = await supabase
      .from('votes')
      .select('id')
      .eq('nomination_id', nominationId);
    
    if (error) {
      console.error('Error fetching votes:', error);
      return additionalVotes; // Return just additional votes if query fails
    }
    
    const realVotes = votes?.length || 0;
    return realVotes + additionalVotes;
  } catch (error) {
    console.error('Error calculating total votes:', error);
    return additionalVotes;
  }
}

/**
 * GET /api/nominees/[id] - Get specific nominee by flexible identifier
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: identifier } = await params;
    
    if (!identifier) {
      return NextResponse.json(
        { success: false, error: 'Nominee identifier is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Looking for nominee with identifier:', identifier);

    // Try multiple lookup strategies
    let nominee = null;
    
    // Strategy 1: Direct ID lookup
    const { data: directMatch, error: directError } = await supabase
      .from('nominations')
      .select('*, nominees(*)')
      .eq('id', identifier)
      .eq('state', 'approved')
      .single();
    
    if (directMatch && !directError) {
      nominee = directMatch;
      console.log('✅ Found by direct ID match');
    } else {
      // Strategy 2: Search by live_url path
      const { data: urlMatches, error: urlError } = await supabase
        .from('nominations')
        .select('*, nominees(*)')
        .eq('state', 'approved')
        .like('live_url', `%${identifier}%`);
      
      if (urlMatches && urlMatches.length > 0 && !urlError) {
        nominee = urlMatches[0];
        console.log('✅ Found by live URL match');
      } else {
        // Strategy 3: Search all approved nominations and match by name/slug
        const { data: allNominees, error: allError } = await supabase
          .from('nominations')
          .select('*, nominees(*)')
          .eq('state', 'approved');
        
        if (allNominees && !allError) {
          nominee = allNominees.find((n: any) => {
            const nomineeData = n.nominees;
            const displayName = nomineeData?.firstname && nomineeData?.lastname ? 
                               `${nomineeData.firstname} ${nomineeData.lastname}` : 
                               nomineeData?.company_name || '';
            const nameSlug = displayName
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .trim();
            return nameSlug === identifier.toLowerCase();
          });
          
          if (nominee) {
            console.log('✅ Found by name slug match');
          }
        }
      }
    }

    if (!nominee) {
      console.log('❌ Nominee not found with identifier:', identifier);
      return NextResponse.json(
        { success: false, error: 'Nominee not found' },
        { status: 404 }
      );
    }
    const nomineeData = nominee.nominees;
    
    console.log('✅ Found nominee:', nomineeData?.firstname, nomineeData?.lastname || nomineeData?.company_name);

    // Transform nominee data to match expected format
    const displayName = nomineeData?.firstname && nomineeData?.lastname ? 
                       `${nomineeData.firstname} ${nomineeData.lastname}` : 
                       nomineeData?.company_name || '';

    const transformedNominee = {
      // Basic nomination info
      id: nominee.id,
      nomineeId: nominee.id,
      category: nominee.subcategory_id,
      type: nomineeData?.type,
      votes: await getTotalVotes(nominee.id, nominee.additional_votes || 0),
      additionalVotes: nominee.additional_votes || 0,
      status: nominee.state,
      createdAt: nominee.created_at,
      approvedAt: nominee.approved_at,
      uniqueKey: nominee.id,

      // Display fields
      name: displayName,
      displayName: displayName,
      imageUrl: nomineeData?.headshot_url || nomineeData?.logo_url || '',
      title: nomineeData?.jobtitle || '',
      linkedin: nomineeData?.person_linkedin || nomineeData?.company_linkedin || '',
      whyVote: nomineeData?.why_me || nomineeData?.why_us || '',
      liveUrl: nominee.live_url || '',

      // Complete nominee object with ALL available form details
      nominee: {
        id: nominee.nominee_id,
        type: nomineeData?.type,
        name: displayName,
        displayName: displayName,
        imageUrl: nomineeData?.headshot_url || nomineeData?.logo_url || '',
        
        // Contact details
        email: nomineeData?.person_email || nomineeData?.company_email || '',
        phone: nomineeData?.person_phone || nomineeData?.company_phone || '',
        country: nomineeData?.person_country || nomineeData?.company_country || '',
        linkedin: nomineeData?.person_linkedin || nomineeData?.company_linkedin || '',
        liveUrl: nominee.live_url || nomineeData?.live_url || '',
        bio: nomineeData?.bio || '',
        achievements: nomineeData?.achievements || '',
        socialMedia: nomineeData?.social_media || '',

        // Person-specific fields
        ...(nomineeData?.type === 'person' ? {
          firstName: nomineeData?.firstname || '',
          lastName: nomineeData?.lastname || '',
          jobTitle: nomineeData?.jobtitle || '',
          title: nomineeData?.jobtitle || '',
          company: nomineeData?.person_company || '',
          headshotUrl: nomineeData?.headshot_url || '',
          whyMe: nomineeData?.why_me || '',
          whyVoteForMe: nomineeData?.why_me || ''
        } : {}),

        // Company-specific fields  
        ...(nomineeData?.type === 'company' ? {
          companyName: nomineeData?.company_name || '',
          companyDomain: nomineeData?.company_domain || '',
          companyWebsite: nomineeData?.company_website || '',
          website: nomineeData?.company_website || '',
          companySize: nomineeData?.company_size || '',
          industry: nomineeData?.company_industry || '',
          logoUrl: nomineeData?.logo_url || '',
          whyUs: nomineeData?.why_us || '',
          whyVoteForMe: nomineeData?.why_us || ''
        } : {}),

        // Computed fields for easy access
        whyVote: nomineeData?.why_me || nomineeData?.why_us || ''
      },

      // Legacy nominator info (anonymous in public view)
      nominator: {
        name: 'Anonymous',
        email: '',
        displayName: 'Anonymous'
      }
    };

    return NextResponse.json({
      success: true,
      data: transformedNominee,
      message: `Found nominee: ${displayName}`
    });

  } catch (error) {
    console.error('GET /api/nominees/[id] error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get nominee',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}