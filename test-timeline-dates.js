#!/usr/bin/env node

/**
 * Test script to verify timeline dates are being used correctly in homepage
 */

const http = require('http');

async function testTimelineDates() {
  console.log('🧪 Testing Timeline Dates on Homepage...\n');
  
  // Test 1: Get current timeline data
  console.log('1️⃣ Getting current timeline data...');
  try {
    const response = await fetch('http://localhost:3000/api/timeline');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Timeline API data:');
      
      if (data.data && data.data.length > 0) {
        data.data.forEach(event => {
          console.log(`   ${event.type}: ${event.title} - ${event.date}`);
        });
        
        // Focus on voting event
        const votingEvent = data.data.find(event => event.type === 'voting');
        if (votingEvent) {
          console.log(`\n🗳️  Voting event details:`);
          console.log(`   ID: ${votingEvent.id}`);
          console.log(`   Date: ${votingEvent.date}`);
          console.log(`   Status: ${votingEvent.status}`);
        }
      }
    } else {
      console.log('❌ Timeline API failed');
    }
  } catch (error) {
    console.log('❌ Timeline API error:', error.message);
  }
  
  // Test 2: Check homepage HTML for timeline content
  console.log('\n2️⃣ Checking homepage HTML...');
  try {
    const response = await fetch('http://localhost:3000');
    if (response.ok) {
      const html = await response.text();
      console.log('✅ Homepage loaded successfully');
      
      // Check for timeline-related content
      const hasTimeline = html.includes('Awards Timeline');
      const hasPhases = html.includes('Nominations Open') && html.includes('Public Voting Opens');
      
      console.log(`   Contains "Awards Timeline": ${hasTimeline}`);
      console.log(`   Contains phase titles: ${hasPhases}`);
      
      // Look for any date patterns in the HTML
      const datePattern = /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g;
      const dates = html.match(datePattern);
      
      if (dates && dates.length > 0) {
        console.log(`   Found dates in HTML: ${dates.slice(0, 3).join(', ')}${dates.length > 3 ? '...' : ''}`);
      } else {
        console.log('   No formatted dates found in HTML');
      }
    } else {
      console.log('❌ Homepage failed to load');
    }
  } catch (error) {
    console.log('❌ Homepage error:', error.message);
  }
  
  // Test 3: Update voting date and check if it propagates
  console.log('\n3️⃣ Testing date update propagation...');
  try {
    const testDate = new Date();
    testDate.setMonth(testDate.getMonth() + 2); // 2 months from now
    const testDateString = testDate.toISOString();
    
    console.log(`   Setting voting date to: ${testDateString}`);
    
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
      console.log('✅ Timeline updated successfully');
      
      // Wait a moment for any caching to clear
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if the public API reflects the change
      const verifyResponse = await fetch('http://localhost:3000/api/timeline');
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const updatedEvent = verifyData.data.find(event => event.id === 'voting-open');
        
        if (updatedEvent && updatedEvent.date === testDateString) {
          console.log('✅ Update confirmed in public API');
          console.log(`   New voting date: ${updatedEvent.date}`);
        } else {
          console.log('❌ Update not reflected in public API');
        }
      }
    } else {
      console.log('❌ Timeline update failed');
    }
  } catch (error) {
    console.log('❌ Update test error:', error.message);
  }
  
  console.log('\n🎉 Timeline dates test completed!');
  console.log('\n📋 Next steps to see changes on homepage:');
  console.log('   1. Hard refresh the homepage (Ctrl+F5 or Cmd+Shift+R)');
  console.log('   2. Wait for the 1-minute auto-refresh interval');
  console.log('   3. Switch browser tabs and return to trigger focus refresh');
  console.log('   4. Check browser developer console for any errors');
}

// Helper function for fetch (Node.js compatibility)
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
testTimelineDates().catch(console.error);