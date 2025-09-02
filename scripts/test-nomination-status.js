#!/usr/bin/env node

/**
 * Test nomination status on the deployed app
 */

async function testNominationStatus() {
  const url = 'https://wssaa2026.vercel.app';
  
  console.log('🧪 Testing nomination status...\n');
  
  try {
    // Test settings API
    console.log('1️⃣ Testing /api/settings...');
    const settingsResponse = await fetch(`${url}/api/settings`);
    const settingsData = await settingsResponse.json();
    
    console.log(`   Status: ${settingsResponse.status}`);
    console.log(`   Success: ${settingsData.success}`);
    console.log(`   Nominations Enabled: ${settingsData.nominations_enabled}`);
    console.log(`   Close Message: ${settingsData.nominations_close_message}`);
    
    if (settingsData.error) {
      console.log(`   Error: ${settingsData.error}`);
    }
    
    // Test home page behavior
    console.log('\n2️⃣ Testing home page...');
    const homeResponse = await fetch(url);
    const homeHtml = await homeResponse.text();
    
    const hasNominateButton = homeHtml.includes('Submit Nomination') || homeHtml.includes('Start Your Nomination');
    const hasVoteButton = homeHtml.includes('Start Voting') || homeHtml.includes('Vote Now');
    
    console.log(`   Has Nominate Button: ${hasNominateButton ? '❌' : '✅'}`);
    console.log(`   Has Vote Button: ${hasVoteButton ? '✅' : '❌'}`);
    
    // Test nomination page
    console.log('\n3️⃣ Testing /nominate page...');
    const nominateResponse = await fetch(`${url}/nominate`);
    const nominateHtml = await nominateResponse.text();
    
    const showsClosedMessage = nominateHtml.includes('Nominations are now closed') || 
                              nominateHtml.includes('nominations_close_message');
    
    console.log(`   Shows Closed Message: ${showsClosedMessage ? '✅' : '❌'}`);
    
    // Summary
    console.log('\n📊 Summary:');
    if (!settingsData.nominations_enabled) {
      console.log('✅ Nominations are properly DISABLED');
      console.log('✅ Users should see voting options instead of nomination options');
    } else {
      console.log('❌ Nominations are still ENABLED - this needs to be fixed');
    }
    
    if (settingsData.success) {
      console.log('✅ Settings API is working correctly');
    } else {
      console.log('❌ Settings API is failing - check database connection');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNominationStatus();