#!/usr/bin/env node

/**
 * Fix nominator tags in HubSpot
 * Updates existing nominators from "WSA 2026 Nominator" to "Nominator 2026"
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://wssaa2026.vercel.app';

console.log('🏷️ Fixing Nominator Tags in HubSpot');
console.log('==================================');
console.log(`Target URL: ${VERCEL_URL}`);
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
        'User-Agent': 'WSA-Tag-Fix-Script/1.0',
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
 * Update HubSpot properties to include correct tag options
 */
async function updateHubSpotProperties() {
  console.log('1️⃣ Updating HubSpot Custom Properties...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/setup-properties`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      console.log('✅ HubSpot properties updated successfully');
      console.log('📊 Update result:', response.data);
      return true;
    } else {
      console.log('❌ HubSpot properties update failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Properties update failed:', error.message);
    return false;
  }
}

/**
 * Test the new tagging with a sample nomination
 */
async function testNewTagging() {
  console.log('2️⃣ Testing New Nominator Tagging...');
  
  const testNomination = {
    type: 'person',
    categoryGroupId: '1',
    subcategoryId: '1',
    nominator: {
      firstname: 'Tag',
      lastname: 'Test',
      email: 'tag-test-nominator@worldstaffingawards.com',
      company: 'Tag Test Company',
      jobTitle: 'Tag Manager',
      linkedin: 'https://linkedin.com/in/tag-test',
      phone: '+1234567890',
      country: 'United States'
    },
    nominee: {
      firstname: 'Test',
      lastname: 'Nominee',
      email: 'tag-test-nominee@worldstaffingawards.com',
      company: 'Test Company',
      jobtitle: 'Test Developer',
      linkedin: 'https://linkedin.com/in/test-nominee',
      phone: '+0987654321',
      country: 'Canada',
      headshotUrl: 'https://example.com/test-headshot.jpg',
      whyMe: 'Test tag verification',
      bio: 'Test bio',
      achievements: 'Test achievements'
    }
  };

  try {
    const response = await makeRequest(`${VERCEL_URL}/api/nomination/submit`, {
      method: 'POST',
      body: testNomination
    });
    
    if (response.status === 201) {
      console.log('✅ Test nomination submitted successfully');
      
      const result = response.data;
      
      if (result.hubspotSync?.nominatorSynced) {
        console.log('✅ Nominator synced with new "Nominator 2026" tag');
      } else {
        console.log('❌ Nominator NOT synced');
      }
      
      if (result.hubspotSync?.nomineeSynced) {
        console.log('✅ Nominee synced successfully');
      } else {
        console.log('❌ Nominee NOT synced');
      }
      
      return {
        success: true,
        nominationId: result.nominationId
      };
    } else {
      console.log('❌ Test nomination failed:', response.status);
      console.log('📊 Error:', response.data);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Test nomination failed:', error.message);
    return { success: false };
  }
}

/**
 * Trigger manual sync to update existing nominators
 */
async function triggerManualSync() {
  console.log('3️⃣ Triggering Manual Sync for Existing Nominators...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/run`, {
      method: 'POST',
      body: { 
        force: true,
        updateTags: true,
        processAll: true 
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Manual sync completed successfully');
      console.log('📊 Sync result:', response.data);
      return true;
    } else {
      console.log('❌ Manual sync failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Manual sync failed:', error.message);
    return false;
  }
}

/**
 * Main fix function
 */
async function fixNominatorTags() {
  console.log('🚀 Starting Nominator Tag Fix...\n');
  
  const results = {
    propertiesUpdated: false,
    testPassed: false,
    syncCompleted: false
  };
  
  // Step 1: Update HubSpot properties
  results.propertiesUpdated = await updateHubSpotProperties();
  console.log('');
  
  if (!results.propertiesUpdated) {
    console.log('❌ Cannot proceed without updating properties.');
    return results;
  }
  
  // Step 2: Test new tagging
  const testResult = await testNewTagging();
  results.testPassed = testResult.success;
  console.log('');
  
  // Step 3: Trigger manual sync for existing data
  results.syncCompleted = await triggerManualSync();
  console.log('');
  
  // Summary
  console.log('📋 Fix Results Summary');
  console.log('=====================');
  console.log(`Properties Updated: ${results.propertiesUpdated ? '✅' : '❌'}`);
  console.log(`New Tagging Test: ${results.testPassed ? '✅' : '❌'}`);
  console.log(`Manual Sync: ${results.syncCompleted ? '✅' : '❌'}`);
  
  const allGood = results.propertiesUpdated && results.testPassed && results.syncCompleted;
  
  console.log('');
  if (allGood) {
    console.log('🎉 Nominator tags fixed successfully!');
    console.log('');
    console.log('✅ What was fixed:');
    console.log('   - HubSpot property options updated to include "Nominator 2026"');
    console.log('   - New nominations will use "Nominator 2026" tag');
    console.log('   - Existing nominators updated with correct tags');
    console.log('');
    console.log('🔍 To verify:');
    console.log('   1. Check HubSpot contacts with WSA role = "Nominator"');
    console.log('   2. Look for "Nominator 2026" in the WSA Contact Tag field');
    console.log('   3. Submit a new nomination to test the fix');
  } else {
    console.log('⚠️ Some issues remain. Please check the logs and try again.');
    console.log('');
    console.log('🔧 Manual steps if needed:');
    console.log('   1. Go to HubSpot → Settings → Properties → Contact Properties');
    console.log('   2. Find "WSA Contact Tag" property');
    console.log('   3. Edit the dropdown options to include "Nominator 2026"');
    console.log('   4. Update existing contacts manually or re-run this script');
  }
  
  return results;
}

// Run fix if this script is executed directly
if (require.main === module) {
  fixNominatorTags().catch(console.error);
}

module.exports = { fixNominatorTags };