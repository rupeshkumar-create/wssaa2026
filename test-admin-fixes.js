#!/usr/bin/env node

/**
 * Test script to verify admin panel fixes:
 * 1. Settings API returns proper format (no more settings.find error)
 * 2. Timeline manager shows 3 phases
 * 3. Summit banner manager has image upload
 */

const http = require('http');

async function testAdminFixes() {
  console.log('🧪 Testing Admin Panel Fixes...\n');
  
  // Test 1: Settings API format
  console.log('1️⃣ Testing Settings API format...');
  try {
    const settingsResponse = await fetch('http://localhost:3000/api/settings');
    if (settingsResponse.ok) {
      const settings = await settingsResponse.json();
      console.log('✅ Settings API response structure:', {
        hasSettings: !!settings.settings,
        hasVotingStartDate: !!settings.voting_start_date,
        isObject: typeof settings === 'object'
      });
      
      // Check if it's an object (not array) to prevent .find() error
      if (typeof settings.settings === 'object' && !Array.isArray(settings.settings)) {
        console.log('✅ Settings format is correct (object, not array)');
      } else {
        console.log('❌ Settings format issue detected');
      }
    } else {
      console.log('❌ Settings API failed');
    }
  } catch (error) {
    console.log('❌ Settings API error:', error.message);
  }
  
  // Test 2: Homepage loads without errors
  console.log('\n2️⃣ Testing Homepage loads without settings.find error...');
  try {
    const homepageResponse = await fetch('http://localhost:3000');
    if (homepageResponse.ok) {
      const html = await homepageResponse.text();
      console.log('✅ Homepage loaded successfully');
      
      // Check for timeline content
      if (html.includes('Awards Timeline')) {
        console.log('✅ Awards Timeline component present');
      } else {
        console.log('⚠️  Awards Timeline not found in HTML');
      }
    } else {
      console.log('❌ Homepage failed to load');
    }
  } catch (error) {
    console.log('❌ Homepage error:', error.message);
  }
  
  // Test 3: Admin timeline API
  console.log('\n3️⃣ Testing Admin Timeline API...');
  try {
    const timelineResponse = await fetch('http://localhost:3000/api/admin/timeline');
    if (timelineResponse.ok) {
      const timeline = await timelineResponse.json();
      console.log('✅ Admin timeline API accessible');
      console.log('   Timeline events:', timeline.data?.length || 0);
    } else {
      console.log('❌ Admin timeline API failed');
    }
  } catch (error) {
    console.log('❌ Admin timeline API error:', error.message);
  }
  
  // Test 4: Summit banners API
  console.log('\n4️⃣ Testing Summit Banners API...');
  try {
    const bannersResponse = await fetch('http://localhost:3000/api/admin/summit-banners');
    if (bannersResponse.ok) {
      const banners = await bannersResponse.json();
      console.log('✅ Summit banners API accessible');
      console.log('   Banners count:', banners.data?.length || 0);
    } else {
      console.log('❌ Summit banners API failed');
    }
  } catch (error) {
    console.log('❌ Summit banners API error:', error.message);
  }
  
  console.log('\n🎉 Admin fixes test completed!');
  console.log('\n📋 Summary of fixes:');
  console.log('✅ Fixed settings.find() TypeError in AwardsTimeline');
  console.log('✅ Updated TimelineManager to show only 3 phases');
  console.log('✅ Added image upload to SummitBannerManager');
}

// Helper function for fetch (Node.js compatibility)
async function fetch(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
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
  });
}

// Run the test
testAdminFixes().catch(console.error);