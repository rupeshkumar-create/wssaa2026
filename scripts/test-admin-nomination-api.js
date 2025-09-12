#!/usr/bin/env node

/**
 * Test script for admin nomination API
 */

const testAdminNomination = async () => {
  console.log('🧪 Testing Admin Nomination API...');
  
  const testPayload = {
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
      email: 'test@example.com',
      linkedin: 'https://linkedin.com/in/test',
      jobtitle: 'Senior Recruiter',
      company: 'Test Company',
      phone: '+1234567890',
      country: 'USA',
      headshotUrl: '',
      whyMe: 'This is a test nomination to verify the API is working correctly.',
      bio: 'Test biography',
      achievements: 'Test achievements'
    },
    adminNotes: 'Test nomination created via API test script',
    bypassNominationStatus: true,
    isAdminNomination: true
  };

  try {
    console.log('📤 Sending request to /api/admin/nominations/submit');
    console.log('📤 Payload:', JSON.stringify(testPayload, null, 2));
    
    const response = await fetch('http://localhost:3000/api/admin/nominations/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const result = await response.json();
    console.log('📥 Response body:', JSON.stringify(result, null, 2));

    if (response.ok && result.success) {
      console.log('✅ Admin nomination API test PASSED');
      console.log('✅ Nomination ID:', result.nominationId);
      console.log('✅ Nominee ID:', result.nomineeId);
      console.log('✅ Nominator ID:', result.nominatorId);
    } else {
      console.log('❌ Admin nomination API test FAILED');
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

// Run the test
testAdminNomination();