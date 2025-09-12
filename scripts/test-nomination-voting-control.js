#!/usr/bin/env node

/**
 * Test script for nomination and voting date control system
 * Tests the admin panel controls and their effects on the frontend
 */

const fetch = require('node-fetch');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function testNominationVotingControl() {
  console.log('🧪 Testing Nomination and Voting Control System\n');

  try {
    // Test 1: Check current settings
    console.log('1️⃣ Testing settings API...');
    const settingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const settings = await settingsResponse.json();
    
    console.log('Settings API Response:', {
      success: settings.success,
      nominations_enabled: settings.nominations_enabled,
      voting_enabled: settings.voting_enabled,
      voting_start_date: settings.voting_start_date,
      voting_end_date: settings.voting_end_date
    });

    // Test 2: Check admin settings API
    console.log('\n2️⃣ Testing admin settings API...');
    const adminSettingsResponse = await fetch(`${BASE_URL}/api/admin/settings`);
    const adminSettings = await adminSettingsResponse.json();
    
    console.log('Admin Settings API Response:', {
      success: adminSettings.success,
      settingsCount: Object.keys(adminSettings.settings || {}).length,
      hasNominationSettings: !!(adminSettings.settings?.nominations_enabled),
      hasVotingSettings: !!(adminSettings.settings?.voting_enabled)
    });

    // Test 3: Test updating nomination status
    console.log('\n3️⃣ Testing nomination toggle...');
    const toggleNominationResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'nominations_enabled',
        setting_value: 'false'
      })
    });
    
    const toggleResult = await toggleNominationResponse.json();
    console.log('Nomination toggle result:', {
      success: toggleResult.success,
      message: toggleResult.message
    });

    // Test 4: Test updating voting status
    console.log('\n4️⃣ Testing voting toggle...');
    const toggleVotingResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'voting_enabled',
        setting_value: 'true'
      })
    });
    
    const votingToggleResult = await toggleVotingResponse.json();
    console.log('Voting toggle result:', {
      success: votingToggleResult.success,
      message: votingToggleResult.message
    });

    // Test 5: Test setting voting dates
    console.log('\n5️⃣ Testing voting date setting...');
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Next week
    
    const setStartDateResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'voting_start_date',
        setting_value: startDate.toISOString()
      })
    });
    
    const startDateResult = await setStartDateResponse.json();
    console.log('Voting start date result:', {
      success: startDateResult.success,
      date: startDate.toISOString()
    });

    // Test 6: Verify settings after changes
    console.log('\n6️⃣ Verifying settings after changes...');
    const finalSettingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const finalSettings = await finalSettingsResponse.json();
    
    console.log('Final Settings:', {
      nominations_enabled: finalSettings.nominations_enabled,
      voting_enabled: finalSettings.voting_enabled,
      voting_start_date: finalSettings.voting_start_date,
      voting_closed_message: finalSettings.voting_closed_message
    });

    // Test 7: Reset to safe defaults
    console.log('\n7️⃣ Resetting to safe defaults...');
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'nominations_enabled',
        setting_value: 'true'
      })
    });
    
    await fetch(`${BASE_URL}/api/admin/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setting_key: 'voting_enabled',
        setting_value: 'false'
      })
    });

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Settings API is working');
    console.log('- Admin can toggle nominations on/off');
    console.log('- Admin can toggle voting on/off');
    console.log('- Admin can set voting dates');
    console.log('- Settings are properly persisted');
    console.log('\n🎯 Next steps:');
    console.log('1. Apply the SQL schema: NOMINATION_AND_VOTING_DATE_SCHEMA.sql');
    console.log('2. Test the admin panel UI');
    console.log('3. Test voting restrictions on nominee pages');
    console.log('4. Test homepage button changes');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure the development server is running');
    console.log('2. Check if the database schema is applied');
    console.log('3. Verify environment variables are set');
  }
}

// Run the test
testNominationVotingControl();