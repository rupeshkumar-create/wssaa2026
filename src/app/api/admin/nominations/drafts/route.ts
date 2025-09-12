import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/nominations/drafts - Get all draft nominations
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📋 Fetching draft nominations...');

    const { data: drafts, error } = await supabase
      .from('admin_nominations')
      .select(`
        *,
        subcategories (
          id,
          name,
          category_groups (
            id,
            name
          )
        )
      `)
      .eq('state', 'draft')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Database error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    console.log(`✅ Found ${drafts?.length || 0} draft nominations`);

    return NextResponse.json({
      success: true,
      data: drafts || [],
      count: drafts?.length || 0
    });

  } catch (error) {
    console.error('❌ Draft nominations API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch draft nominations' },
      { status: 500 }
    );
  }
}