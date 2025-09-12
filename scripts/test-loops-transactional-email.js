#!/usr/bin/env node

/**
 * Test script for Loops transactional email functionality
 * Tests the vote confirmation email system
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

async function testLoopsTransactionalEmail() {
  console.log('🧪 Testing Loops Transactional Email System...\n');

  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`LOOPS_API_KEY: ${process.env.LOOPS_API_KEY ? '✅ Set' : '❌ Missing'}`);
  console.log(`LOOPS_TRANSACTIONAL_ENABLED: ${process.env.LOOPS_TRANSACTIONAL_ENABLED || 'true'}`);
  console.log('');

  if (!process.env.LOOPS_API_KEY) {
    console.error('❌ LOOPS_API_KEY is required for testing');
    process.exit(1);
  }

  try {
    // Import the transactional service
    const { LoopsTransactionalService } = await import('../src/server/loops/transactional.ts');
    const loopsService = new LoopsTransactionalService();

    // Test data
    const testVoteData = {
      voterFirstName: 'John',
      voterLastName: 'Doe',
      voterEmail: 'rupesh.kumar@candidate.ly', // Use your email for testing
      nomineeDisplayName: 'Jane Smith',
      nomineeUrl: 'https://worldstaffingawards.com/nominee/jane-smith',
      categoryName: 'Top Recruiter',
      subcategoryName: 'Top Recruiter',
      voteTimestamp: new Date().toISOString()
    };

    console.log('📧 Test Vote Confirmation Email Data:');
    console.log(JSON.stringify(testVoteData, null, 2));
    console.log('');

    console.log('🔄 Sending test vote confirmation email...');
    
    const result = await loopsService.sendVoteConfirmationEmail(testVoteData);

    if (result.success) {
      console.log('✅ Vote confirmation email sent successfully!');
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Sent to: ${testVoteData.voterEmail}`);
    } else {
      console.error('❌ Vote confirmation email failed:');
      console.error(`Error: ${result.error}`);
    }

    console.log('\n🧪 Testing raw transactional email API...');
    
    // Test raw API call
    const rawResult = await loopsService.sendTransactionalEmail({
      transactionalId: 'cmfb0nmgv7ewn0p0i063876oq',
      email: 'rupesh.kumar@candidate.ly',
      dataVariables: {
        voterFirstName: 'Test',
        voterLastName: 'User',
        voterFullName: 'Test User',
        nomineeDisplayName: 'Test Nominee',
        nomineeUrl: 'https://example.com/nominee/test',
        categoryName: 'Test Category',
        subcategoryName: 'Test Subcategory',
        voteTimestamp: new Date().toISOString(),
        voteDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        voteTime: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          timeZoneName: 'short'
        })
      }
    });

    if (rawResult.success) {
      console.log('✅ Raw transactional email sent successfully!');
      console.log(`📧 Message ID: ${rawResult.messageId}`);
    } else {
      console.error('❌ Raw transactional email failed:');
      console.error(`Error: ${rawResult.error}`);
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    process.exit(1);
  }

  console.log('\n✅ Loops transactional email test completed!');
  console.log('\n📝 Next steps:');
  console.log('1. Check your email inbox for the test emails');
  console.log('2. Verify the email template renders correctly');
  console.log('3. Test the nominee URL link works');
  console.log('4. Cast a real vote to test the integration');
}

// Run the test
testLoopsTransactionalEmail().catch(console.error);