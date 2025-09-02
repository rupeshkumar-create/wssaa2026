#!/usr/bin/env node

/**
 * Test HubSpot sync functionality in production environment
 * This script will verify that both nominator and nominee data syncs properly to HubSpot
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://wssaa2026.vercel.app';
const TEST_EMAIL = 'test-sync@worldstaffingawards.com';

console.log('🧪 Testing HubSpot Sync in Production');
console.log('=====================================');
console.log(`Target URL: ${VERCEL_URL}`);
console.log(`Test Email: ${TEST_EMAIL}`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WSA-Test-Script/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Test environment variables
 */
async function testEnvironment() {
  console.log('1️⃣ Testing Environment Configuration...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/test-env`);
    
    if (response.status === 200) {
      console.log('✅ Environment API accessible');
      console.log('📊 Environment status:', response.data);
      
      if (response.data.hubspot?.enabled) {
        console.log('✅ HubSpot sync is enabled');
      } else {
        console.log('❌ HubSpot sync is disabled or not configured');
        console.log('   Check HUBSPOT_SYNC_ENABLED and HUBSPOT_ACCESS_TOKEN');
        return false;
      }
      
      return true;
    } else {
      console.log('❌ Environment API failed:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Environment test failed:', error.message);
    return false;
  }
}

/**
 * Test form submission with HubSpot sync
 */
async function testFormSubmission() {
  console.log('2️⃣ Testing Form Submission with HubSpot Sync...');
  
  const testNomination = {
    type: 'person',
    categoryGroupId: '1',
    subcategoryId: '1',
    nominator: {
      firstname: 'Test',
      lastname: 'Nominator',
      email: TEST_EMAIL,
      company: 'Test Company',
      jobTitle: 'Test Manager',
      linkedin: 'https://linkedin.com/in/test-nominator',
      phone: '+1234567890',
      country: 'United States'
    },
    nominee: {
      firstname: 'Test',
      lastname: 'Nominee',
      email: 'test-nominee@worldstaffingawards.com',
      company: 'Nominee Company',
      jobtitle: 'Senior Developer',
      linkedin: 'https://linkedin.com/in/test-nominee',
      phone: '+0987654321',
      country: 'Canada',
      headshotUrl: 'https://example.com/headshot.jpg',
      whyMe: 'Test nomination reason',
      bio: 'Test bio',
      achievements: 'Test achievements'
    }
  };

  try {
    console.log('📤 Submitting test nomination...');
    
    const response = await makeRequest(`${VERCEL_URL}/api/nomination/submit`, {
      method: 'POST',
      body: testNomination
    });
    
    if (response.status === 201) {
      console.log('✅ Nomination submitted successfully');
      console.log('📊 Response:', response.data);
      
      // Check HubSpot sync status
      if (response.data.hubspotSync) {
        if (response.data.hubspotSync.nominatorSynced) {
          console.log('✅ Nominator synced to HubSpot');
        } else {
          console.log('⚠️ Nominator NOT synced to HubSpot');
        }
        
        if (response.data.hubspotSync.nomineeSynced) {
          console.log('✅ Nominee synced to HubSpot');
        } else {
          console.log('⚠️ Nominee NOT synced to HubSpot');
        }
        
        if (response.data.hubspotSync.outboxCreated) {
          console.log('✅ HubSpot outbox entry created for backup sync');
        }
      } else {
        console.log('❌ No HubSpot sync information in response');
      }
      
      return response.data;
    } else {
      console.log('❌ Nomination submission failed:', response.status);
      console.log('📊 Error:', response.data);
      return null;
    }
  } catch (error) {
    console.log('❌ Form submission test failed:', error.message);
    return null;
  }
}

/**
 * Test manual HubSpot sync endpoint
 */
async function testManualSync() {
  console.log('3️⃣ Testing Manual HubSpot Sync...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/run`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      console.log('✅ Manual sync endpoint accessible');
      console.log('📊 Sync result:', response.data);
      return true;
    } else {
      console.log('❌ Manual sync failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Manual sync test failed:', error.message);
    return false;
  }
}

/**
 * Test nominee approval sync
 */
async function testApprovalSync(nominationId) {
  if (!nominationId) {
    console.log('⏭️ Skipping approval sync test (no nomination ID)');
    return false;
  }
  
  console.log('4️⃣ Testing Nominee Approval Sync...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/nomination/approve`, {
      method: 'POST',
      body: { nominationId }
    });
    
    if (response.status === 200) {
      console.log('✅ Nomination approved successfully');
      console.log('📊 Approval result:', response.data);
      
      if (response.data.hubspotSync?.nomineeSynced) {
        console.log('✅ Nominee synced to HubSpot on approval');
      } else {
        console.log('⚠️ Nominee NOT synced to HubSpot on approval');
      }
      
      return true;
    } else {
      console.log('❌ Nomination approval failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Approval sync test failed:', error.message);
    return false;
  }
}

