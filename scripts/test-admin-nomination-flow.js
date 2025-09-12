#!/usr/bin/env node

/**
 * Test script for admin nomination functionality
 * Tests the complete admin nomination flow:
 * 1. Admin creates nomination (bypasses nomination status)
 * 2. Nomination goes to draft status
 * 3. Admin approves nomination
 * 4. Nominee gets approval email with live URL
 */

const BASE_URL = 'http://localhost:3000';

// Test admin nomination data
const testAdminNomination = {
  type: 'person',
  categoryGroupId: 'role-specific-excellence',
  subcategoryId: 'top-recruiter',
  nominator: {
    firstname: 'Admin',
    lastname: 'User',
    email: 'admin@worldstaffingawards.com',
    linkedin: '',
    company: 'World Staffing Awards',
    jobTitle: 'Administrator',
    phone: '',
    country: 'Global'
  },
  nominee: {
    firstname: 'Test',
    lastname: 'Nominee',
    email: 'test.nominee.admin@example.com',
    linkedin: 'https://linkedin.com/in/testnominee',
    jobtitle: 'Senior Talent Acquisition Manager',
    company: 'Test Company Inc.',
    phone: '+1-555-0789',
    country: 'United States',
    headshotUrl: 'https://example.com/headshot.jpg',
    whyMe: 'This is a test nomination created by admin to verify the admin nomination flow works correctly.',
    bio: 'Test nominee with extensive experience in talent acquisition.',
    achievements: 'Led successful hiring initiatives, reduced time-to-hire by 30%'
  },
  adminNotes: 'Test nomination created via admin panel',
  bypassNominationStatus: true
};

async function testAdminNominationFlow() {
  console.log('🧪 Testing Admin Nomination Flow');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login as admin
    console.log('\n🔐 Step 1: Admin Login');
    console.log('-'.repeat(40));
    
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
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
      throw new Error('Admin login failed. Make sure the admin password is correct.');
    }

    const loginResult = await loginResponse.json();
    const sessionCookie = loginResponse.headers.get('set-cookie');
    
    console.log('✅ Admin login successful');

    // Step 2: Create admin nomination
    console.log('\n📝 Step 2: Creating Admin Nomination');
    console.log('-'.repeat(40));
    
    const createResponse = await fetch(`${BASE_URL}/api/nomination/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie || ''
      },
      body: JSON.stringify(testAdminNomination)
    });

    const createResult = await createResponse.json();
    
    console.log('Create Status:', createResponse.status);
    console.log('Create Result:', JSON.stringify(createResult, null, 2));

    if (!createResponse.ok || !createResult.nominationId) {
      throw new Error('Failed to create admin nomination: ' + (createResult.error || 'Unknown error'));
    }

    const nominationId = createResult.nominationId;
    console.log('✅ Admin nomination created successfully!');
    console.log('📧 Nominator confirmation email sent:', createResult.emails?.nominatorConfirmationSent ? '✅' : '❌');

    // Wait a moment for processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Approve the nomination
    console.log('\n✅ Step 3: Approving Admin Nomination');
    console.log('-'.repeat(40));

    const approveResponse = await fetch(`${BASE_URL}/api/nomination/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': sessionCookie || ''
      },
      body: JSON.stringify({
        nominationId: nominationId,
        action: 'approve',
        liveUrl: `${BASE_URL}/nominee/test-nominee-admin`,
        adminNotes: 'Approved via admin nomination flow test'
      })
    });

    const approveResult = await approveResponse.json();
    
    console.log('Approve Status:', approveResponse.status);
    console.log('Approve Result:', JSON.stringify(approveResult, null, 2));

    if (!approveResponse.ok) {
      throw new Error('Failed to approve admin nomination: ' + (approveResult.error || 'Unknown error'));
    }

    console.log('✅ Admin nomination approved successfully!');
    console.log('📧 Nominee approval email sent:', approveResult.emails?.nomineeApprovalSent ? '✅' : '❌');
    console.log('📧 Nominator approval email sent:', approveResult.emails?.nominatorApprovalSent ? '✅' : '❌');
    console.log('🔗 Live URL:', approveResult.liveUrl);

    // Step 4: Verify the nominee page is accessible
    console.log('\n🌐 Step 4: Verifying Nominee Page');
    console.log('-'.repeat(40));

    const pageResponse = await fetch(approveResult.liveUrl);
    console.log('Page Status:', pageResponse.status);
    
    if (pageResponse.ok) {
      console.log('✅ Nominee page is accessible!');
    } else {
      console.log('❌ Nominee page is not accessible');
    }

    // Step 5: Test categories API
    console.log('\n📋 Step 5: Testing Categories API');
    console.log('-'.repeat(40));

    const categoriesResponse = await fetch(`${BASE_URL}/api/categories`);
    const categoriesResult = await categoriesResponse.json();
    
    console.log('Categories Status:', categoriesResponse.status);
    console.log('Categories Count:', categoriesResult.data?.length || 0);
    
    if (categoriesResult.success && categoriesResult.data?.length > 0) {
      console.log('✅ Categories loaded successfully');
      console.log('Sample categories:');
      categoriesResult.data.slice(0, 3).forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.name} (${cat.category_groups.name})`);
      });
    } else {
      console.log('❌ Failed to load categories');
    }

    // Summary
    console.log('\n🎉 Admin Nomination Flow Test Results');
    console.log('=' .repeat(60));
    
    const results = [
      { step: 'Admin Login', success: loginResponse.ok },
      { step: 'Admin Nomination Creation', success: createResponse.ok },
      { step: 'Nominator Confirmation Email', success: createResult.emails?.nominatorConfirmationSent },
      { step: 'Nomination Approval', success: approveResponse.ok },
      { step: 'Nominee Approval Email', success: approveResult.emails?.nomineeApprovalSent },
      { step: 'Nominator Approval Email', success: approveResult.emails?.nominatorApprovalSent },
      { step: 'Nominee Page Accessible', success: pageResponse.ok },
      { step: 'Categories API', success: categoriesResponse.ok }
    ];

    console.log('\n📊 Test Results:');
    results.forEach((result, index) => {
      console.log(`  ${index + 1}. ${result.success ? '✅' : '❌'} ${result.step}`);
    });

    const successCount = results.filter(r => r.success).length;
    console.log(`\n🏆 ${successCount}/${results.length} steps completed successfully`);

    if (successCount === results.length) {
      console.log('🎉 All steps passed! Admin nomination flow is working correctly.');
    } else {
      console.log('⚠️  Some steps failed. Check the logs above for details.');
    }

    // Test data summary
    console.log('\n📋 Test Data Used:');
    console.log('  - Nomination ID:', nominationId);
    console.log('  - Nominee Email:', testAdminNomination.nominee.email);
    console.log('  - Live URL:', approveResult.liveUrl);
    console.log('  - Category:', testAdminNomination.subcategoryId);

    // Admin panel access info
    console.log('\n🔧 Admin Panel Access:');
    console.log(`  - URL: ${BASE_URL}/admin`);
    console.log(`  - Password: ${adminPassword}`);
    console.log('  - Check the nominations section to see the created nomination');

  } catch (error) {
    console.error('❌ Test flow error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testAdminNominationFlow().catch(console.error);