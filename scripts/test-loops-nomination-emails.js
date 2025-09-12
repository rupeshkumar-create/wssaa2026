#!/usr/bin/env node

/**
 * Test script for Loops nomination transactional emails
 * Tests all three new email types:
 * 1. Nominator confirmation (after nomination submission)
 * 2. Nominee approval (when admin approves nomination)
 * 3. Nominator approval (when admin approves nomination)
 */

const BASE_URL = 'http://localhost:3000';

async function testLoopsNominationEmails() {
  console.log('🧪 Testing Loops Nomination Transactional Emails');
  console.log('=' .repeat(60));

  try {
    // Test 1: Nominator confirmation email
    console.log('\n📧 Test 1: Nominator Confirmation Email');
    console.log('-'.repeat(40));
    
    const nominatorTest = await fetch(`${BASE_URL}/api/test/loops-nomination-emails?type=nominator&email=test.nominator@example.com`);
    const nominatorResult = await nominatorTest.json();
    
    console.log('Status:', nominatorTest.status);
    console.log('Result:', JSON.stringify(nominatorResult, null, 2));
    
    if (nominatorResult.success && nominatorResult.results?.nominatorConfirmation?.success) {
      console.log('✅ Nominator confirmation email sent successfully!');
    } else {
      console.log('❌ Nominator confirmation email failed:', nominatorResult.results?.nominatorConfirmation?.error);
    }

    // Test 2: Nominee approval email
    console.log('\n📧 Test 2: Nominee Approval Email');
    console.log('-'.repeat(40));
    
    const nomineeTest = await fetch(`${BASE_URL}/api/test/loops-nomination-emails?type=nominee&email=test.nominee@example.com`);
    const nomineeResult = await nomineeTest.json();
    
    console.log('Status:', nomineeTest.status);
    console.log('Result:', JSON.stringify(nomineeResult, null, 2));
    
    if (nomineeResult.success && nomineeResult.results?.nomineeApproval?.success) {
      console.log('✅ Nominee approval email sent successfully!');
    } else {
      console.log('❌ Nominee approval email failed:', nomineeResult.results?.nomineeApproval?.error);
    }

    // Test 3: Nominator approval email
    console.log('\n📧 Test 3: Nominator Approval Email');
    console.log('-'.repeat(40));
    
    const nominatorApprovalTest = await fetch(`${BASE_URL}/api/test/loops-nomination-emails?type=nominator-approval&email=test.nominator.approval@example.com`);
    const nominatorApprovalResult = await nominatorApprovalTest.json();
    
    console.log('Status:', nominatorApprovalTest.status);
    console.log('Result:', JSON.stringify(nominatorApprovalResult, null, 2));
    
    if (nominatorApprovalResult.success && nominatorApprovalResult.results?.nominatorApproval?.success) {
      console.log('✅ Nominator approval email sent successfully!');
    } else {
      console.log('❌ Nominator approval email failed:', nominatorApprovalResult.results?.nominatorApproval?.error);
    }

    // Test 4: All emails at once
    console.log('\n📧 Test 4: All Emails at Once');
    console.log('-'.repeat(40));
    
    const allTest = await fetch(`${BASE_URL}/api/test/loops-nomination-emails?type=all&email=test.all@example.com`);
    const allResult = await allTest.json();
    
    console.log('Status:', allTest.status);
    console.log('Result:', JSON.stringify(allResult, null, 2));
    
    const allSuccess = allResult.success && 
      allResult.results?.nominatorConfirmation?.success &&
      allResult.results?.nomineeApproval?.success &&
      allResult.results?.nominatorApproval?.success;
    
    if (allSuccess) {
      console.log('✅ All emails sent successfully!');
    } else {
      console.log('❌ Some emails failed:');
      if (!allResult.results?.nominatorConfirmation?.success) {
        console.log('  - Nominator confirmation:', allResult.results?.nominatorConfirmation?.error);
      }
      if (!allResult.results?.nomineeApproval?.success) {
        console.log('  - Nominee approval:', allResult.results?.nomineeApproval?.error);
      }
      if (!allResult.results?.nominatorApproval?.success) {
        console.log('  - Nominator approval:', allResult.results?.nominatorApproval?.error);
      }
    }

    // Test 5: Custom email data via POST
    console.log('\n📧 Test 5: Custom Email Data (POST)');
    console.log('-'.repeat(40));
    
    const customEmailData = {
      emailType: 'nominator-confirmation',
      emailData: {
        nominatorFirstName: 'Custom',
        nominatorLastName: 'Tester',
        nominatorEmail: 'custom.test@example.com',
        nominatorCompany: 'Custom Test Company',
        nominatorJobTitle: 'Test Manager',
        nomineeDisplayName: 'Custom Nominee',
        categoryName: 'Test Category',
        subcategoryName: 'Test Subcategory',
        submissionTimestamp: new Date().toISOString()
      }
    };

    const customTest = await fetch(`${BASE_URL}/api/test/loops-nomination-emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(customEmailData)
    });
    
    const customResult = await customTest.json();
    
    console.log('Status:', customTest.status);
    console.log('Result:', JSON.stringify(customResult, null, 2));
    
    if (customResult.success && customResult.result?.success) {
      console.log('✅ Custom email sent successfully!');
    } else {
      console.log('❌ Custom email failed:', customResult.result?.error);
    }

    console.log('\n🎉 Loops Nomination Email Testing Complete!');
    console.log('=' .repeat(60));

    // Summary
    const tests = [
      { name: 'Nominator Confirmation', success: nominatorResult.success && nominatorResult.results?.nominatorConfirmation?.success },
      { name: 'Nominee Approval', success: nomineeResult.success && nomineeResult.results?.nomineeApproval?.success },
      { name: 'Nominator Approval', success: nominatorApprovalResult.success && nominatorApprovalResult.results?.nominatorApproval?.success },
      { name: 'All Emails', success: allSuccess },
      { name: 'Custom Email', success: customResult.success && customResult.result?.success }
    ];

    console.log('\n📊 Test Summary:');
    tests.forEach(test => {
      console.log(`  ${test.success ? '✅' : '❌'} ${test.name}`);
    });

    const successCount = tests.filter(t => t.success).length;
    console.log(`\n🏆 ${successCount}/${tests.length} tests passed`);

    if (successCount === tests.length) {
      console.log('🎉 All tests passed! Loops nomination emails are working correctly.');
    } else {
      console.log('⚠️  Some tests failed. Check the logs above for details.');
    }

  } catch (error) {
    console.error('❌ Test script error:', error);
    process.exit(1);
  }
}

// Run the tests
testLoopsNominationEmails().catch(console.error);