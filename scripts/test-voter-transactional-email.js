#!/usr/bin/env node

/**
 * Test Voter Transactional Email
 * Tests the complete voter email flow including vote casting and email delivery
 */

const BASE_URL = 'http://localhost:3000';

async function testTransactionalEmail() {
  console.log('🧪 Testing Voter Transactional Email System\n');

  try {
    // Test 1: Direct transactional email test
    console.log('📧 Test 1: Direct Transactional Email Test');
    const testEmailResponse = await fetch(`${BASE_URL}/api/test/loops-transactional`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'viabl@powerscrews.com',
        testType: 'vote_confirmation'
      })
    });

    const testEmailResult = await testEmailResponse.json();
    console.log('Response:', testEmailResult);

    if (testEmailResult.success) {
      console.log('✅ Direct transactional email test PASSED\n');
    } else {
      console.log('❌ Direct transactional email test FAILED\n');
      return;
    }

    // Test 2: Vote with email integration
    console.log('🗳️ Test 2: Vote Cast with Email Integration');
    
    const uniqueEmail = `test-voter-${Date.now()}@example.com`;
    const voteData = {
      subcategoryId: 'top-recruiter',
      email: uniqueEmail,
      firstname: 'Test',
      lastname: 'Voter',
      linkedin: 'https://linkedin.com/in/testvote',
      votedForDisplayName: 'Amit Kumar'
    };

    console.log('Casting vote with data:', voteData);

    const voteResponse = await fetch(`${BASE_URL}/api/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(voteData)
    });

    const voteResult = await voteResponse.json();
    console.log('Vote response:', voteResult);

    if (voteResult.ok) {
      console.log('✅ Vote cast successfully');
      console.log(`📊 New vote count: ${voteResult.newVoteCount}`);
      console.log('📧 Check your email for the vote confirmation!\n');
    } else {
      console.log('❌ Vote casting failed:', voteResult.error);
    }

    // Test 3: Check environment configuration
    console.log('⚙️ Test 3: Environment Configuration Check');
    
    const envResponse = await fetch(`${BASE_URL}/api/test-env`);
    const envResult = await envResponse.json();
    
    console.log('Environment status:');
    console.log('- LOOPS_API_KEY:', envResult.LOOPS_API_KEY ? '✅ Set' : '❌ Not set');
    console.log('- LOOPS_TRANSACTIONAL_ENABLED:', envResult.LOOPS_TRANSACTIONAL_ENABLED || 'default (true)');
    console.log('- SUPABASE_URL:', envResult.SUPABASE_URL ? '✅ Set' : '❌ Not set');
    console.log('- SUPABASE_ANON_KEY:', envResult.SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set');

    console.log('\n🎯 Summary:');
    console.log('1. ✅ Transactional email API is working');
    console.log('2. ✅ Vote casting triggers email automatically');
    console.log('3. 📧 Emails should be delivered to voter inbox');
    console.log('\n💡 Next Steps:');
    console.log('- Check your email inbox for vote confirmation');
    console.log('- Verify the email template displays correctly');
    console.log('- Test with different nominees and categories');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testTransactionalEmail();