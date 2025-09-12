#!/usr/bin/env node

/**
 * Debug script to check voting status logic
 */

// Use node-fetch if available, otherwise use built-in fetch (Node 18+)
let fetch;
try {
  fetch = require('node-fetch');
} catch (e) {
  // Use global fetch if available (Node 18+)
  if (typeof globalThis.fetch !== 'undefined') {
    fetch = globalThis.fetch;
  } else {
    console.error('❌ fetch not available. Please install node-fetch or use Node 18+');
    process.exit(1);
  }
}

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function debugVotingStatus() {
  console.log('🔍 Debugging Voting Status Logic\n');

  try {
    // Test 1: Check settings API
    console.log('1️⃣ Checking settings API...');
    const settingsResponse = await fetch(`${BASE_URL}/api/settings`);
    const settings = await settingsResponse.json();
    
    console.log('Settings API Response:', JSON.stringify(settings, null, 2));

    // Test 2: Check admin settings API
    console.log('\n2️⃣ Checking admin settings API...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin/settings`);
    const adminSettings = await adminResponse.json();
    
    console.log('Admin Settings API Response:', JSON.stringify(adminSettings, null, 2));

    // Test 3: Manual logic check
    console.log('\n3️⃣ Manual logic check...');
    const votingStartDate = settings.voting_start_date || adminSettings.settings?.voting_start_date?.value || '';
    
    console.log('Voting Start Date:', votingStartDate);
    
    if (votingStartDate) {
      const now = new Date();
      const start = new Date(votingStartDate);
      
      console.log('Current Time:', now.toISOString());
      console.log('Voting Start Time:', start.toISOString());
      console.log('Current Time >= Start Time:', now >= start);
      console.log('Is Voting Open:', now >= start);
      console.log('Should Show Nominate:', now < start);
    } else {
      console.log('No voting start date found!');
    }

    // Test 4: Check database directly
    console.log('\n4️⃣ Checking if voting_start_date exists in database...');
    
    // This would require direct database access, but let's check if the setting exists
    if (adminSettings.settings && adminSettings.settings.voting_start_date) {
      console.log('✅ voting_start_date setting exists in database');
      console.log('Value:', adminSettings.settings.voting_start_date.value);
    } else {
      console.log('❌ voting_start_date setting NOT found in database');
      console.log('Available settings:', Object.keys(adminSettings.settings || {}));
    }

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugVotingStatus();