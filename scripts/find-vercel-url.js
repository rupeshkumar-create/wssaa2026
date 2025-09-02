#!/usr/bin/env node

/**
 * Find and Test Vercel URL
 * This script helps you find your Vercel deployment URL and test it
 */

async function testUrl(url) {
  try {
    console.log(`🔍 Testing: ${url}`);
    const response = await fetch(url, { 
      method: 'HEAD',
      timeout: 5000 
    });
    
    if (response.ok) {
      console.log(`✅ ${url} - Accessible`);
      return true;
    } else {
      console.log(`❌ ${url} - ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${url} - ${error.message}`);
    return false;
  }
}

async function findVercelUrl() {
  console.log('🔍 Finding your Vercel deployment URL...\n');
  
  // Read package.json to get project name
  const fs = require('fs');
  let projectName = 'world-staffing-awards';
  
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.name) {
      projectName = packageJson.name;
    }
  } catch (error) {
    console.log('⚠️  Could not read package.json, using default project name');
  }
  
  // Common Vercel URL patterns
  const possibleUrls = [
    `https://${projectName}.vercel.app`,
    `https://${projectName}-git-main.vercel.app`,
    `https://${projectName}-git-master.vercel.app`,
    'https://world-staffing-awards.vercel.app',
    'https://world-staffing-awards-git-main.vercel.app'
  ];
  
  console.log('🌐 Testing common URL patterns...\n');
  
  const workingUrls = [];
  
  for (const url of possibleUrls) {
    const isWorking = await testUrl(url);
    if (isWorking) {
      workingUrls.push(url);
    }
  }
  
  if (workingUrls.length > 0) {
    console.log('\n🎉 Found working URLs:');
    workingUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url}`);
    });
    
    const primaryUrl = workingUrls[0];
    console.log(`\n🚀 Testing deployment with: ${primaryUrl}`);
    
    // Test the API endpoints
    await testApiEndpoints(primaryUrl);
    
  } else {
    console.log('\n❌ No working URLs found.');
    console.log('\n💡 To find your Vercel URL:');
    console.log('1. Go to https://vercel.com/dashboard');
    console.log('2. Click on your project');
    console.log('3. Copy the URL from the project overview');
    console.log('4. Then run: node scripts/test-vercel-deployment.js <your-url>');
  }
}

async function testApiEndpoints(baseUrl) {
  console.log('\n🧪 Testing API endpoints...');
  
  const endpoints = [
    '/api/test-env',
    '/api/nominees'
  ];
  
  for (const endpoint of endpoints) {
    const url = `${baseUrl}${endpoint}`;
    try {
      console.log(`\n📡 Testing: ${endpoint}`);
      const response = await fetch(url);
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${endpoint} - Working`);
        
        if (endpoint === '/api/test-env') {
          const env = data.env;
          const dbReady = env.supabase_url_available && env.supabase_key_available;
          console.log(`   Database Ready: ${dbReady ? '✅' : '❌'}`);
        }
        
        if (endpoint === '/api/nominees') {
          console.log(`   Success: ${data.success ? '✅' : '❌'}`);
          console.log(`   Count: ${data.count || 0}`);
          if (data.message) {
            console.log(`   Message: ${data.message}`);
          }
        }
      } else {
        console.log(`❌ ${endpoint} - ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint} - ${error.message}`);
    }
  }
}

async function main() {
  console.log('🌐 Vercel URL Finder & Tester\n');
  await findVercelUrl();
}

main().catch(console.error);