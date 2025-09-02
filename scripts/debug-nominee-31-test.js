#!/usr/bin/env node

/**
 * Debug script for "Nominess 31 Test" nominee issue
 */

const https = require('https');

const BASE_URL = 'https://world-staffing-awards.vercel.app';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function debugNominee31Test() {
  console.log('🔍 Debugging "Nominess 31 Test" nominee issue\n');
  
  try {
    // Test 1: Check all nominees API
    console.log('1️⃣ Checking all nominees API...');
    const allNomineesResponse = await makeRequest(`${BASE_URL}/api/nominees`);
    
    if (allNomineesResponse.status === 200) {
      const nominees = allNomineesResponse.data.data || [];
      console.log(`   Found ${nominees.length} total nominees`);
      
      // Look for "Nominess 31 Test"
      const nominee31 = nominees.find(n => 
        (n.name && n.name.toLowerCase().includes('nominess 31 test')) ||
        (n.displayName && n.displayName.toLowerCase().includes('nominess 31 test')) ||
        (n.nominee && n.nominee.name && n.nominee.name.toLowerCase().includes('nominess 31 test'))
      );
      
      if (nominee31) {
        console.log('   ✅ Found "Nominess 31 Test" in nominees list');
        console.log('   Details:');
        console.log(`     - ID: ${nominee31.id}`);
        console.log(`     - Name: ${nominee31.name || nominee31.displayName}`);
        console.log(`     - Live URL: ${nominee31.liveUrl}`);
        console.log(`     - Status: ${nominee31.status}`);
        console.log(`     - Category: ${nominee31.category}`);
        
        // Test 2: Try to access the nominee page directly
        console.log('\n2️⃣ Testing nominee page access...');
        
        // Extract slug from live URL or generate one
        let slug = '';
        if (nominee31.liveUrl) {
          slug = nominee31.liveUrl.split('/').pop();
        } else {
          const name = nominee31.name || nominee31.displayName || '';
          slug = name.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        }
        
        console.log(`   Testing slug: ${slug}`);
        
        // Test individual nominee API
        const individualResponse = await makeRequest(`${BASE_URL}/api/nominees/${slug}`);
        console.log(`   Individual API status: ${individualResponse.status}`);
        
        if (individualResponse.status === 200) {
          console.log('   ✅ Individual nominee API working');
        } else {
          console.log('   ❌ Individual nominee API failed');
          console.log(`   Error: ${JSON.stringify(individualResponse.data, null, 2)}`);
        }
        
        // Test with nominee ID
        const idResponse = await makeRequest(`${BASE_URL}/api/nominees/${nominee31.id}`);
        console.log(`   ID-based API status: ${idResponse.status}`);
        
        if (idResponse.status === 200) {
          console.log('   ✅ ID-based nominee API working');
        } else {
          console.log('   ❌ ID-based nominee API failed');
          console.log(`   Error: ${JSON.stringify(idResponse.data, null, 2)}`);
        }
        
      } else {
        console.log('   ❌ "Nominess 31 Test" not found in nominees list');
        
        // Show first few nominees for debugging
        console.log('\n   First 5 nominees:');
        nominees.slice(0, 5).forEach((n, i) => {
          console.log(`   ${i + 1}. ${n.name || n.displayName} (${n.status})`);
        });
      }
    } else {
      console.log('   ❌ Failed to fetch nominees');
      console.log(`   Status: ${allNomineesResponse.status}`);
    }
    
    console.log('\n📊 Summary:');
    console.log('----------------------------------------');
    console.log('If "Nominess 31 Test" was approved but not showing:');
    console.log('1. Check if the approval process completed successfully');
    console.log('2. Verify the live_url was generated correctly');
    console.log('3. Ensure the nominee status is "approved"');
    console.log('4. Check if the database schema matches the API expectations');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugNominee31Test();