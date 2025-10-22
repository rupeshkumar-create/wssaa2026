#!/usr/bin/env node

/**
 * Test Enhanced Dashboard Fix
 * Verifies that the Enhanced Dashboard API is working correctly
 */

const BASE_URL = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}` 
  : 'http://localhost:3000';

async function testEnhancedDashboard() {
  console.log('🚀 Testing Enhanced Dashboard Fix');
  console.log('==================================');
  
  try {
    console.log('📍 Testing Enhanced Dashboard API...');
    const response = await fetch(`${BASE_URL}/api/admin/top-nominees?includeStats=true&limit=5`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`📊 Status: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Enhanced Dashboard API is working!');
        console.log(`📈 Stats: ${data.data.stats ? 'Available' : 'Not available'}`);
        console.log(`👥 Leaderboard: ${data.data.overallLeaderboard?.length || 0} nominees`);
        console.log(`📂 Categories: ${data.data.stats?.activeCategories || 0} active`);
        console.log(`🗳️  Total Votes: ${data.data.stats?.totalVotes || 0}`);
        
        // Test the structure
        if (data.data.overallLeaderboard && data.data.overallLeaderboard.length > 0) {
          const firstNominee = data.data.overallLeaderboard[0];
          console.log(`🏆 Top Nominee: ${firstNominee.displayName} (${firstNominee.totalVotes} votes)`);
        }
        
        console.log('\n✅ Enhanced Dashboard should now work without HTTP 500 errors!');
        console.log('🎯 The issue was that the API was querying non-existent columns in the database.');
        console.log('🔧 Fixed by updating the API to use the correct admin_nominations view and column names.');
        
        return true;
      } else {
        console.log(`❌ API returned error: ${data.error}`);
        return false;
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ HTTP Error ${response.status}: ${errorText}`);
      return false;
    }
    
  } catch (error) {
    console.log(`💥 Network Error: ${error.message}`);
    return false;
  }
}

// Test additional endpoints that the dashboard uses
async function testRelatedEndpoints() {
  console.log('\n🔍 Testing related endpoints...');
  
  const endpoints = [
    '/api/admin/nominations-improved',
    '/api/admin/update-votes',
    '/api/stats'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: endpoint.includes('update-votes') ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: endpoint.includes('update-votes') ? JSON.stringify({
          nominationId: 'test',
          additionalVotes: 0
        }) : undefined
      });
      
      console.log(`📍 ${endpoint}: ${response.status} ${response.statusText}`);
      
    } catch (error) {
      console.log(`📍 ${endpoint}: Network error`);
    }
  }
}

async function runTests() {
  const dashboardWorking = await testEnhancedDashboard();
  await testRelatedEndpoints();
  
  console.log('\n📋 Summary:');
  if (dashboardWorking) {
    console.log('✅ Enhanced Dashboard HTTP 500 error has been FIXED!');
    console.log('✅ The dashboard should now load properly in the admin panel.');
    console.log('✅ All leaderboard data and statistics should display correctly.');
  } else {
    console.log('❌ Enhanced Dashboard is still having issues.');
    console.log('🔍 Check the error messages above for more details.');
  }
}

runTests().catch(console.error);