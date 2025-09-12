#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testEmailSimple() {
  console.log('📧 Testing Email Configuration...\n');

  // Test 1: Check Loops configuration
  console.log('1. Checking Loops Configuration:');
  console.log(`   LOOPS_API_KEY: ${process.env.LOOPS_API_KEY ? 'Set ✅' : 'Not set ❌'}`);
  console.log(`   LOOPS_SYNC_ENABLED: ${process.env.LOOPS_SYNC_ENABLED || 'Not set'}`);
  console.log(`   LOOPS_TRANSACTIONAL_ENABLED: ${process.env.LOOPS_TRANSACTIONAL_ENABLED || 'default (true)'}`);

  if (!process.env.LOOPS_API_KEY) {
    console.log('   ❌ LOOPS_API_KEY is not set - emails will not work');
    console.log('   💡 Set LOOPS_API_KEY in your .env.local file');
    return;
  }

  console.log('\n2. Testing API Connectivity:');
  try {
    const response = await fetch('http://localhost:3000/api/nominees?limit=1');
    if (response.ok) {
      console.log('   ✅ Dev server is running');
      const result = await response.json();
      if (result.success && result.data && result.data.length > 0) {
        console.log(`   ✅ Found ${result.data.length} nominees for testing`);
        console.log(`   Sample nominee: ${result.data[0].name}`);
      }
    } else {
      console.log('   ❌ Dev server returned error:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Dev server not running or not accessible');
    console.log('   💡 Start the dev server with: npm run dev');
    return;
  }

  console.log('\n📧 Email Configuration Test Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Ensure dev server is running: npm run dev');
  console.log('2. Test voter emails by voting on a nominee');
  console.log('3. Test admin emails by approving nominations in admin panel');
  console.log('4. Check server console logs for email sending status');
  
  console.log('\n🔍 What to look for in server logs:');
  console.log('- "✅ Vote confirmation email sent successfully"');
  console.log('- "✅ Nominee approval email sent successfully"');
  console.log('- "⚠️ Nominee approval email already sent recently" (duplicate prevention)');
}

// Run the test
testEmailSimple().catch(console.error);