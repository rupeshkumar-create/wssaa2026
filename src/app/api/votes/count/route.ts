import { NextRequest, NextResponse } from "next/server";
import { supabase as supabaseAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const nominationId = searchParams.get("nominationId");
    const nomineeId = searchParams.get("nomineeId");

    if (!nominationId && !nomineeId) {
      return NextResponse.json({ error: "nominationId or nomineeId is required" }, { status: 400 });
    }

    if (nominationId) {
      // Get both regular votes and additional votes for the nomination
      const { data: votes, error: votesError } = await supabaseAdmin
        .from('votes')
        .select('id', { count: 'exact' })
        .eq('nomination_id', nominationId);

      if (votesError) {
        console.error('Failed to count regular votes:', votesError);
        throw new Error(`Failed to count regular votes: ${votesError.message}`);
      }

      // Get additional votes from nominations table
      const { data: nomination, error: nominationError } = await supabaseAdmin
        .from('nominations')
        .select('additional_votes')
        .eq('id', nominationId)
        .single();

      if (nominationError) {
        console.error('Failed to get nomination data:', nominationError);
        throw new Error(`Failed to get nomination data: ${nominationError.message}`);
      }

      const regularVotes = votes?.length || 0;
      const additionalVotes = nomination?.additional_votes || 0;
      const totalVotes = regularVotes + additionalVotes;

      return NextResponse.json({ 
        success: true,
        data: {
          count: totalVotes,
          total: totalVotes,
          regularVotes,
          additionalVotes
        },
        nominationId
      });

    } else if (nomineeId) {
      // If using nomineeId, we need to join with nominations to get the nomination_id
      const { data: nominations } = await supabaseAdmin
        .from('nominations')
        .select('id, additional_votes')
        .eq('nominee_id', nomineeId);
      
      if (!nominations || nominations.length === 0) {
        return NextResponse.json({ 
          success: true,
          data: { count: 0, total: 0, regularVotes: 0, additionalVotes: 0 },
          nomineeId 
        });
      }

      // Count regular votes for all nominations of this nominee
      const nominationIds = nominations.map(n => n.id);
      const { data: votes, error: votesError } = await supabaseAdmin
        .from('votes')
        .select('id', { count: 'exact' })
        .in('nomination_id', nominationIds);

      if (votesError) {
        console.error('Failed to count votes:', votesError);
        throw new Error(`Failed to count votes: ${votesError.message}`);
      }

      const regularVotes = votes?.length || 0;
      const additionalVotes = nominations.reduce((sum, nom) => sum + (nom.additional_votes || 0), 0);
      const totalVotes = regularVotes + additionalVotes;

      return NextResponse.json({ 
        success: true,
        data: {
          count: totalVotes,
          total: totalVotes,
          regularVotes,
          additionalVotes
        },
        nomineeId
      });
    }

  } catch (error) {
    console.error("Vote count error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}