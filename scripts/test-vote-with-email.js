#!/usr/bin/env node

/**
 * Test script to simulate a vote and trigger the transactional email
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testVoteWithEmail() {
  console.log('🧪 Testing Vote with Transactional Email...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`LOOPS_API_KEY: ${process.env.LOOPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`LOOPS_TRANSACTIONAL_ENABLED: ${process.env.LOOPS_TRANSACTIONAL_ENABLED || 'true (default)'}`);
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing'}`);
  console.log(`SUPABASE_ANON_KEY: ${process.env.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log('');

  if (!process.env.LOOPS_API_KEY) {
    console.error('❌ LOOPS_API_KEY is required for testing');
    process.exit(1);
  }

  try {
    // Test the vote API endpoint directly
    const voteData = {
      subcategoryId: 'top-recruiter',
      email: 'rupesh.kumar@candidate.ly',
      firstname: 'Test',
      lastname: 'Voter',
      linkedin: 'https://linkedin.com/in/test-voter',
      company: 'Test Company',
      jobTitle: 'Test Role',
      country: 'United States',
      votedForDisplayName: 'Test Nominee'
    };

    console.log('🗳️ Simulating vote with data:');
    console.log(JSON.stringify(voteData, null, 2));
    console.log('');

    const response = await fetch('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(voteData),
    });

    const result = await response.json();

    console.log('📊 Vote API Response:');
    console.log(`Status: ${response.status}`);
    console.log('Body:', JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log('\n✅ Vote submitted successfully!');
      console.log('📧 Check your email for the vote confirmation.');
    } else {
      console.log('\n❌ Vote submission failed.');
      if (result.error === 'ALREADY_VOTED') {
        console.log('ℹ️ This is expected if you already voted in this category.');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }

  console.log('\n✅ Vote with email test completed!');
}

// Run the test
testVoteWithEmail().catch(console.error);