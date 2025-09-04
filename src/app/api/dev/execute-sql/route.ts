import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST - Execute SQL (Development only)
export async function POST(request: NextRequest) {
  try {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { sql } = body;

    if (!sql) {
      return NextResponse.json(
        { error: 'SQL is required' },
        { status: 400 }
      );
    }

    console.log('🔧 Executing SQL:', sql.substring(0, 100) + '...');

    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('SQL execution error:', error);
      return NextResponse.json(
        { error: 'SQL execution failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SQL executed successfully',
      data
    });

  } catch (error) {
    console.error('SQL execution error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}