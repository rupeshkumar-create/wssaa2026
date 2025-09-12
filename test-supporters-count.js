#!/usr/bin/env node

const https = require('https');
const http = require('http');

function fetch(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            ok: res.statusCode >= 200 && res.statusCode < 300,
            json: () => Promise.resolve(JSON.parse(data))
          });
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function testSupportersCount() {
  const nomineeId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  const baseUrl = 'http://localhost:3003';
  
  console.log('🧪 Testing Supporters Count Stability...\n');
  
  try {
    // Test 1: Get nominee data from main API
    console.log('1️⃣ Testing main nominee API...');
    const nomineeResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}`);
    const nomineeResult = await nomineeResponse.json();
    
    if (nomineeResult.success) {
      const nominee = nomineeResult.data;
      console.log('✅ Nominee data:', {
        id: nominee.id,
        name: nominee.nominee?.displayName || nominee.nominee?.name,
        votes: nominee.votes,
        additionalVotes: nominee.additionalVotes || nominee.additional_votes,
        totalCalculated: (nominee.votes || 0) + (nominee.additionalVotes || nominee.additional_votes || 0)
      });
    } else {
      console.log('❌ Failed to get nominee data:', nomineeResult.error);
    }
    
    // Test 2: Get stats API data
    console.log('\n2️⃣ Testing stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}/stats`);
    const statsResult = await statsResponse.json();
    
    console.log('✅ Stats data:', statsResult);
    
    // Test 3: Multiple calls to check stability
    console.log('\n3️⃣ Testing stability with multiple calls...');
    for (let i = 1; i <= 5; i++) {
      const testResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}`);
      const testResult = await testResponse.json();
      
      if (testResult.success) {
        const nominee = testResult.data;
        const totalVotes = (nominee.votes || 0) + (nominee.additionalVotes || nominee.additional_votes || 0);
        console.log(`Call ${i}: Real: ${nominee.votes || 0}, Additional: ${nominee.additionalVotes || nominee.additional_votes || 0}, Total: ${totalVotes}`);
      }
      
      // Wait 1 second between calls
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n✅ Test completed! Check the console logs in the browser to see the vote breakdown.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSupportersCount();