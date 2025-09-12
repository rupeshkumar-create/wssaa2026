import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const nomineeId = params.id;

    // Get nominee data from nominations table (same as individual nominee API)
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominations')
      .select('*')
      .eq('id', nomineeId)
      .eq('state', 'approved')
      .single();

    if (nomineeError || !nominee) {
      return NextResponse.json({ error: 'Nominee not found' }, { status: 404 });
    }

    // Get total votes for this nominee (using nomination_id since that's what the votes table references)
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('created_at')
      .eq('nomination_id', nomineeId);

    if (votesError) {
      return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
    }

    const realVotes = votes?.length || 0;
    const additionalVotes = nominee.additional_votes || 0;
    const totalVotes = realVotes + additionalVotes;

    // Calculate votes in the last week (including portion of additional votes)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentRealVotes = votes?.filter(vote => 
      new Date(vote.created_at) > oneWeekAgo
    ).length || 0;
    
    // Calculate days since nomination (used for vote momentum calculation)
    const createdDate = new Date(nominee.created_at);
    const daysSinceCreated = Math.max(1, Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24)));
    
    // For vote momentum, include a portion of additional votes to show activity
    // This simulates that additional votes were distributed over time
    const additionalVotesPerDay = additionalVotes / Math.max(daysSinceCreated, 7); // Spread over creation period or 7 days minimum
    const estimatedAdditionalVotesThisWeek = Math.min(Math.floor(additionalVotesPerDay * 7), additionalVotes);
    
    // Combine real recent votes with estimated additional votes for momentum
    const recentVotes = recentRealVotes + (recentRealVotes > 0 ? estimatedAdditionalVotesThisWeek : Math.min(5, additionalVotes));

    // Get category ranking from nominations table
    const { data: categoryNominees, error: categoryError } = await supabase
      .from('nominations')
      .select('id, additional_votes')
      .eq('subcategory_id', nominee.subcategory_id)
      .eq('state', 'approved')
      .order('additional_votes', { ascending: false });

    let categoryRank = 1;
    let totalInCategory = 1;
    
    if (!categoryError && categoryNominees) {
      totalInCategory = categoryNominees.length;
      
      // Calculate total votes for each nominee and sort
      const nomineesWithTotalVotes = await Promise.all(
        categoryNominees.map(async (n) => {
          const { data: nVotes } = await supabase
            .from('votes')
            .select('id')
            .eq('nomination_id', n.id);
          const nRealVotes = nVotes?.length || 0;
          const nTotalVotes = nRealVotes + (n.additional_votes || 0);
          return { id: n.id, totalVotes: nTotalVotes };
        })
      );
      
      // Sort by total votes descending
      nomineesWithTotalVotes.sort((a, b) => b.totalVotes - a.totalVotes);
      
      // Find current nominee's rank
      const nomineeIndex = nomineesWithTotalVotes.findIndex(n => n.id === nomineeId);
      categoryRank = nomineeIndex >= 0 ? nomineeIndex + 1 : 1;
    }
    
    console.log('Days calculation:', {
      nomineeId,
      createdAt: nominee.created_at,
      createdDate: createdDate.toISOString(),
      daysSinceCreated
    });

    // Calculate trending percentage (top 10%, 25%, etc.)
    const trendingPercentile = categoryRank <= Math.ceil(totalInCategory * 0.1) ? 'Top 10%' :
                              categoryRank <= Math.ceil(totalInCategory * 0.25) ? 'Top 25%' :
                              categoryRank <= Math.ceil(totalInCategory * 0.5) ? 'Top 50%' : 'Rising';

    return NextResponse.json({
      totalVotes,
      realVotes,
      additionalVotes,
      recentVotes,
      categoryRank,
      totalInCategory,
      daysSinceCreated,
      trendingPercentile,
      voteMomentum: recentVotes,
      supporters: totalVotes, // Each vote represents a supporter
    });

  } catch (error) {
    console.error('Error fetching nominee stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}