import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Server-only Supabase client with Service Role key
 * NEVER expose this to the browser - server-side only
 */
function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  // Support multiple environment variable names for compatibility
  const supabaseServiceRoleKey = 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_KEY || 
    process.env.supabaseKey;

  if (!supabaseUrl) {
    console.error('❌ Missing Supabase URL environment variable');
    console.error('Please set one of the following in your deployment:');
    console.error('- SUPABASE_URL');
    console.error('- NEXT_PUBLIC_SUPABASE_URL');
    throw new Error(
      'Missing Supabase URL. Please set SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL in your environment variables.'
    );
  }

  if (!supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase Service Role Key environment variable');
    console.error('Please set one of the following in your deployment:');
    console.error('- SUPABASE_SERVICE_ROLE_KEY');
    console.error('- SUPABASE_KEY');
    console.error('- supabaseKey');
    throw new Error(
      'Missing Supabase Service Role Key. Please set SUPABASE_SERVICE_ROLE_KEY, SUPABASE_KEY, or supabaseKey in your environment variables.'
    );
  }

  return createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Create client with error handling for build-time
let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

try {
  supabaseClient = createServerClient();
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  
  // Create a mock client for build-time to prevent build failures
  if (process.env.NODE_ENV === 'production' && !process.env.SUPABASE_URL) {
    console.warn('⚠️  Running without Supabase - some features will be disabled');
    // Create a minimal mock client that won't break the build
    supabaseClient = {
      from: () => ({
        select: () => ({ data: [], error: new Error('Supabase not configured') }),
        insert: () => ({ data: null, error: new Error('Supabase not configured') }),
        update: () => ({ data: null, error: new Error('Supabase not configured') }),
        delete: () => ({ data: null, error: new Error('Supabase not configured') }),
        eq: function() { return this; },
        single: function() { return this; },
        order: function() { return this; },
        range: function() { return this; }
      }),
      auth: {
        getUser: () => Promise.resolve({ data: { user: null }, error: new Error('Supabase not configured') })
      }
    } as any;
  }
}

export const supabase = supabaseClient!;