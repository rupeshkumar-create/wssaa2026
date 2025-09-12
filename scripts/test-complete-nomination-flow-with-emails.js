#!/usr/bin/env node

/**
 * Complete nomination flow test with Loops transactional emails
 * Tests the entire flow:
 * 1. Submit nomination -> Nominator gets confirmation email
 * 2. Admin approves nomination -> Nominee gets approval email + Nominator gets approval email
 */

const BASE_URL = 'http://localhost:3000';

// Test nomination data
const testNomination = {
  type: 'person',
  categoryGroupId: 1,
  subcategoryId: 'top-recruiter',
  nominator: {
    firstname: 'John',
    lastname: 'Doe',
    email: 'john.doe.nominator@example.com',
    linkedin: 'https://linkedin.com/in/johndoe',
    company: 'Test Recruiting Inc.',
    jobTitle: 'Senior Recruiter',
    phone: '+1-555-0123',
    country: 'United States'
  },
  nominee: {
    firstname: 'Jane',
    lastname: 'Smith',
    email: 'jane.smith.nominee@example.com',
    linkedin: 'https://linkedin.com/in/janesmith',
    jobtitle: 'VP of Talent Acquisition',
    company: 'Amazing Corp',
    phone: '+1-555-0456',
    country: 'United States',
    headshotUrl: 'https://example.com/headshot.jpg',
    whyMe: 'Jane is an exceptional talent acquisition leader with 10+ years of experience.',
    bio: 'Jane Smith is a seasoned talent acquisition professional...',
    achievements: 'Led hiring for 500+ positions, reduced time-to-hire by 40%'
  }
};

async function testCompleteNominationFlow() {
  console.log('🧪 Testing Complete Nomination Flow with Loops Emails');
  console.log('=' .repeat(70));

  try {
    // Step 1: Submit nomination
    console.log('\n📝 Step 1: Submitting Nomination');
    console.log('-'.repeat(50));
    
    const submitResponse = await fetch(`${BASE_URL}/api/nomination/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testNomination)
    });

    const submitResult = await submitResponse.json();
    
    console.log('Submit Status:', submitResponse.status);
    console.log('Submit Result:', JSON.stringify(submitResult, null, 2));

    if (!submitResponse.ok || !submitResult.nominationId) {
      throw new Error('Failed to submit nomination: ' + (submitResult.error || 'Unknown error'));
    }

    const nominationId = submitResult.nominationId;
    console.log('✅ Nomination submitted successfully!');
    console.log('📧 Nominator confirmation email sent:', submitResult.emails?.nominatorConfirmationSent ? '✅' : '❌');

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Approve nomination (requires admin auth)
    console.log('\n✅ Step 2: Approving Nomination');
    console.log('-'.repeat(50));

    // First, let's try to get admin credentials or skip if not available
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'; // Default for testing
    
    // Login as admin first
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: adminPassword
      })
    });

    if (!loginResponse.ok) {
      console.log('⚠️  Admin login failed, skipping approval test');
      console.log('   You can manually test approval by:');
      console.log(`   1. Go to ${BASE_URL}/admin`);
      console.log(`   2. Login with password: ${adminPassword}`);
      console.log(`   3. Approve nomination ID: ${nominationId}`);
      return;
    }

    const loginResult = await loginResponse.json();
    console.log('🔐 Admin login successful');

    // Get the session cookie
    const sessionCookie = loginResponse.headers.get('set-cookie');
    
    // Approve the nomination
    const approveResponse = await fetch(`${BASE_URL}/api/nomination/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie || ''
      },
      body: JSON.stringify({
        nominationId: nominationId,
        action: 'approve',
        liveUrl: `${BASE_URL}/nominee/jane-smith-test`,
        adminNotes: 'Approved via automated test'
      })
    });

    const approveResult = await approveResponse.json();
    
    console.log('Approve Status:', approveResponse.status);
    console.log('Approve Result:', JSON.stringify(approveResult, null, 2));

    if (!approveResponse.ok) {
      throw new Error('Failed to approve nomination: ' + (approveResult.error || 'Unknown error'));
    }

    console.log('✅ Nomination approved successfully!');
    console.log('📧 Nominee approval email sent:', approveResult.emails?.nomineeApprovalSent ? '✅' : '❌');
    console.log('📧 Nominator approval email sent:', approveResult.emails?.nominatorApprovalSent ? '✅' : '❌');
    console.log('🔗 Live URL:', approveResult.liveUrl);

    // Step 3: Verify the nominee page is accessible
    console.log('\n🌐 Step 3: Verifying Nominee Page');
    console.log('-'.repeat(50));

    const pageResponse = await fetch(approveResult.liveUrl);
    console.log('Page Status:', pageResponse.status);
    
    if (pageResponse.ok) {
      console.log('✅ Nominee page is accessible!');
    } else {
      console.log('❌ Nominee page is not accessible');
    }

    // Summary
    console.log('\n🎉 Complete Nomination Flow Test Results');
    console.log('=' .repeat(70));
    
    const results = [
      { step: 'Nomination Submission', success: submitResponse.ok },
      { step: 'Nominator Confirmation Email', success: submitResult.emails?.nominatorConfirmationSent },
      { step: 'Nomination Approval', success: approveResponse.ok },
      { step: 'Nominee Approval Email', success: approveResult.emails?.nomineeApprovalSent },
      { step: 'Nominator Approval Email', success: approveResult.emails?.nominatorApprovalSent },
      { step: 'Nominee Page Accessible', success: pageResponse.ok }
    ];

    console.log('\n📊 Test Results:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.success ? '✅' : '❌'} ${result.step}`);
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🏆 ${successCount}/${results.length} steps completed successfully`);

    if (successCount === results.length) {
      console.log('🎉 All steps passed! Complete nomination flow with emails is working correctly.');
    } else {
      console.log('⚠️  Some steps failed. Check the logs above for details.');
    }

    // Email summary
    console.log('\n📧 Email Summary:');
    console.log('  - Nominator Confirmation (on submission):', submitResult.emails?.nominatorConfirmationSent ? '✅ Sent' : '❌ Failed');
    console.log('  - Nominee Approval (on approval):', approveResult.emails?.nomineeApprovalSent ? '✅ Sent' : '❌ Failed');
    console.log('  - Nominator Approval (on approval):', approveResult.emails?.nominatorApprovalSent ? '✅ Sent' : '❌ Failed');

    console.log('\n📋 Test Data Used:');
    console.log('  - Nomination ID:', nominationId);
    console.log('  - Nominator Email:', testNomination.nominator.email);
    console.log('  - Nominee Email:', testNomination.nominee.email);
    console.log('  - Live URL:', approveResult.liveUrl);

  } catch (error) {
    console.error('❌ Test flow error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testCompleteNominationFlow().catch(console.error);