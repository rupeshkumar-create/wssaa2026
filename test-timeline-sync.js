#!/usr/bin/env node

/**
 * Test script to verify timeline sync between admin panel and homepage
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

async function testTimelineSync() {
  console.log('🧪 Testing Timeline Sync...\n');
  
  // Ensure data directory exists
  const dataDir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) {
    console.log('📁 Creating data directory...');
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  // Test 1: Check admin timeline API
  console.log('1️⃣ Testing Admin Timeline API...');
  try {
    const adminResponse = await fetch('http://localhost:3000/api/admin/timeline');
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin timeline API working');
      console.log(`   Events count: ${adminData.data?.length || 0}`);
      
      if (adminData.data && adminData.data.length > 0) {
        const votingEvent = adminData.data.find(event => event.type === 'voting');
        if (votingEvent) {
          console.log(`   Voting event date: ${votingEvent.date}`);
        }
      }
    } else {
      console.log('❌ Admin timeline API failed');
    }
  } catch (error) {
    console.log('❌ Admin timeline API error:', error.message);
  }
  
  // Test 2: Check public timeline API
  console.log('\n2️⃣ Testing Public Timeline API...');
  try {
    const publicResponse = await fetch('http://localhost:3000/api/timeline');
    if (publicResponse.ok) {
      const publicData = await publicResponse.json();
      console.log('✅ Public timeline API working');
      console.log(`   Events count: ${publicData.data?.length || 0}`);
      
      if (publicData.data && publicData.data.length > 0) {
        const votingEvent = publicData.data.find(event => event.type === 'voting');
        if (votingEvent) {
          console.log(`   Voting event date: ${votingEvent.date}`);
        }
      }
    } else {
      console.log('❌ Public timeline API failed');
    }
  } catch (error) {
    console.log('❌ Public timeline API error:', error.message);
  }
  
  // Test 3: Check if timeline.json file exists
  console.log('\n3️⃣ Checking timeline data file...');
  const timelinePath = path.join(process.cwd(), 'data', 'timeline.json');
  if (fs.existsSync(timelinePath)) {
    console.log('✅ Timeline data file exists');
    try {
      const fileContent = fs.readFileSync(timelinePath, 'utf8');
      const timelineData = JSON.parse(fileContent);
      console.log(`   File contains ${timelineData.length} events`);
      
      const votingEvent = timelineData.find(event => event.type === 'voting');
      if (votingEvent) {
        console.log(`   Voting event in file: ${votingEvent.date}`);
      }
    } catch (error) {
      console.log('❌ Error reading timeline file:', error.message);
    }
  } else {
    console.log('⚠️  Timeline data file does not exist');
    console.log('   This will be created automatically on first API call');
  }
  
  // Test 4: Test updating a timeline event
  console.log('\n4️⃣ Testing timeline update...');
  try {
    const updateData = {
      id: 'voting-open',
      title: 'Public Voting Opens',
      description: 'Community voting begins for all nominees',
      date: '2025-12-01T00:00:00Z', // Test date
      type: 'voting'
    };
    
    const updateResponse = await fetch('http://localhost:3000/api/admin/timeline', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (updateResponse.ok) {
      const updateResult = await updateResponse.json();
      console.log('✅ Timeline update successful');
      console.log(`   Updated voting date to: ${updateData.date}`);
      
      // Verify the update by fetching again
      const verifyResponse = await fetch('http://localhost:3000/api/timeline');
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const updatedVotingEvent = verifyData.data.find(event => event.type === 'voting' && event.id === 'voting-open');
        if (updatedVotingEvent && updatedVotingEvent.date === updateData.date) {
          console.log('✅ Update verified in public API');
        } else {
          console.log('❌ Update not reflected in public API');
        }
      }
    } else {
      console.log('❌ Timeline update failed');
    }
  } catch (error) {
    console.log('❌ Timeline update error:', error.message);
  }
  
  console.log('\n🎉 Timeline sync test completed!');
  console.log('\n💡 If the homepage is not reflecting changes:');
  console.log('   1. Check browser cache (hard refresh: Ctrl+F5)');
  console.log('   2. Wait up to 1 minute for auto-refresh');
  console.log('   3. Switch browser tabs and come back to trigger refresh');
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
testTimelineSync().catch(console.error);