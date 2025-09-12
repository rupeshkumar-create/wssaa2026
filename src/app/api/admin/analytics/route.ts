import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/analytics - Advanced Analytics for WSA App Performance
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching advanced analytics...');

    // Get current timestamp for calculations
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total Votes and Voting Velocity
    const { data: allVotes, error: votesError } = await supabase
      .from('votes')
      .select('created_at, vote_timestamp')
      .order('created_at', { ascending: true });

    if (votesError) {
      console.error('Error fetching votes:', votesError);
    }

    // 2. Total Nominations and Nomination Velocity
    const { data: allNominations, error: nominationsError } = await supabase
      .from('nominations')
      .select('created_at, state')
      .order('created_at', { ascending: true });

    if (nominationsError) {
      console.error('Error fetching nominations:', nominationsError);
    }

    // 3. Additional votes (manual votes)
    const { data: additionalVotesData, error: additionalVotesError } = await supabase
      .from('nominations')
      .select('additional_votes')
      .not('additional_votes', 'is', null);

    const totalAdditionalVotes = additionalVotesData?.reduce((sum, nom) => sum + (nom.additional_votes || 0), 0) || 0;

    // Calculate metrics
    const totalRealVotes = allVotes?.length || 0;
    const totalVotes = totalRealVotes + totalAdditionalVotes;
    const totalNominations = allNominations?.length || 0;
    const approvedNominations = allNominations?.filter(n => n.state === 'approved').length || 0;

    // Calculate time-based metrics
    let votingVelocity = { interval: 'N/A', description: 'No votes yet' };
    let nominationVelocity = { interval: 'N/A', description: 'No nominations yet' };

    if (allVotes && allVotes.length > 1) {
      const firstVote = new Date(allVotes[0].created_at);
      const lastVote = new Date(allVotes[allVotes.length - 1].created_at);
      const votingDurationMinutes = (lastVote.getTime() - firstVote.getTime()) / (1000 * 60);
      
      if (votingDurationMinutes > 0) {
        const minutesPerVote = votingDurationMinutes / totalRealVotes;
        if (minutesPerVote < 1) {
          votingVelocity = {
            interval: `${Math.round(60 / minutesPerVote)} votes per minute`,
            description: `We received ${Math.round(60 / minutesPerVote)} votes every minute`
          };
        } else if (minutesPerVote < 60) {
          votingVelocity = {
            interval: `1 vote every ${Math.round(minutesPerVote)} minutes`,
            description: `We received 1 vote every ${Math.round(minutesPerVote)} minutes`
          };
        } else {
          const hoursPerVote = minutesPerVote / 60;
          votingVelocity = {
            interval: `1 vote every ${Math.round(hoursPerVote)} hours`,
            description: `We received 1 vote every ${Math.round(hoursPerVote)} hours`
          };
        }
      }
    }

    if (allNominations && allNominations.length > 1) {
      const firstNomination = new Date(allNominations[0].created_at);
      const lastNomination = new Date(allNominations[allNominations.length - 1].created_at);
      const nominationDurationMinutes = (lastNomination.getTime() - firstNomination.getTime()) / (1000 * 60);
      
      if (nominationDurationMinutes > 0) {
        const minutesPerNomination = nominationDurationMinutes / totalNominations;
        if (minutesPerNomination < 60) {
          nominationVelocity = {
            interval: `1 nomination every ${Math.round(minutesPerNomination)} minutes`,
            description: `We received 1 nomination every ${Math.round(minutesPerNomination)} minutes`
          };
        } else {
          const hoursPerNomination = minutesPerNomination / 60;
          nominationVelocity = {
            interval: `1 nomination every ${Math.round(hoursPerNomination)} hours`,
            description: `We received 1 nomination every ${Math.round(hoursPerNomination)} hours`
          };
        }
      }
    }

    // Peak engagement analysis
    const hourlyVotes = Array(24).fill(0);
    const dailyVotes = {};
    
    allVotes?.forEach(vote => {
      const voteDate = new Date(vote.created_at);
      const hour = voteDate.getHours();
      const day = voteDate.toDateString();
      
      hourlyVotes[hour]++;
      dailyVotes[day] = (dailyVotes[day] || 0) + 1;
    });

    const peakHour = hourlyVotes.indexOf(Math.max(...hourlyVotes));
    const peakDay = Object.entries(dailyVotes).reduce((a, b) => dailyVotes[a[0]] > dailyVotes[b[0]] ? a : b, ['', 0]);

    // Recent activity (last 24 hours)
    const recentVotes = allVotes?.filter(vote => 
      new Date(vote.created_at) > new Date(now.getTime() - (24 * 60 * 60 * 1000))
    ).length || 0;

    const recentNominations = allNominations?.filter(nomination => 
      new Date(nomination.created_at) > new Date(now.getTime() - (24 * 60 * 60 * 1000))
    ).length || 0;

    // Conversion rate (simplified - nominations to approvals)
    const conversionRate = totalNominations > 0 ? Math.round((approvedNominations / totalNominations) * 100) : 0;

    // Geographic analysis (simplified)
    const { data: geoData, error: geoError } = await supabase
      .from('nominees')
      .select('person_country, company_country, type')
      .not('person_country', 'is', null)
      .or('person_country.not.is.null,company_country.not.is.null');

    const countryStats = {};
    geoData?.forEach(nominee => {
      const country = nominee.person_country || nominee.company_country;
      if (country) {
        countryStats[country] = (countryStats[country] || 0) + 1;
      }
    });

    const topCountries = Object.entries(countryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([country, count]) => ({ country, count }));

    // Category performance
    const { data: categoryStats, error: categoryError } = await supabase
      .from('nominations')
      .select('subcategory_id, additional_votes')
      .eq('state', 'approved');

    const categoryPerformance = {};
    categoryStats?.forEach(nom => {
      const category = nom.subcategory_id;
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { nominations: 0, votes: 0 };
      }
      categoryPerformance[category].nominations++;
      categoryPerformance[category].votes += nom.additional_votes || 0;
    });

    const topCategories = Object.entries(categoryPerformance)
      .sort(([,a], [,b]) => b.votes - a.votes)
      .slice(0, 5)
      .map(([category, stats]) => ({ category, ...stats }));

    // Build response
    const analytics = {
      // Core Metrics
      totalVotes,
      totalRealVotes,
      totalAdditionalVotes,
      totalNominations,
      approvedNominations,
      
      // Velocity Metrics
      votingVelocity,
      nominationVelocity,
      
      // Engagement Metrics
      peakEngagement: {
        hour: peakHour,
        hourDescription: `${peakHour}:00 - ${peakHour + 1}:00`,
        peakDay: peakDay[0],
        peakDayVotes: peakDay[1]
      },
      
      // Recent Activity
      recentActivity: {
        votesLast24h: recentVotes,
        nominationsLast24h: recentNominations
      },
      
      // Performance Metrics
      conversionRate,
      
      // Geographic Insights
      topCountries,
      
      // Category Performance
      topCategories,
      
      // Hourly Distribution
      hourlyDistribution: hourlyVotes.map((count, hour) => ({
        hour,
        votes: count,
        label: `${hour}:00`
      })),
      
      // Summary Stats for Dashboard
      summary: {
        totalEngagement: totalVotes + totalNominations,
        avgVotesPerNomination: totalNominations > 0 ? Math.round(totalVotes / totalNominations) : 0,
        activeCategories: Object.keys(categoryPerformance).length,
        globalReach: Object.keys(countryStats).length
      }
    };

    console.log('✅ Analytics calculated successfully');

    return NextResponse.json({
      success: true,
      data: analytics,
      generatedAt: now.toISOString(),
      message: 'Advanced analytics generated successfully'
    });

  } catch (error) {
    console.error('❌ Analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate analytics',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}