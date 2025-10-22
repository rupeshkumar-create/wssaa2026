import { NextRequest, NextResponse } from 'next/server';
import { supabase as supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/top-nominees - Enhanced analytics with leaderboards and stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const type = searchParams.get('type'); // 'person', 'company', or null for all
    const limit = parseInt(searchParams.get('limit') || '10');
    const includeStats = searchParams.get('includeStats') === 'true';

    // If no category specified, return overall leaderboard and stats
    if (!category) {
      // Get overall top nominees across all categories using the admin view
      let nomineesQuery = supabaseAdmin
        .from('admin_nominations')
        .select(`
          nomination_id,
          nominee_type,
          nominee_firstname,
          nominee_lastname,
          nominee_jobtitle,
          nominee_person_email,
          nominee_person_linkedin,
          nominee_headshot_url,
          nominee_why_me,
          nominee_company_name,
          nominee_company_website,
          nominee_company_linkedin,
          nominee_logo_url,
          nominee_why_us,
          nominee_live_url,
          votes,
          additional_votes,
          subcategory_id,
          state,
          created_at
        `)
        .eq('state', 'approved');

      // Add type filter if specified
      if (type && ['person', 'company'].includes(type)) {
        nomineesQuery = nomineesQuery.eq('nominee_type', type);
      }

      const { data: topNominees, error: nomineesError } = await nomineesQuery
        .order('votes', { ascending: false })
        .limit(limit);

      if (nomineesError) {
        throw new Error(`Failed to get nominees: ${nomineesError.message}`);
      }

      // Get category-wise leaderboards
      const { data: categoryStats, error: categoryError } = await supabaseAdmin
        .from('admin_nominations')
        .select(`
          subcategory_id,
          nominee_type,
          nominee_firstname,
          nominee_lastname,
          nominee_company_name,
          votes,
          additional_votes
        `)
        .eq('state', 'approved')
        .order('votes', { ascending: false });

      if (categoryError) {
        throw new Error(`Failed to get category stats: ${categoryError.message}`);
      }

      // Process category leaderboards
      const categoryLeaderboards: Record<string, any[]> = {};
      categoryStats?.forEach(nominee => {
        if (!categoryLeaderboards[nominee.subcategory_id]) {
          categoryLeaderboards[nominee.subcategory_id] = [];
        }
        if (categoryLeaderboards[nominee.subcategory_id].length < 5) {
          const displayName = nominee.nominee_type === 'person' 
            ? `${nominee.nominee_firstname || ''} ${nominee.nominee_lastname || ''}`.trim()
            : nominee.nominee_company_name || 'Unknown';
          
          categoryLeaderboards[nominee.subcategory_id].push({
            displayName,
            type: nominee.nominee_type,
            votes: nominee.votes || 0,
            additionalVotes: nominee.additional_votes || 0,
            totalVotes: (nominee.votes || 0) + (nominee.additional_votes || 0)
          });
        }
      });

      // Calculate enhanced stats if requested
      let stats = null;
      if (includeStats) {
        const { data: allNominations } = await supabaseAdmin
          .from('admin_nominations')
          .select('*');

        const totalNominations = allNominations?.length || 0;
        const approvedNominations = allNominations?.filter(n => n.state === 'approved').length || 0;
        const totalVotes = allNominations?.reduce((sum, n) => sum + (n.votes || 0), 0) || 0;
        const totalAdditionalVotes = allNominations?.reduce((sum, n) => sum + (n.additional_votes || 0), 0) || 0;

        stats = {
          totalNominations,
          approvedNominations,
          pendingNominations: allNominations?.filter(n => n.state === 'submitted').length || 0,
          rejectedNominations: allNominations?.filter(n => n.state === 'rejected').length || 0,
          totalVotes: totalVotes + totalAdditionalVotes,
          realVotes: totalVotes,
          additionalVotes: totalAdditionalVotes,
          averageVotesPerNominee: approvedNominations > 0 ? Math.round((totalVotes + totalAdditionalVotes) / approvedNominations) : 0,
          conversionRate: totalNominations > 0 ? Math.round((approvedNominations / totalNominations) * 100) : 0,
          activeCategories: Object.keys(categoryLeaderboards).length,
          lastUpdated: new Date().toISOString()
        };
      }

      // Format overall leaderboard
      const formattedNominees = topNominees?.map((nominee, index) => {
        const displayName = nominee.nominee_type === 'person' 
          ? `${nominee.nominee_firstname || ''} ${nominee.nominee_lastname || ''}`.trim()
          : nominee.nominee_company_name || 'Unknown';
          
        return {
          id: nominee.nomination_id,
          nominationId: nominee.nomination_id,
          rank: index + 1,
          type: nominee.nominee_type,
          displayName,
          imageUrl: nominee.nominee_headshot_url || nominee.nominee_logo_url,
          votes: nominee.votes || 0,
          additionalVotes: nominee.additional_votes || 0,
          totalVotes: (nominee.votes || 0) + (nominee.additional_votes || 0),
          category: nominee.subcategory_id,
          
          // Person fields
          firstname: nominee.nominee_firstname,
          lastname: nominee.nominee_lastname,
          email: nominee.nominee_person_email,
          linkedin: nominee.nominee_person_linkedin,
          jobtitle: nominee.nominee_jobtitle,
          headshotUrl: nominee.nominee_headshot_url,
          whyMe: nominee.nominee_why_me,
          
          // Company fields
          companyName: nominee.nominee_company_name,
          companyWebsite: nominee.nominee_company_website,
          companyLinkedin: nominee.nominee_company_linkedin,
          logoUrl: nominee.nominee_logo_url,
          whyUs: nominee.nominee_why_us,
          
          // Shared fields
          liveUrl: nominee.nominee_live_url,
          state: nominee.state,
          createdAt: nominee.created_at
        };
      })) || [];

      return NextResponse.json({
        success: true,
        data: {
          overallLeaderboard: formattedNominees,
          categoryLeaderboards,
          stats
        },
        count: formattedNominees.length,
        totalCategories: Object.keys(categoryLeaderboards).length
      });
    }

    // Category-specific leaderboard
    const { data: topNominees, error } = await supabaseAdmin
      .from('admin_nominations')
      .select(`
        nomination_id,
        nominee_type,
        nominee_firstname,
        nominee_lastname,
        nominee_jobtitle,
        nominee_person_email,
        nominee_person_linkedin,
        nominee_headshot_url,
        nominee_why_me,
        nominee_company_name,
        nominee_company_website,
        nominee_company_linkedin,
        nominee_logo_url,
        nominee_why_us,
        nominee_live_url,
        votes,
        additional_votes,
        subcategory_id,
        state,
        created_at
      `)
      .eq('subcategory_id', category)
      .eq('state', 'approved')
      .order('votes', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to get top nominees:', error);
      throw new Error(`Failed to get top nominees: ${error.message}`);
    }

    // Transform to consistent format
    const formattedNominees = topNominees?.map((nominee, index) => {
      const displayName = nominee.nominee_type === 'person' 
        ? `${nominee.nominee_firstname || ''} ${nominee.nominee_lastname || ''}`.trim()
        : nominee.nominee_company_name || 'Unknown';
        
      return {
        id: nominee.nomination_id,
        nominationId: nominee.nomination_id,
        rank: index + 1,
        type: nominee.nominee_type,
        displayName,
        imageUrl: nominee.nominee_headshot_url || nominee.nominee_logo_url,
        votes: nominee.votes || 0,
        additionalVotes: nominee.additional_votes || 0,
        totalVotes: (nominee.votes || 0) + (nominee.additional_votes || 0),
        category: nominee.subcategory_id,
        
        // Person fields
        firstname: nominee.nominee_firstname,
        lastname: nominee.nominee_lastname,
        email: nominee.nominee_person_email,
        linkedin: nominee.nominee_person_linkedin,
        jobtitle: nominee.nominee_jobtitle,
        headshotUrl: nominee.nominee_headshot_url,
        whyMe: nominee.nominee_why_me,
        
        // Company fields
        companyName: nominee.nominee_company_name,
        companyWebsite: nominee.nominee_company_website,
        companyLinkedin: nominee.nominee_company_linkedin,
        logoUrl: nominee.nominee_logo_url,
        whyUs: nominee.nominee_why_us,
        
        // Shared fields
        liveUrl: nominee.nominee_live_url,
        state: nominee.state,
        createdAt: nominee.created_at
      };
    }) || [];

    return NextResponse.json({
      success: true,
      data: formattedNominees,
      category,
      count: formattedNominees.length
    });

  } catch (error) {
    console.error('GET /api/admin/top-nominees error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get top nominees' },
      { status: 500 }
    );
  }
}