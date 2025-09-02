#!/usr/bin/env node

/**
 * Test Vercel Deployment
 * This script tests your Vercel deployment to ensure the database connection is working
 */

async function testVercelDeployment() {
  console.log('🚀 Testing Vercel Deployment\n');

  // You'll need to replace this with your actual Vercel URL
  const vercelUrl = process.env.VERCEL_URL || 'https://your-app.vercel.app';
  
  console.log(`🌐 Testing deployment at: ${vercelUrl}`);
  
  try {
    // Test 1: Environment Variables
    console.log('\n1️⃣ Testing Environment Variables...');
    const envResponse = await fetch(`${vercelUrl}/api/test-env`);
    
    if (!envResponse.ok) {
      throw new Error(`Environment test failed: ${envResponse.status} ${envResponse.statusText}`);
    }
    
    const envData = await envResponse.json();
    console.log('✅ Environment endpoint accessible');
    
    // Check database configuration
    const env = envData.env;
    const dbReady = env.supabase_url_available && env.supabase_key_available;
    
    console.log(`   Database URL: ${env.supabase_url_available ? '✅' : '❌'}`);
    console.log(`   Database Key: ${env.supabase_key_available ? '✅' : '❌'}`);
    console.log(`   Database Ready: ${dbReady ? '✅' : '❌'}`);
    
    if (!dbReady) {
      console.log('❌ Database not properly configured on Vercel');
      return false;
    }
    
    // Test 2: Nominees API
    console.log('\n2️⃣ Testing Nominees API...');
    const nomineesResponse = await fetch(`${vercelUrl}/api/nominees`);
    
    if (!nomineesResponse.ok) {
      throw new Error(`Nominees API failed: ${nomineesResponse.status} ${nomineesResponse.statusText}`);
    }
    
    const nomineesData = await nomineesResponse.json();
    console.log('✅ Nominees API accessible');
    
    if (nomineesData.success) {
      console.log(`   Found ${nomineesData.count} nominees`);
      console.log(`   Message: ${nomineesData.message}`);
      
      if (nomineesData.message.includes('Demo data')) {
        console.log('⚠️  Still using demo data - database may not be connected');
        return false;
      } else {
        console.log('✅ Real database data returned');
      }
    } else {
      console.log('❌ Nominees API returned error:', nomineesData.error);
      return false;
    }
    
    // Test 3: Basic functionality
    console.log('\n3️⃣ Testing Basic App Functionality...');
    const homeResponse = await fetch(vercelUrl);
    
    if (!homeResponse.ok) {
      throw new Error(`Home page failed: ${homeResponse.status} ${homeResponse.statusText}`);
    }
    
    console.log('✅ Home page accessible');
    
    console.log('\n🎉 All tests passed! Your Vercel deployment is working correctly.');
    return true;
    
  } catch (error) {
    console.error('❌ Deployment test failed:', error.message);
    
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Make sure you\'ve added all environment variables to Vercel');
    console.log('2. Redeploy your application after adding variables');
    console.log('3. Check that your Vercel URL is correct');
    console.log('4. Verify your Supabase database is accessible');
    
    return false;
  }
}

// Helper function to get the correct Vercel URL
function getVercelUrl() {
  // Common Vercel URL patterns
  const possibleUrls = [
    'https://world-staffing-awards.vercel.app',
    'https://world-staffing-awards-git-main.vercel.app',
    'https://world-staffing-awards-rupeshkumar.vercel.app'
  ];
  
  console.log('\n📋 Common Vercel URL patterns:');
  possibleUrls.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
  });
  
  console.log('\n💡 To find your exact URL:');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Click on your project');
  console.log('3. Copy the URL from the project overview');
}

async function main() {
  console.log('🌐 Vercel Deployment Tester\n');
  
  // Check if we have a URL to test
  const testUrl = process.argv[2];
  
  if (!testUrl) {
    console.log('❓ No Vercel URL provided.');
    getVercelUrl();
    console.log('\n📝 Usage: node scripts/test-vercel-deployment.js <your-vercel-url>');
    console.log('   Example: node scripts/test-vercel-deployment.js https://your-app.vercel.app');
    return;
  }
  
  // Set the URL for testing
  process.env.VERCEL_URL = testUrl;
  
  const success = await testVercelDeployment();
  
  if (success) {
    console.log('\n✅ Your Vercel deployment is working correctly!');
    console.log('   The "Failed to fetch nominees" error should now be resolved.');
  } else {
    console.log('\n❌ There are still issues with your deployment.');
    console.log('   Please follow the troubleshooting steps above.');
  }
}

main().catch(console.error);