/**
 * Test vote submission with HubSpot sync
 */
async function testVoteSync() {
  console.log('5️⃣ Testing Vote Submission with HubSpot Sync...');
  
  const testVote = {
    nomineeId: '1', // Use a test nominee ID
    subcategoryId: '1',
    voter: {
      firstname: 'Test',
      lastname: 'Voter',
      email: 'test-voter@worldstaffingawards.com',
      company: 'Voter Company',
      jobTitle: 'Voter Manager',
      linkedin: 'https://linkedin.com/in/test-voter',
      phone: '+1122334455',
      country: 'United Kingdom'
    }
  };

  try {
    const response = await makeRequest(`${VERCEL_URL}/api/vote`, {
      method: 'POST',
      body: testVote
    });
    
    if (response.status === 200 || response.status === 201) {
      console.log('✅ Vote submitted successfully');
      console.log('📊 Vote result:', response.data);
      
      if (response.data.hubspotSync?.voterSynced) {
        console.log('✅ Voter synced to HubSpot');
      } else {
        console.log('⚠️ Voter NOT synced to HubSpot');
      }
      
      return true;
    } else {
      console.log('❌ Vote submission failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Vote sync test failed:', error.message);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🚀 Starting HubSpot Sync Tests...\n');
  
  const results = {
    environment: false,
    formSubmission: false,
    manualSync: false,
    approvalSync: false,
    voteSync: false
  };
  
  // Test 1: Environment
  results.environment = await testEnvironment();
  console.log('');
  
  if (!results.environment) {
    console.log('❌ Environment test failed. Cannot proceed with other tests.');
    return results;
  }
  
  // Test 2: Form submission
  const submissionResult = await testFormSubmission();
  results.formSubmission = !!submissionResult;
  console.log('');
  
  // Test 3: Manual sync
  results.manualSync = await testManualSync();
  console.log('');
  
  // Test 4: Approval sync (if we have a nomination ID)
  if (submissionResult?.nominationId) {
    results.approvalSync = await testApprovalSync(submissionResult.nominationId);
    console.log('');
  }
  
  // Test 5: Vote sync
  results.voteSync = await testVoteSync();
  console.log('');
  
  // Summary
  console.log('📋 Test Results Summary');
  console.log('======================');
  console.log(`Environment: ${results.environment ? '✅' : '❌'}`);
  console.log(`Form Submission: ${results.formSubmission ? '✅' : '❌'}`);
  console.log(`Manual Sync: ${results.manualSync ? '✅' : '❌'}`);
  console.log(`Approval Sync: ${results.approvalSync ? '✅' : '❌'}`);
  console.log(`Vote Sync: ${results.voteSync ? '✅' : '❌'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log('');
  console.log(`🎯 Overall: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All HubSpot sync tests passed! The integration is working correctly.');
  } else {
    console.log('⚠️ Some tests failed. Please check the configuration and logs.');
  }
  
  return results;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };