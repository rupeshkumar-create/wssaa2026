#!/usr/bin/env node

/**
 * Debug script to check the current database structure
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

async function debugDatabaseStructure() {
  console.log('🔍 Debugging database structure and nominees API\n');
  
  try {
    // Test the nominees API with detailed logging
    console.log('1️⃣ Testing nominees API...');
    const nomineesResponse = await makeRequest(`${BASE_URL}/api/nominees`);
    
    console.log(`   Status: ${nomineesResponse.status}`);
    console.log(`   Response: ${JSON.stringify(nomineesResponse.data, null, 2)}`);
    
    // Test admin nominations API to see the raw data
    console.log('\n2️⃣ Testing admin nominations API...');
    const adminResponse = await makeRequest(`${BASE_URL}/api/admin/nominations`);
    
    console.log(`   Status: ${adminResponse.status}`);
    if (adminResponse.status === 200) {
      const nominations = adminResponse.data.data || [];
      console.log(`   Found ${nominations.length} nominations`);
      
      // Look for approved nominations
      const approved = nominations.filter(n => n.status === 'approved');
      console.log(`   Approved: ${approved.length}`);
      
      if (approved.length > 0) {
        console.log('\n   First approved nomination:');
        console.log(`   ${JSON.stringify(approved[0], null, 2)}`);
      }
    } else {
      console.log(`   Error: ${JSON.stringify(adminResponse.data, null, 2)}`);
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

// Run the debug
debugDatabaseStructure();