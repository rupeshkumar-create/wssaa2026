#!/usr/bin/env node

/**
 * Test script for nomination submission API
 */

const testNominationSubmission = async () => {
  console.log('🧪 Testing Nomination Submission API...');
  
  const testPayload = {
    type: 'person',
    categoryGroupId: 'role-specific-excellence',
    subcategoryId: 'top-recruiter',
    nominator: {
      email: 'test.nominator@example.com',
      firstname: 'Test',
      lastname: 'Nominator',
      linkedin: 'https://linkedin.com/in/test-nominator',
      company: 'Test Company',
      jobTitle: 'HR Manager',
      phone: '+1234567890',
      country: 'USA'
    },
    nominee: {
      firstname: 'Test',
      lastname: 'Nominee',
      jobtitle: 'Senior Recruiter',
      email: 'test.nominee@example.com',
      linkedin: 'https://linkedin.com/in/test-nominee',
      phone: '+1234567890',
      company: 'Nominee Company',
      country: 'USA',
      headshotUrl: 'https://example.com/headshot.jpg',
      whyMe: 'This is a test nomination to verify the API is working correctly. The nominee has excellent recruiting skills and has helped many companies find top talent.'
    }
  };

  try {
    console.log('📤 Sending request to /api/nomination/submit');
    console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    let result;
    try {
      result = await response.json();
      console.log('📥 Response body:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse response JSON:', parseError);
      const text = await response.text();
      console.log('📥 Raw response:', text);
      return;
    }

    if (response.ok && result.nominationId) {
      console.log('✅ Nomination submission API test PASSED');
      console.log('✅ Nomination ID:', result.nominationId);
      console.log('✅ Nominator ID:', result.nominatorId);
      console.log('✅ Nominee ID:', result.nomineeId);
      console.log('✅ Processing time:', result.processingTime + 'ms');
    } else {
      console.log('❌ Nomination submission API test FAILED');
      console.log('❌ Error:', result.error);
      if (result.details) {
        console.log('❌ Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Test script error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
};

// Test with company nomination as well
const testCompanyNomination = async () => {
  console.log('\n🧪 Testing Company Nomination Submission...');
  
  const testPayload = {
    type: 'company',
    categoryGroupId: 'innovation-technology',
    subcategoryId: 'top-ai-driven-staffing-platform',
    nominator: {
      email: 'test.nominator2@example.com',
      firstname: 'Test',
      lastname: 'Nominator2',
      linkedin: 'https://linkedin.com/in/test-nominator2',
      company: 'Test Company 2',
      jobTitle: 'CEO',
      phone: '+1234567891',
      country: 'USA'
    },
    nominee: {
      name: 'Test AI Company',
      website: 'https://testaicompany.com',
      linkedin: 'https://linkedin.com/company/test-ai-company',
      phone: '+1234567892',
      country: 'USA',
      size: '51-200',
      industry: 'Technology',
      logoUrl: 'https://example.com/logo.jpg',
      whyUs: 'This is a test company nomination. The company has developed innovative AI solutions for staffing and recruitment.'
    }
  };

  try {
    console.log('📤 Sending company nomination request');
    
    const response = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Company response status:', response.status);

    let result;
    try {
      result = await response.json();
      console.log('📥 Company response body:', JSON.stringify(result, null, 2));
    } catch (parseError) {
      console.error('❌ Failed to parse company response JSON:', parseError);
      const text = await response.text();
      console.log('📥 Raw company response:', text);
      return;
    }

    if (response.ok && result.nominationId) {
      console.log('✅ Company nomination submission API test PASSED');
      console.log('✅ Company Nomination ID:', result.nominationId);
    } else {
      console.log('❌ Company nomination submission API test FAILED');
      console.log('❌ Company Error:', result.error);
      if (result.details) {
        console.log('❌ Company Details:', result.details);
      }
    }

  } catch (error) {
    console.error('❌ Company test script error:', error);
  }
};

// Run the tests
const runTests = async () => {
  await testNominationSubmission();
  await testCompanyNomination();
};

runTests();