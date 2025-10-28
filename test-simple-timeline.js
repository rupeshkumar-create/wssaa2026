#!/usr/bin/env node

/**
 * Simple test to verify the timeline fix is working
 */

const http = require('http');

async function testSimpleTimeline() {
  console.log('🧪 Testing Timeline Fix...\n');
  
  // Test 1: Update the voting-open event specifically
  console.log('1️⃣ Updating voting-open event...');
  try {
    const testDate = new Date();
    testDate.setMonth(testDate.getMonth() + 1); // 1 month from now
    const testDateString = testDate.toISOString();
    
    console.log(`   Setting voting-open date to: ${testDateString}`);
    
    const updateResponse = await fetch('http://localhost:3000/api/admin/timeline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 'voting-open',
        title: 'Public Voting Opens',
        description: 'Community voting begins for all nominees',
        date: testDateString,
        type: 'voting'
      })
    });
    
    if (updateResponse.ok) {
      console.log('✅ Update successful');
    } else {
      console.log('❌ Update failed');
    }
  } catch (error) {
    console.log('❌ Update error:', error.message);
  }
  
  // Test 2: Verify the API returns the correct event
  console.log('\n2️⃣ Verifying API response...');
  try {
    const response = await fetch('http://localhost:3000/api/timeline');
    if (response.ok) {
      const data = await response.json();
      
      const votingOpenEvent = data.data.find(event => event.id === 'voting-open');
      if (votingOpenEvent) {
        console.log('✅ Found voting-open event:');
        console.log(`   Date: ${votingOpenEvent.date}`);
        console.log(`   Title: ${votingOpenEvent.title}`);
        console.log(`   Status: ${votingOpenEvent.status}`);
      } else {
        console.log('❌ voting-open event not found');
      }
      
      // Also check what the old logic would find
      const firstVotingEvent = data.data.find(event => event.type === 'voting');
      if (firstVotingEvent) {
        console.log('\n📊 First voting event (old logic):');
        console.log(`   ID: ${firstVotingEvent.id}`);
        console.log(`   Date: ${firstVotingEvent.date}`);
        console.log(`   Title: ${firstVotingEvent.title}`);
      }
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
  }
  
  // Test 3: Check homepage after a moment
  console.log('\n3️⃣ Checking homepage (wait 2 seconds for component refresh)...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Homepage loaded');
      
      // Look for date patterns
      const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
      const dates = html.match(datePattern);
      
      if (dates) {
        console.log(`   Found dates: ${dates.slice(0, 5).join(', ')}`);
      }
    }
  } catch (error) {
    console.log('❌ Homepage error:', error.message);
  }
  
  console.log('\n🎉 Test completed!');
  console.log('\n💡 To see changes on homepage:');
  console.log('   1. Hard refresh (Ctrl+F5)');
  console.log('   2. Wait for auto-refresh (1 minute)');
  console.log('   3. Switch tabs and return');
}

// Helper function for fetch
async function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          text: () => Promise.resolve(data),
          json: () => Promise.resolve(JSON.parse(data))
        });
      });
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run the test
testSimpleTimeline().catch(console.error);