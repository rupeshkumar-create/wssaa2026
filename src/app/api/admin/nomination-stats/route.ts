import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/nomination-stats - Get nomination statistics by source
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Fetching nomination statistics...');

    // Get nomination counts by source
    const { data: sourceStats, error: sourceError } = await supabase
      .from('nominations')
      .select('nomination_source, state')
      .order('created_at', { ascending: false });

    if (sourceError) {
      console.error('❌ Database error:', sourceError);
      return NextResponse.json(
        { error: `Database error: ${sourceError.message}` },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: sourceStats.length,
      bySource: {
        admin: sourceStats.filter(n => n.nomination_source === 'admin').length,
        public: sourceStats.filter(n => n.nomination_source === 'public' || !n.nomination_source).length
      },
      byState: {
        submitted: sourceStats.filter(n => n.state === 'submitted').length,
        approved: sourceStats.filter(n => n.state === 'approved').length,
        rejected: sourceStats.filter(n => n.state === 'rejected').length
      },
      bySourceAndState: {
        admin: {
          submitted: sourceStats.filter(n => n.nomination_source === 'admin' && n.state === 'submitted').length,
          approved: sourceStats.filter(n => n.nomination_source === 'admin' && n.state === 'approved').length,
          rejected: sourceStats.filter(n => n.nomination_source === 'admin' && n.state === 'rejected').length
        },
        public: {
          submitted: sourceStats.filter(n => (n.nomination_source === 'public' || !n.nomination_source) && n.state === 'submitted').length,
          approved: sourceStats.filter(n => (n.nomination_source === 'public' || !n.nomination_source) && n.state === 'approved').length,
          rejected: sourceStats.filter(n => (n.nomination_source === 'public' || !n.nomination_source) && n.state === 'rejected').length
        }
      }
    };

    console.log(`✅ Statistics calculated: ${stats.total} total nominations`);

    return NextResponse.json({
      success: true,
      data: stats,
      message: `Found ${stats.total} nominations`
    });

  } catch (error) {
    console.error('❌ Nomination stats API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch nomination statistics' },
      { status: 500 }
    );
  }
}