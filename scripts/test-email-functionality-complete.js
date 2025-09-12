#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testEmailFunctionality() {
  console.log('📧 Testing Complete Email Functionality...\n');

  // Test 1: Check Loops configuration
  console.log('1. Checking Loops Configuration:');
  console.log(`   LOOPS_API_KEY: ${process.env.LOOPS_API_KEY ? 'Set' : 'Not set'}`);
  console.log(`   LOOPS_SYNC_ENABLED: ${process.env.LOOPS_SYNC_ENABLED || 'Not set'}`);
  console.log(`   LOOPS_TRANSACTIONAL_ENABLED: ${process.env.LOOPS_TRANSACTIONAL_ENABLED || 'default (true)'}`);

  if (!process.env.LOOPS_API_KEY) {
    console.log('   ❌ LOOPS_API_KEY is not set - emails will not work');
    return;
  } else {
    console.log('   ✅ Loops configuration looks good');
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Test Loops transactional email directly
  console.log('2. Testing Loops Transactional Email Service:');
  try {
    const { loopsTransactional } = await import('../src/server/loops/transactional.js');
    
    // Test vote confirmation email
    const testVoteEmailData = {
      voterFirstName: 'Test',
      voterLastName: 'Voter',
      voterEmail: 'test.voter@example.com',
      voterLinkedIn: 'https://linkedin.com/in/testvoter',
      voterCompany: 'Test Company',
      voterJobTitle: 'Test Role',
      voterCountry: 'United States',
      nomineeDisplayName: 'Test Nominee',
      nomineeUrl: 'https://worldstaffingawards.com/nominee/test',
      categoryName: 'Test Category',
      subcategoryName: 'Test Subcategory',
      voteTimestamp: new Date().toISOString()
    };

    console.log('   Testing vote confirmation email...');
    const voteEmailResult = await loopsTransactional.sendVoteConfirmationEmail(testVoteEmailData);
    
    if (voteEmailResult.success) {
      console.log('   ✅ Vote confirmation email test successful');
      console.log(`   Message ID: ${voteEmailResult.messageId}`);
    } else {
      console.log('   ❌ Vote confirmation email test failed:', voteEmailResult.error);
    }

  } catch (error) {
    console.log('   ❌ Loops transactional service test failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Test vote API with email
  console.log('3. Testing Vote API with Email:');
  try {
    // First get a nominee to vote for
    const nomineesResponse = await fetch('http://localhost:3000/api/nominees?limit=1');
    const nomineesResult = await nomineesResponse.json();
    
    if (!nomineesResult.success || !nomineesResult.data || nomineesResult.data.length === 0) {
      console.log('   ⚠️  No nominees available for vote testing');
      return;
    }

    const testNominee = nomineesResult.data[0];
    console.log(`   Testing vote for: ${testNominee.name}`);

    const votePayload = {
      subcategoryId: testNominee.category,
      votedForDisplayName: testNominee.name,
      firstname: 'Test',
      lastname: 'Voter',
      email: `test.voter.${Date.now()}@example.com`, // Unique email to avoid duplicates
      linkedin: 'https://linkedin.com/in/testvoter',
      company: 'Test Company',
      jobTitle: 'Test Role',
      country: 'United States'
    };

    console.log('   Submitting test vote...');
    const voteResponse = await fetch('http://localhost:3000/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(votePayload),
    });

    const voteResult = await voteResponse.json();
    
    if (voteResponse.ok && voteResult.ok) {
      console.log('   ✅ Vote submitted successfully');
      console.log(`   Vote ID: ${voteResult.voteId}`);
      console.log(`   Email sent: ${voteResult.emailSent ? '✅ Yes' : '❌ No'}`);
      
      if (!voteResult.emailSent) {
        console.log('   ⚠️  Vote email was not sent - check server logs for details');
      }
    } else {
      console.log('   ❌ Vote submission failed:', voteResult.error || 'Unknown error');
    }

  } catch (error) {
    console.log('   ❌ Vote API test failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Test nomination submission email
  console.log('4. Testing Nomination Submission Email:');
  try {
    const testNominationPayload = {
      type: 'person',
      categoryGroupId: 'staffing',
      subcategoryId: 'best-staffing-firm',
      nominator: {
        firstname: 'Test',
        lastname: 'Nominator',
        email: `test.nominator.${Date.now()}@example.com`,
        company: 'Test Company',
        jobTitle: 'Test Role',
        linkedin: '',
        phone: '',
        country: 'United States'
      },
      nominee: {
        firstname: 'Test',
        lastname: 'EmailNominee',
        email: `test.nominee.${Date.now()}@example.com`,
        jobtitle: 'Test Position',
        company: 'Test Company',
        linkedin: '',
        phone: '',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'Test nomination for email testing',
        liveUrl: 'https://example.com',
        bio: 'Test bio',
        achievements: 'Test achievements'
      }
    };

    console.log('   Submitting test nomination...');
    const nominationResponse = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testNominationPayload),
    });

    const nominationResult = await nominationResponse.json();
    
    if (nominationResponse.ok && nominationResult.success) {
      console.log('   ✅ Nomination submitted successfully');
      console.log(`   Nomination ID: ${nominationResult.nominationId}`);
      console.log(`   Nominator email sent: ${nominationResult.emails?.nominatorConfirmationSent ? '✅ Yes' : '❌ No'}`);
    } else {
      console.log('   ❌ Nomination submission failed:', nominationResult.error || 'Unknown error');
    }

  } catch (error) {
    console.log('   ❌ Nomination API test failed:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Check for duplicate email prevention
  console.log('5. Testing Duplicate Email Prevention:');
  console.log('   This test checks if the system prevents sending duplicate emails');
  console.log('   when admin approves nominations multiple times.');
  console.log('   Manual test: Try approving the same nomination twice in admin panel');
  console.log('   Expected: Only one email should be sent to the nominee');

  console.log('\n📧 Email Functionality Test Complete!');
  
  console.log('\n📋 Summary:');
  console.log('- Loops Configuration: Check environment variables');
  console.log('- Vote Confirmation Emails: Test via vote API');
  console.log('- Nomination Confirmation Emails: Test via nomination API');
  console.log('- Duplicate Prevention: Manual admin panel test required');
  console.log('- Admin Approval Emails: Test via admin panel approval');
}

// Run the test
testEmailFunctionality().catch(console.error);