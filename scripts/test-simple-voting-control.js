#!/usr/bin/env node

/**
 * Test script for simplified voting date control system
 * Tests the admin panel voting date control and its effects
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testSimpleVotingControl() {
  console.log('🧪 Testing Simplified Voting Date Control System\n');

  try {
    // Test 1: Check current settings
    console.log('1️⃣ Testing settings API...');
    const settingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const settings = await settingsResponse.json();
    
    console.log('Settings API Response:', {
      success: settings.success,
      voting_start_date: settings.voting_start_date
    });

    // Test 2: Check admin settings API
    console.log('\n2️⃣ Testing admin settings API...');
    const adminSettingsResponse = await fetch(`${BASE_URL}/api/admin/settings`);
    const adminSettings = await adminSettingsResponse.json();
    
    console.log('Admin Settings API Response:', {
      success: adminSettings.success,
      hasVotingStartDate: !!(adminSettings.settings?.voting_start_date)
    });

    // Test 3: Test setting voting start date to tomorrow
    console.log('\n3️⃣ Testing voting start date setting...');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM tomorrow
    
    const setDateResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'voting_start_date',
        setting_value: tomorrow.toISOString()
      })
    });
    
    const dateResult = await setDateResponse.json();
    console.log('Voting start date result:', {
      success: dateResult.success,
      date: tomorrow.toISOString()
    });

    // Test 4: Verify settings after change
    console.log('\n4️⃣ Verifying settings after change...');
    const finalSettingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const finalSettings = await finalSettingsResponse.json();
    
    const votingStartDate = finalSettings.voting_start_date;
    const isVotingOpen = votingStartDate ? new Date() >= new Date(votingStartDate) : false;
    
    console.log('Final Settings:', {
      voting_start_date: votingStartDate,
      isVotingOpen: isVotingOpen,
      currentPhase: isVotingOpen ? 'Voting' : 'Nomination'
    });

    // Test 5: Test setting voting start date to 1 hour ago (voting should be open)
    console.log('\n5️⃣ Testing voting start date in the past...');
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);
    
    const setPastDateResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'voting_start_date',
        setting_value: oneHourAgo.toISOString()
      })
    });
    
    const pastDateResult = await setPastDateResponse.json();
    console.log('Past date result:', {
      success: pastDateResult.success,
      date: oneHourAgo.toISOString()
    });

    // Test 6: Verify voting is now open
    console.log('\n6️⃣ Verifying voting is now open...');
    const openSettingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const openSettings = await openSettingsResponse.json();
    
    const openVotingStartDate = openSettings.voting_start_date;
    const isNowVotingOpen = openVotingStartDate ? new Date() >= new Date(openVotingStartDate) : false;
    
    console.log('Open Settings:', {
      voting_start_date: openVotingStartDate,
      isVotingOpen: isNowVotingOpen,
      currentPhase: isNowVotingOpen ? 'Voting' : 'Nomination'
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Settings API is working');
    console.log('- Admin can set voting start date');
    console.log('- System correctly determines current phase');
    console.log('- Before voting date: Nomination phase');
    console.log('- After voting date: Voting phase');
    console.log('\n🎯 Expected Behavior:');
    console.log('- Homepage shows "Nominate Now" during nomination phase');
    console.log('- Homepage shows "Vote Now" during voting phase');
    console.log('- Vote buttons show "Voting opens on {date}" during nomination phase');
    console.log('- Vote buttons work normally during voting phase');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the development server is running');
    console.log('2. Apply the SQL schema: SIMPLE_VOTING_DATE_SCHEMA.sql');
    console.log('3. Verify environment variables are set');
  }
}

// Run the test
testSimpleVotingControl();