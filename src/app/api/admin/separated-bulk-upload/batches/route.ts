import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Fetch recent upload batches
    const { data: batches, error } = await supabase
      .from('separated_bulk_upload_batches')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(20);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: batches || []
    });

  } catch (error) {
    console.error('Error fetching batches:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch batches' 
      },
      { status: 500 }
    );
  }
}