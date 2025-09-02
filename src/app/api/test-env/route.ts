import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const environment = {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      timestamp: new Date().toISOString(),
      
      // Database
      supabase: {
        hasUrl: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        hasAnonKey: !!process.env.SUPABASE_ANON_KEY,
        hasServiceKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.supabaseKey),
        url: (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) ? 
             `${(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL)!.slice(0, 20)}...` : 'Not set',
        configured: !!(
          (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && 
          process.env.SUPABASE_ANON_KEY && 
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.supabaseKey)
        )
      },
      
      // HubSpot
      hubspot: {
        enabled: process.env.HUBSPOT_SYNC_ENABLED === 'true',
        hasToken: !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN),
        syncEnabled: process.env.HUBSPOT_SYNC_ENABLED,
        tokenSource: process.env.HUBSPOT_ACCESS_TOKEN ? 'HUBSPOT_ACCESS_TOKEN' : 
                    process.env.HUBSPOT_TOKEN ? 'HUBSPOT_TOKEN' : 'None',
        configured: process.env.HUBSPOT_SYNC_ENABLED === 'true' && 
                   !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN),
        linkedinKey: process.env.HUBSPOT_CONTACT_LINKEDIN_KEY || 'linkedin (default)',
        pipelineId: process.env.HUBSPOT_PIPELINE_ID || 'default-pipeline (default)'
      },
      
      // Loops
      loops: {
        enabled: process.env.LOOPS_SYNC_ENABLED === 'true',
        hasToken: !!process.env.LOOPS_API_KEY,
        syncEnabled: process.env.LOOPS_SYNC_ENABLED,
        configured: process.env.LOOPS_SYNC_ENABLED === 'true' && !!process.env.LOOPS_API_KEY
      },
      
      // Admin
      admin: {
        hasPassword: !!process.env.ADMIN_PASSWORD_HASH,
        configured: !!process.env.ADMIN_PASSWORD_HASH
      },
      
      // Overall status
      status: {
        ready: !!(
          (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL) && 
          process.env.SUPABASE_ANON_KEY && 
          (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.supabaseKey) &&
          process.env.ADMIN_PASSWORD_HASH
        ),
        hubspotReady: process.env.HUBSPOT_SYNC_ENABLED === 'true' && 
                     !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN),
        loopsReady: process.env.LOOPS_SYNC_ENABLED === 'true' && !!process.env.LOOPS_API_KEY
      },
      
      // Legacy env check for compatibility
      env: {
        NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        SUPABASE_URL: !!process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        SUPABASE_KEY: !!process.env.SUPABASE_KEY,
        supabaseKey: !!process.env.supabaseKey,
        HUBSPOT_ACCESS_TOKEN: !!process.env.HUBSPOT_ACCESS_TOKEN,
        HUBSPOT_TOKEN: !!process.env.HUBSPOT_TOKEN,
        HUBSPOT_SYNC_ENABLED: process.env.HUBSPOT_SYNC_ENABLED,
        LOOPS_API_KEY: !!process.env.LOOPS_API_KEY,
        LOOPS_SYNC_ENABLED: process.env.LOOPS_SYNC_ENABLED,
        NODE_ENV: process.env.NODE_ENV,
        supabase_url_available: !!(process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL),
        supabase_key_available: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.supabaseKey),
      }
    };

    return NextResponse.json({
      message: 'Environment variables check - Enhanced diagnostics',
      ...environment
    });
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}