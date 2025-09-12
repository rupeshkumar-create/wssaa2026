#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testAdminBypassLogic() {
  console.log('🔐 Testing Admin Bypass Logic...\n');

  // Test 1: Check current nomination status
  console.log('1. Checking current nomination status:');
  try {
    const settingsResponse = await fetch('http://localhost:3000/api/settings');
    const settingsResult = await settingsResponse.json();
    
    console.log(`   Nominations Enabled: ${settingsResult.nominations_enabled}`);
    console.log(`   Settings Response:`, settingsResult);
  } catch (error) {
    console.log(`   ❌ Could not fetch settings: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Public submission (should respect nomination status)
  console.log('2. Testing Public Submission (respects nomination status):');
  const publicPayload = {
    type: 'person',
    categoryGroupId: 'staffing',
    subcategoryId: 'best-staffing-firm',
    nominator: {
      firstname: 'Public',
      lastname: 'User',
      email: 'public.user@example.com',
      company: 'Public Company',
      jobTitle: 'User',
      linkedin: '',
      phone: '',
      country: 'United States'
    },
    nominee: {
      firstname: 'Public',
      lastname: 'Nominee',
      email: 'public.nominee@example.com',
      jobtitle: 'Test Position',
      company: 'Test Company',
      linkedin: '',
      phone: '',
      country: 'United States',
      headshotUrl: 'https://example.com/headshot.jpg',
      whyMe: 'Public nomination test',
      liveUrl: 'https://example.com',
      bio: 'Test bio',
      achievements: 'Test achievements'
    }
    // No bypassNominationStatus - should check settings
  };

  await testSubmission('Public', publicPayload, false);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Admin submission with bypass (should always work)
  console.log('3. Testing Admin Submission with Bypass (should always work):');
  const adminPayload = {
    ...publicPayload,
    bypassNominationStatus: true, // This is the key flag
    isAdminNomination: true,
    adminNotes: 'Admin bypass test - should work even if nominations closed'
  };

  await testSubmission('Admin with Bypass', adminPayload, true);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Simulate closed nominations scenario
  console.log('4. Testing behavior when nominations might be closed:');
  console.log('   (Admin bypass should still work regardless of nomination status)');
  
  const adminBypassPayload = {
    type: 'company',
    categoryGroupId: 'staffing', 
    subcategoryId: 'best-staffing-firm',
    nominator: {
      firstname: 'Admin',
      lastname: 'Tester',
      email: 'admin.tester@example.com',
      company: 'Admin Company',
      jobTitle: 'Administrator',
      linkedin: '',
      phone: '',
      country: 'United States'
    },
    nominee: {
      name: 'Admin Test Company',
      email: 'admin.test@company.com',
      website: 'https://admintest.com',
      linkedin: '',
      phone: '',
      country: 'United States',
      size: '50-100',
      industry: 'Testing',
      logoUrl: 'https://example.com/logo.png',
      whyUs: 'Admin bypass test company',
      liveUrl: 'https://admintest.com',
      bio: 'Test company for admin bypass',
      achievements: 'Testing achievements'
    },
    bypassNominationStatus: true,
    isAdminNomination: true,
    adminNotes: 'Testing admin bypass for company nomination'
  };

  await testSubmission('Admin Company Bypass', adminBypassPayload, true);
}

async function testSubmission(testName, payload, expectSuccess) {
  try {
    console.log(`   Testing: ${testName}`);
    console.log(`   Expected: ${expectSuccess ? 'SUCCESS' : 'Depends on nomination status'}`);

    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`   Response Status: ${response.status}`);
    console.log(`   Response Time: ${responseTime}ms`);

    const result = await response.json();

    if (response.ok) {
      console.log('   ✅ SUCCESS!');
      console.log(`   Nomination ID: ${result.nominationId}`);
      console.log(`   State: ${result.state}`);
      
      if (payload.bypassNominationStatus) {
        console.log('   🔓 Admin bypass worked correctly!');
      }
    } else {
      console.log('   ❌ FAILED!');
      console.log(`   Error: ${result.error}`);
      
      if (result.error === 'Nominations are currently closed' && !payload.bypassNominationStatus) {
        console.log('   ℹ️  This is expected behavior for public users when nominations are closed');
      } else if (payload.bypassNominationStatus) {
        console.log('   🚨 Admin bypass should have worked but failed!');
      }
    }

  } catch (error) {
    console.log('   ❌ REQUEST FAILED!');
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testAdminBypassLogic().catch(console.error);