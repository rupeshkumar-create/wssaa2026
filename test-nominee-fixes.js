#!/usr/bin/env node

const fetch = require('node-fetch');

async function testNomineeFixes() {
  const nomineeId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing nominee fixes...');
  console.log(`📋 Nominee ID: ${nomineeId}`);
  
  try {
    // Test stats API
    console.log('\n📊 Testing stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}/stats`);
    const statsResult = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Stats API working');
      console.log(`   Days Active: ${statsResult.daysSinceCreated}`);
      console.log(`   Total votes: ${statsResult.totalVotes}`);
      console.log(`   Real votes: ${statsResult.realVotes}`);
      console.log(`   Additional votes: ${statsResult.additionalVotes}`);
      console.log(`   Category rank: ${statsResult.categoryRank} of ${statsResult.totalInCategory}`);
      console.log(`   Trending: ${statsResult.trendingPercentile}`);
    } else {
      console.log('❌ Stats API failed:', statsResult.error);
    }
    
    // Test individual nominee API
    console.log('\n👤 Testing individual nominee API...');
    const nomineeResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}`);
    const nomineeResult = await nomineeResponse.json();
    
    if (nomineeResult.success) {
      console.log('✅ Individual nominee API working');
      console.log(`   Created at: ${nomineeResult.data.createdAt}`);
      console.log(`   Vote count: ${nomineeResult.data.votes}`);
      
      // Calculate days manually for verification
      const createdDate = new Date(nomineeResult.data.createdAt);
      const daysSince = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   Manual days calculation: ${daysSince}`);
    } else {
      console.log('❌ Individual nominee API failed:', nomineeResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNomineeFixes();