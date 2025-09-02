#!/usr/bin/env node

/**
 * Check Vercel Environment Variables
 * This script helps diagnose database connection issues on Vercel
 */

const https = require('https');

async function checkVercelEnv() {
  console.log('🔍 Checking Vercel Environment Variables...\n');

  // Check if we can access the test-env endpoint
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://your-app.vercel.app';
  
  console.log(`📡 Testing environment endpoint: ${appUrl}/api/test-env`);
  
  try {
    const response = await fetch(`${appUrl}/api/test-env`);
    const data = await response.json();
    
    console.log('\n✅ Environment Check Results:');
    console.log('================================');
    
    const env = data.env;
    
    // Check Supabase configuration
    console.log('\n🗄️  Database (Supabase) Configuration:');
    console.log(`   SUPABASE_URL: ${env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing'}`);
    console.log(`   SUPABASE_KEY: ${env.SUPABASE_KEY ? '✅ Set' : '❌ Missing'}`);
    
    const hasSupabaseUrl = env.supabase_url_available;
    const hasSupabaseKey = env.supabase_key_available;
    
    console.log(`\n📊 Overall Database Status:`);
    console.log(`   URL Available: ${hasSupabaseUrl ? '✅' : '❌'}`);
    console.log(`   Key Available: ${hasSupabaseKey ? '✅' : '❌'}`);
    console.log(`   Database Ready: ${hasSupabaseUrl && hasSupabaseKey ? '✅' : '❌'}`);
    
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      console.log('\n🚨 ISSUE FOUND: Missing Supabase Configuration');
      console.log('\n🔧 To fix this issue:');
      console.log('1. Go to your Vercel dashboard');
      console.log('2. Navigate to your project settings');
      console.log('3. Go to Environment Variables');
      console.log('4. Add the following variables:');
      console.log('');
      console.log('   SUPABASE_URL=https://your-project-id.supabase.co');
      console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here');
      console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co');
      console.log('');
      console.log('5. Redeploy your application');
      console.log('');
      console.log('📋 You can find these values in your Supabase project dashboard:');
      console.log('   - Go to https://supabase.com/dashboard');
      console.log('   - Select your project');
      console.log('   - Go to Settings > API');
      console.log('   - Copy the Project URL and service_role key');
    } else {
      console.log('\n✅ Database configuration looks good!');
    }
    
    // Check other integrations
    console.log('\n🔗 Integration Status:');
    console.log(`   HubSpot: ${env.HUBSPOT_ACCESS_TOKEN ? '✅ Configured' : '⚠️  Not configured'}`);
    console.log(`   Loops: ${env.LOOPS_API_KEY ? '✅ Configured' : '⚠️  Not configured'}`);
    
    console.log(`\n🌍 Environment: ${env.NODE_ENV}`);
    console.log(`📅 Checked at: ${data.timestamp}`);
    
  } catch (error) {
    console.error('❌ Failed to check environment variables:', error.message);
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure your app is deployed and accessible');
    console.log('2. Check that the /api/test-env endpoint exists');
    console.log('3. Verify your NEXT_PUBLIC_APP_URL is correct');
  }
}

// Also check local environment if running locally
function checkLocalEnv() {
  console.log('\n🏠 Local Environment Check:');
  console.log('============================');
  
  const localEnv = {
    SUPABASE_URL: !!process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_KEY: !!process.env.SUPABASE_KEY,
  };
  
  console.log(`SUPABASE_URL: ${localEnv.SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${localEnv.NEXT_PUBLIC_SUPABASE_URL ? '✅' : '❌'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${localEnv.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
  
  const hasUrl = localEnv.SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = localEnv.SUPABASE_SERVICE_ROLE_KEY || localEnv.SUPABASE_KEY;
  
  console.log(`\nLocal Database Ready: ${hasUrl && hasKey ? '✅' : '❌'}`);
  
  if (hasUrl && hasKey) {
    console.log('✅ Local environment is properly configured');
  } else {
    console.log('❌ Local environment missing database configuration');
    console.log('Check your .env.local file');
  }
}

async function main() {
  console.log('🚀 World Staffing Awards - Environment Diagnostics\n');
  
  // Check local environment first
  checkLocalEnv();
  
  // Then check Vercel environment
  await checkVercelEnv();
  
  console.log('\n' + '='.repeat(50));
  console.log('🎯 Summary: The "Failed to fetch nominees" error occurs because');
  console.log('   your Vercel deployment is missing Supabase environment variables.');
  console.log('   Follow the steps above to configure them in Vercel.');
  console.log('='.repeat(50));
}

main().catch(console.error);