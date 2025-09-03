#!/usr/bin/env node

/**
 * Update existing nominator tags in HubSpot
 * Calls the fix endpoint directly
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://wssaa2026.vercel.app';

console.log('🔄 Updating Existing Nominator Tags');
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
        'User-Agent': 'WSA-Tag-Update-Script/1.0',
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
 * Update existing nominator tags
 */
async function updateNominatorTags() {
  console.log('🏷️ Updating existing nominator tags in HubSpot...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/fix-nominator-tags`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      console.log('✅ Nominator tags updated successfully');
      console.log('📊 Update results:');
      console.log(`   - Total found: ${response.data.results?.totalFound || 0}`);
      console.log(`   - Updated: ${response.data.results?.updated || 0}`);
      console.log(`   - Errors: ${response.data.results?.errors || 0}`);
      
      if (response.data.results?.errorDetails?.length > 0) {
        console.log('⚠️ Error details:');
        response.data.results.errorDetails.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }
      
      return true;
    } else {
      console.log('❌ Tag update failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Tag update failed:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting nominator tag update...\n');
  
  const success = await updateNominatorTags();
  
  console.log('');
  if (success) {
    console.log('🎉 Nominator tags updated successfully!');
    console.log('');
    console.log('✅ What was done:');
    console.log('   - Found all contacts with WSA role = "Nominator"');
    console.log('   - Updated their WSA Contact Tag to "Nominator 2026"');
    console.log('   - Updated database records with new tag info');
    console.log('');
    console.log('🔍 To verify:');
    console.log('   1. Go to HubSpot → Contacts');
    console.log('   2. Filter by WSA Role = "Nominator"');
    console.log('   3. Check WSA Contact Tag field shows "Nominator 2026"');
    console.log('   4. Submit a new nomination to test future submissions');
  } else {
    console.log('❌ Tag update failed. Please check the logs and try again.');
    console.log('');
    console.log('🔧 Manual steps:');
    console.log('   1. Go to HubSpot → Contacts');
    console.log('   2. Filter by WSA Role = "Nominator"');
    console.log('   3. Bulk edit to set WSA Contact Tag = "Nominator 2026"');
  }
}

// Run if this script is executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { updateNominatorTags };