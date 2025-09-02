#!/usr/bin/env node

/**
 * Verify wssaa2026.vercel.app deployment
 */

async function verifyDeployment() {
  const url = 'https://wssaa2026.vercel.app';
  
  console.log('🔍 Verifying wssaa2026.vercel.app deployment...\n');
  
  try {
    // Test environment variables
    console.log('1️⃣ Testing Environment Variables...');
    const envResponse = await fetch(`${url}/api/test-env`);
    const envData = await envResponse.json();
    
    const env = envData.env;
    console.log(`   SUPABASE_URL: ${env.SUPABASE_URL ? '✅' : '❌'}`);
    console.log(`   SUPABASE_SERVICE_ROLE_KEY: ${env.SUPABASE_SERVICE_ROLE_KEY ? '✅' : '❌'}`);
    console.log(`   Database Ready: ${env.supabase_key_available ? '✅' : '❌'}`);
    
    if (!env.supabase_key_available) {
      console.log('\n❌ SUPABASE_SERVICE_ROLE_KEY is still missing!');
      console.log('   Please add it to your Vercel environment variables.');
      return false;
    }
    
    // Test nominees API
    console.log('\n2️⃣ Testing Nominees API...');
    const nomineesResponse = await fetch(`${url}/api/nominees?limit=3`);
    const nomineesData = await nomineesResponse.json();
    
    if (nomineesData.success) {
      console.log(`✅ Nominees API working - Found ${nomineesData.count} nominees`);
      console.log(`   Message: ${nomineesData.message}`);
      
      if (nomineesData.count > 0) {
        console.log(`   Top nominee: ${nomineesData.data[0]?.nominee?.name || 'Unknown'}`);
      }
    } else {
      console.log('❌ Nominees API failed:', nomineesData.error);
      return false;
    }
    
    // Test podium API
    console.log('\n3️⃣ Testing Podium API...');
    const podiumResponse = await fetch(`${url}/api/podium`);
    const podiumData = await podiumResponse.json();
    
    if (podiumData.success) {
      console.log('✅ Podium API working');
    } else {
      console.log('❌ Podium API failed:', podiumData.error);
    }
    
    console.log('\n🎉 Deployment verification complete!');
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
}

verifyDeployment().then(success => {
  if (success) {
    console.log('\n✅ Your wssaa2026.vercel.app deployment is working correctly!');
  } else {
    console.log('\n❌ Please add the missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }
});