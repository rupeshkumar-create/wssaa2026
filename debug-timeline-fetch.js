#!/usr/bin/env node

/**
 * Debug script to understand why timeline dates aren't updating on homepage
 */

const http = require('http');

async function debugTimelineFetch() {
  console.log('🔍 Debugging Timeline Fetch Issue...\n');
  
  // Test 1: Check what the API returns
  console.log('1️⃣ Checking API response structure...');
  try {
    const response = await fetch('http://localhost:3000/api/timeline');
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API Response Structure:');
      console.log(`   success: ${data.success}`);
      console.log(`   data: ${Array.isArray(data.data) ? 'Array' : typeof data.data}`);
      console.log(`   count: ${data.count}`);
      
      if (data.data && Array.isArray(data.data)) {
        console.log('\n📋 Events by type:');
        const eventsByType = {};
        data.data.forEach(event => {
          if (!eventsByType[event.type]) {
            eventsByType[event.type] = [];
          }
          eventsByType[event.type].push({
            id: event.id,
            title: event.title,
            date: event.date,
            status: event.status
          });
        });
        
        Object.keys(eventsByType).forEach(type => {
          console.log(`   ${type}:`);
          eventsByType[type].forEach(event => {
            console.log(`     - ${event.title} (${event.date}) [${event.status}]`);
          });
        });
        
        // Check for the specific events the homepage looks for
        console.log('\n🎯 Events homepage should find:');
        const nominationEvent = data.data.find(event => event.type === 'nomination');
        const votingEvent = data.data.find(event => event.type === 'voting');
        const ceremonyEvent = data.data.find(event => event.type === 'ceremony');
        
        console.log(`   nomination: ${nominationEvent ? nominationEvent.date : 'NOT FOUND'}`);
        console.log(`   voting: ${votingEvent ? votingEvent.date : 'NOT FOUND'}`);
        console.log(`   ceremony: ${ceremonyEvent ? ceremonyEvent.date : 'NOT FOUND'}`);
      }
    } else {
      console.log('❌ API request failed');
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
  }
  
  // Test 2: Simulate the homepage component logic
  console.log('\n2️⃣ Simulating homepage component logic...');
  try {
    const response = await fetch('http://localhost:3000/api/timeline');
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ API data received successfully');
        
        // Simulate the getTimelinePhases function
        const timelineEvents = result.data;
        const phaseTemplates = [
          { id: 1, title: "Nominations Open", type: 'nomination' },
          { id: 2, title: "Public Voting Opens", type: 'voting' },
          { id: 3, title: "Winners & Awards Ceremony", type: 'ceremony' }
        ];
        
        console.log('\n🔄 Phase calculation results:');
        phaseTemplates.forEach(template => {
          const timelineEvent = timelineEvents.find(event => event.type === template.type);
          
          if (timelineEvent) {
            const startDate = timelineEvent.date.split('T')[0];
            console.log(`   ${template.title}:`);
            console.log(`     Found event: ${timelineEvent.title}`);
            console.log(`     Date: ${timelineEvent.date} -> ${startDate}`);
            console.log(`     Status: ${timelineEvent.status}`);
          } else {
            console.log(`   ${template.title}: NO MATCHING EVENT FOUND`);
          }
        });
      } else {
        console.log('❌ API response missing success/data');
      }
    }
  } catch (error) {
    console.log('❌ Simulation error:', error.message);
  }
  
  // Test 3: Check for multiple events of same type
  console.log('\n3️⃣ Checking for duplicate event types...');
  try {
    const response = await fetch('http://localhost:3000/api/timeline');
    if (response.ok) {
      const data = await response.json();
      
      if (data.data) {
        const typeCounts = {};
        data.data.forEach(event => {
          typeCounts[event.type] = (typeCounts[event.type] || 0) + 1;
        });
        
        console.log('Event type counts:');
        Object.keys(typeCounts).forEach(type => {
          console.log(`   ${type}: ${typeCounts[type]} events`);
          if (typeCounts[type] > 1) {
            console.log(`   ⚠️  Multiple ${type} events found - this might cause confusion!`);
            
            // Show which events
            const eventsOfType = data.data.filter(event => event.type === type);
            eventsOfType.forEach((event, index) => {
              console.log(`     ${index + 1}. ${event.title} (${event.date}) [${event.id}]`);
            });
          }
        });
      }
    }
  } catch (error) {
    console.log('❌ Duplicate check error:', error.message);
  }
  
  console.log('\n🎉 Debug completed!');
  console.log('\n💡 Possible issues:');
  console.log('   1. Multiple events of same type (find() returns first match)');
  console.log('   2. Component not re-rendering after API call');
  console.log('   3. Browser caching the old component state');
  console.log('   4. API data not matching expected format');
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
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

// Run the debug
debugTimelineFetch().catch(console.error);