#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testFixedFormSubmission() {
  console.log('🧪 Testing Fixed Form Submission...\n');

  // Test 1: Public nomination (should check nomination status)
  console.log('1. Testing Public Nomination:');
  const publicPayload = {
    type: 'person',
    categoryGroupId: 'staffing',
    subcategoryId: 'best-staffing-firm',
    nominator: {
      firstname: 'John',
      lastname: 'Doe',
      email: 'john.doe@example.com',
      company: 'Test Staffing Co',
      jobTitle: 'CEO',
      linkedin: 'https://linkedin.com/in/johndoe',
      phone: '+1234567890',
      country: 'United States'
    },
    nominee: {
      firstname: 'Jane',
      lastname: 'Smith',
      email: 'jane.smith@example.com',
      jobtitle: 'Senior Recruiter',
      company: 'Amazing Staffing',
      linkedin: 'https://linkedin.com/in/janesmith',
      phone: '+1987654321',
      country: 'United States',
      headshotUrl: 'https://example.com/headshot.jpg',
      whyMe: 'Exceptional performance in staffing industry with 10+ years experience',
      liveUrl: 'https://example.com/jane-smith',
      bio: 'Senior recruiter with expertise in tech staffing',
      achievements: 'Placed 500+ candidates, 95% retention rate'
    }
  };

  await testSubmission('Public', publicPayload, false);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Admin nomination (should bypass nomination status)
  console.log('2. Testing Admin Nomination:');
  const adminPayload = {
    ...publicPayload,
    bypassNominationStatus: true,
    isAdminNomination: true,
    adminNotes: 'Submitted via admin panel for testing'
  };

  await testSubmission('Admin', adminPayload, true);

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Company nomination
  console.log('3. Testing Company Nomination:');
  const companyPayload = {
    type: 'company',
    categoryGroupId: 'staffing',
    subcategoryId: 'best-staffing-firm',
    nominator: {
      firstname: 'Bob',
      lastname: 'Johnson',
      email: 'bob.johnson@example.com',
      company: 'Nominator Company',
      jobTitle: 'HR Director',
      linkedin: '',
      phone: '',
      country: 'United States'
    },
    nominee: {
      name: 'Elite Staffing Solutions',
      email: 'contact@elitestaffing.com',
      website: 'https://elitestaffing.com',
      linkedin: 'https://linkedin.com/company/elite-staffing',
      phone: '+1555123456',
      country: 'United States',
      size: '100-500',
      industry: 'Staffing & Recruiting',
      logoUrl: 'https://example.com/logo.png',
      whyUs: 'Leading staffing firm with innovative solutions',
      liveUrl: 'https://elitestaffing.com',
      bio: 'Premier staffing solutions provider',
      achievements: 'Industry leader for 15+ years'
    },
    bypassNominationStatus: true
  };

  await testSubmission('Company', companyPayload, true);
}

async function testSubmission(testName, payload, isAdmin) {
  try {
    console.log(`   Submitting ${testName} nomination...`);
    console.log(`   Payload preview: ${payload.type} - ${payload.nominee.firstname || payload.nominee.name}`);

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
      console.log(`   Processing Time: ${result.processingTime}ms`);
      
      if (result.hubspotSync) {
        console.log(`   HubSpot Sync - Nominator: ${result.hubspotSync.nominatorSynced ? '✅' : '❌'}, Nominee: ${result.hubspotSync.nomineeSynced ? '✅' : '❌'}`);
      }
      
      if (result.loopsSync) {
        console.log(`   Loops Sync - Nominator: ${result.loopsSync.nominatorSynced ? '✅' : '❌'}`);
      }
      
      if (result.emails) {
        console.log(`   Email Sent: ${result.emails.nominatorConfirmationSent ? '✅' : '❌'}`);
      }
    } else {
      console.log('   ❌ FAILED!');
      console.log(`   Error: ${result.error}`);
      if (result.details) {
        console.log(`   Details:`, result.details);
      }
      if (result.validationErrors) {
        console.log(`   Validation Errors:`, result.validationErrors);
      }
    }

  } catch (error) {
    console.log('   ❌ REQUEST FAILED!');
    console.log(`   Error: ${error.message}`);
  }
}

// Run the test
testFixedFormSubmission().catch(console.error);