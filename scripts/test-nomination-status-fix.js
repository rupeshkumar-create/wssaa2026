#!/usr/bin/env node

/**
 * Test script to verify nomination status functionality
 */

const https = require('https');

const BASE_URL = 'https://world-staffing-awards.vercel.app';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testNominationStatus() {
  console.log('🧪 Testing Nomination Status API Fix\n');
  
  try {
    // Test 1: Check settings API
    console.log('1️⃣ Testing /api/settings...');
    const settingsResponse = await makeRequest(`${BASE_URL}/api/settings`);
    
    console.log(`   Status: ${settingsResponse.status}`);
    if (settingsResponse.status === 200) {
      console.log(`   Success: ${settingsResponse.data.success}`);
      console.log(`   Nominations Enabled: ${settingsResponse.data.nominations_enabled}`);
      console.log(`   Close Message: ${settingsResponse.data.nominations_close_message}`);
      
      if (settingsResponse.data.success) {
        console.log('   ✅ Settings API working correctly');
      } else {
        console.log('   ❌ Settings API returned success: false');
        console.log(`   Error: ${settingsResponse.data.error}`);
      }
    } else {
      console.log('   ❌ Settings API failed');
    }
    
    console.log('');
    
    // Test 2: Check home page for proper button text
    console.log('2️⃣ Testing home page content...');
    const homeResponse = await makeRequest(`${BASE_URL}/`);
    
    if (homeResponse.status === 200) {
      const homeContent = homeResponse.data;
      const hasNominateNow = homeContent.includes('Nominate Now');
      const hasVoteNow = homeContent.includes('Vote Now');
      
      console.log(`   Has "Nominate Now": ${hasNominateNow ? '✅' : '❌'}`);
      console.log(`   Has "Vote Now": ${hasVoteNow ? '✅' : '❌'}`);
      
      if (settingsResponse.data.nominations_enabled) {
        if (hasNominateNow) {
          console.log('   ✅ Correctly showing "Nominate Now" when nominations are open');
        } else {
          console.log('   ❌ Should show "Nominate Now" when nominations are open');
        }
      } else {
        if (hasVoteNow && !hasNominateNow) {
          console.log('   ✅ Correctly showing "Vote Now" when nominations are closed');
        } else {
          console.log('   ❌ Should show "Vote Now" when nominations are closed');
        }
      }
    } else {
      console.log('   ❌ Home page failed to load');
    }
    
    console.log('');
    
    // Test 3: Summary
    console.log('📊 Summary:');
    console.log('----------------------------------------');
    
    if (settingsResponse.data.nominations_enabled) {
      console.log('🟢 Nominations are OPEN');
      console.log('   Expected behavior:');
      console.log('   - Hero section: "Nominate Now" + "View Nominees"');
      console.log('   - CTA section: "Ready to Nominate?" + "Nominate Now"');
      console.log('   - Header: "Nominate" link works, "Vote Now" button');
    } else {
      console.log('🔴 Nominations are CLOSED');
      console.log('   Expected behavior:');
      console.log('   - Hero section: "Vote Now" + "View Nominees"');
      console.log('   - CTA section: "Ready to Vote?" + "Vote Now"');
      console.log('   - Header: "Nominate" shows dialog, "Vote Now" button');
    }
    
    console.log('');
    console.log('🔧 To toggle nomination status:');
    console.log(`   1. Go to: ${BASE_URL}/admin`);
    console.log('   2. Login with admin credentials');
    console.log('   3. Use the Nomination Toggle switch');
    console.log('   4. Refresh the home page to see changes');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testNominationStatus();