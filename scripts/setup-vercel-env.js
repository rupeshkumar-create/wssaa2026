#!/usr/bin/env node

/**
 * Setup Vercel Environment Variables
 * This script helps you configure the required environment variables for Vercel
 */

const fs = require('fs');
const path = require('path');

function readEnvFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const env = {};
    
    content.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return env;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return {};
  }
}

function main() {
  console.log('🚀 Vercel Environment Setup Helper\n');
  
  // Read local environment
  const localEnv = readEnvFile('.env.local');
  const prodTemplate = readEnvFile('.env.vercel.template');
  
  console.log('📋 Required Environment Variables for Vercel:');
  console.log('='.repeat(50));
  
  // Essential variables for database connection
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY', 
    'NEXT_PUBLIC_SUPABASE_URL',
    'ADMIN_EMAILS',
    'ADMIN_PASSWORD_HASHES',
    'SERVER_SESSION_SECRET',
    'CRON_SECRET',
    'SYNC_SECRET'
  ];
  
  // Optional but recommended
  const optionalVars = [
    'HUBSPOT_ACCESS_TOKEN',
    'LOOPS_API_KEY',
    'LOOPS_SYNC_ENABLED'
  ];
  
  console.log('\n🔑 REQUIRED Variables (copy these to Vercel):');
  console.log('-'.repeat(40));
  
  requiredVars.forEach(varName => {
    const value = localEnv[varName] || prodTemplate[varName] || '';
    if (value) {
      console.log(`${varName}=${value}`);
    } else {
      console.log(`${varName}=<MISSING - PLEASE SET>`);
    }
  });
  
  console.log('\n⚙️  OPTIONAL Variables:');
  console.log('-'.repeat(40));
  
  optionalVars.forEach(varName => {
    const value = localEnv[varName] || prodTemplate[varName] || '';
    if (value) {
      console.log(`${varName}=${value}`);
    } else {
      console.log(`${varName}=<not set>`);
    }
  });
  
  console.log('\n🌐 Don\'t forget to set:');
  console.log(`NEXT_PUBLIC_APP_URL=https://your-vercel-app-name.vercel.app`);
  
  console.log('\n📝 Steps to configure Vercel:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > Environment Variables');
  console.log('4. Add each variable above');
  console.log('5. Redeploy your application');
  
  console.log('\n🔍 After deployment, test with:');
  console.log('   https://your-app.vercel.app/api/test-env');
  console.log('   https://your-app.vercel.app/api/nominees');
  
  // Check if we have the essential database config
  const hasSupabaseUrl = !!(localEnv.SUPABASE_URL || localEnv.NEXT_PUBLIC_SUPABASE_URL);
  const hasSupabaseKey = !!localEnv.SUPABASE_SERVICE_ROLE_KEY;
  
  if (hasSupabaseUrl && hasSupabaseKey) {
    console.log('\n✅ Your local configuration looks good!');
    console.log('   The same values should work on Vercel.');
  } else {
    console.log('\n❌ Missing database configuration in local files.');
    console.log('   Please check your .env.local file first.');
  }
}

main();