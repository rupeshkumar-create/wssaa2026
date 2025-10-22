#!/usr/bin/env node

/**
 * Debug Enhanced Dashboard HTTP 500 Error
 * This script tests the API endpoints that the Enhanced Dashboard uses
 */

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function testEndpoint(endpoint, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`📍 URL: ${BASE_URL}${endpoint}`);
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Success: ${JSON.stringify(data).substring(0, 200)}...`);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.log(`❌ Error Response: ${errorText}`);
      return { success: false, error: errorText, status: response.status };
    }
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function debugDashboard() {
  console.log('🚀 Enhanced Dashboard Debug Tool');
  console.log('=====================================');
  
  // Test environment variables first
  const envResult = await testEndpoint('/api/test-env', 'Environment Variables');
  
  if (!envResult.success) {
    console.log('\n❌ Environment variables test failed - this might be the root cause');
    return;
  }
  
  // Test the main dashboard endpoint
  const dashboardResult = await testEndpoint(
    '/api/admin/top-nominees?includeStats=true&limit=5', 
    'Enhanced Dashboard Data'
  );
  
  if (!dashboardResult.success) {
    console.log('\n❌ Dashboard endpoint failed');
    
    // Test simpler endpoints to narrow down the issue
    await testEndpoint('/api/admin/top-nominees', 'Basic Top Nominees');
    await testEndpoint('/api/admin/nominations-improved', 'Nominations Data');
    await testEndpoint('/api/stats', 'Basic Stats');
  }
  
  // Test database connection
  console.log('\n🔍 Testing database connection...');
  try {
    const { createClient } = require('@supabase/supabase-js');
    
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.log('❌ Missing Supabase credentials');
      console.log(`SUPABASE_URL: ${!!supabaseUrl}`);
      console.log(`SUPABASE_KEY: ${!!supabaseKey}`);
      return;
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.from('nominations').select('count').limit(1);
    
    if (error) {
      console.log(`❌ Database Error: ${error.message}`);
    } else {
      console.log('✅ Database connection successful');
    }
    
  } catch (dbError) {
    console.log(`💥 Database Connection Error: ${dbError.message}`);
  }
  
  console.log('\n📋 Summary:');
  console.log('- Check the console output above for specific error details');
  console.log('- Verify environment variables are properly set');
  console.log('- Ensure Supabase database is accessible');
  console.log('- Check if the nominations table exists and has data');
}

// Run the debug
debugDashboard().catch(console.error);