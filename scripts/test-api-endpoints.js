#!/usr/bin/env node

/**
 * Test the actual API endpoints that the frontend uses
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

async function testAPIEndpoints() {
  console.log('🧪 Testing API Endpoints\n');

  try {
    // Test 1: Settings API
    console.log('1️⃣ Testing /api/settings...');
    const settingsResponse = await fetch(`${BASE_URL}/api/settings`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Status:', settingsResponse.status);
    
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      console.log('Response:', JSON.stringify(settings, null, 2));
      
      // Test the logic
      const votingStartDate = settings.voting_start_date;
      if (votingStartDate) {
        const now = new Date();
        const start = new Date(votingStartDate);
        const isVotingOpen = now >= start;
        
        console.log('\n📊 Logic Test:');
        console.log('Current Time:', now.toISOString());
        console.log('Voting Start Time:', start.toISOString());
        console.log('Is Voting Open:', isVotingOpen);
        console.log('Should Show "Nominate Now":', !isVotingOpen);
      }
    } else {
      const errorText = await settingsResponse.text();
      console.log('Error Response:', errorText);
    }

    // Test 2: Admin Settings API
    console.log('\n2️⃣ Testing /api/admin/settings...');
    const adminResponse = await fetch(`${BASE_URL}/api/admin/settings`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Status:', adminResponse.status);
    
    if (adminResponse.ok) {
      const adminSettings = await adminResponse.json();
      console.log('Response:', JSON.stringify(adminSettings, null, 2));
    } else {
      const errorText = await adminResponse.text();
      console.log('Error Response:', errorText);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Make sure the development server is running:');
    console.log('npm run dev');
  }
}

// Run the test
testAPIEndpoints();