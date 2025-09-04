import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    const { batchId } = params;

    // Fetch errors for the specific batch
    const { data: errors, error } = await supabase
      .from('separated_bulk_upload_errors')
      .select('*')
      .eq('batch_id', batchId)
      .order('row_number', { ascending: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: errors || []
    });

  } catch (error) {
    console.error('Error fetching batch errors:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch batch errors' 
      },
      { status: 500 }
    );
  }
}