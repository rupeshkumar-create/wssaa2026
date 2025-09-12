#!/usr/bin/env node

/**
 * Debug nomination form submission issues
 */

const testAPIs = async () => {
  console.log('🔍 Debugging nomination form APIs...\n');
  
  // Test 1: Check settings API
  console.log('1️⃣ Testing settings API...');
  try {
    const settingsResponse = await fetch('http://localhost:3000/api/settings');
    console.log('Settings status:', settingsResponse.status);
    
    if (settingsResponse.ok) {
      const settingsData = await settingsResponse.json();
      console.log('Settings data:', JSON.stringify(settingsData, null, 2));
    } else {
      const errorText = await settingsResponse.text();
      console.log('Settings error:', errorText);
    }
  } catch (error) {
    console.error('Settings API error:', error.message);
  }
  
  // Test 2: Check categories API
  console.log('\n2️⃣ Testing categories API...');
  try {
    const categoriesResponse = await fetch('http://localhost:3000/api/categories');
    console.log('Categories status:', categoriesResponse.status);
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('Categories count:', categoriesData.data?.length || 0);
      console.log('Sample categories:', categoriesData.data?.slice(0, 3).map(c => ({ id: c.id, name: c.name })));
    } else {
      const errorText = await categoriesResponse.text();
      console.log('Categories error:', errorText);
    }
  } catch (error) {
    console.error('Categories API error:', error.message);
  }
  
  // Test 3: Test minimal nomination payload
  console.log('\n3️⃣ Testing minimal nomination submission...');
  const minimalPayload = {
    type: 'person',
    categoryGroupId: 'role-specific-excellence',
    subcategoryId: 'top-recruiter',
    nominator: {
      email: 'debug@example.com',
      firstname: 'Debug',
      lastname: 'User'
    },
    nominee: {
      firstname: 'Test',
      lastname: 'Nominee',
      jobtitle: 'Recruiter',
      email: 'nominee@example.com',
      whyMe: 'Test nomination for debugging'
    }
  };
  
  try {
    console.log('Sending minimal payload...');
    const nominationResponse = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalPayload)
    });
    
    console.log('Nomination status:', nominationResponse.status);
    console.log('Nomination headers:', Object.fromEntries(nominationResponse.headers.entries()));
    
    let nominationData;
    try {
      nominationData = await nominationResponse.json();
    } catch (parseError) {
      console.error('Failed to parse nomination response:', parseError.message);
      const text = await nominationResponse.text();
      console.log('Raw response:', text);
      return;
    }
    
    if (nominationResponse.ok) {
      console.log('✅ Minimal nomination successful!');
      console.log('Nomination ID:', nominationData.nominationId);
    } else {
      console.log('❌ Minimal nomination failed');
      console.log('Error:', nominationData.error);
      console.log('Details:', nominationData.details);
      
      // If it's a validation error, show the specific issues
      if (nominationData.validationErrors) {
        console.log('Validation errors:');
        nominationData.validationErrors.forEach(err => {
          console.log(`  - ${err.field}: ${err.message}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Nomination test error:', error.message);
  }
  
  // Test 4: Check if server is responding at all
  console.log('\n4️⃣ Testing server health...');
  try {
    const healthResponse = await fetch('http://localhost:3000/api/test-env');
    console.log('Health check status:', healthResponse.status);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Server is responding:', healthData.message || 'OK');
    }
  } catch (error) {
    console.error('Health check error:', error.message);
  }
};

testAPIs();