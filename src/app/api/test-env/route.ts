import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Test endpoint to check environment variables
 * GET /api/test-env
 */
export async function GET() {
  try {
    const envCheck = {
      // Admin variables
      ADMIN_EMAILS: !!process.env.ADMIN_EMAILS,
      ADMIN_PASSWORD_HASHES: !!process.env.ADMIN_PASSWORD_HASHES,
      SERVER_SESSION_SECRET: !!process.env.SERVER_SESSION_SECRET,
      
      // Database variables
      SUPABASE_URL: !!process.env.SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      
      // Security variables
      CRON_SECRET: !!process.env.CRON_SECRET,
      SYNC_SECRET: !!process.env.SYNC_SECRET,
      
      // Integration variables
      HUBSPOT_ACCESS_TOKEN: !!process.env.HUBSPOT_ACCESS_TOKEN,
      LOOPS_API_KEY: !!process.env.LOOPS_API_KEY,
      
      // Environment info
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      
      // Password hash validation
      passwordHashLength: process.env.ADMIN_PASSWORD_HASHES?.length || 0,
      passwordHashValid: process.env.ADMIN_PASSWORD_HASHES?.startsWith('$2b$') || false,
      
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // Status
      status: 'Environment variables loaded successfully'
    };
    
    return NextResponse.json(envCheck);
    
  } catch (error) {
    console.error('Environment test error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}