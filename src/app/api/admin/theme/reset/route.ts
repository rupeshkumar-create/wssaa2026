import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Reset all colors to default values
export async function POST() {
  try {
    // Update all colors to their default values
    const { data: resetColors, error } = await supabase
      .from('theme_settings')
      .update({ 
        color_value: supabase.raw('default_value'),
        updated_at: new Date().toISOString()
      })
      .neq('id', 0) // Update all records
      .select();

    if (error) {
      console.error('Error resetting theme colors:', error);
      return NextResponse.json(
        { error: 'Failed to reset theme colors' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reset_count: resetColors?.length || 0,
      message: 'All colors reset to default values'
    });

  } catch (error) {
    console.error('Theme reset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}