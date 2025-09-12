#!/usr/bin/env node

const fetch = require('node-fetch');

async function testNomineeStats() {
  const nomineeId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing nominee stats API...');
  console.log(`📋 Nominee ID: ${nomineeId}`);
  
  try {
    // Test individual nominee API
    console.log('\n1️⃣ Testing individual nominee API...');
    const nomineeResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}`);
    const nomineeResult = await nomineeResponse.json();
    
    if (nomineeResult.success) {
      console.log('✅ Individual nominee API working');
      console.log(`   Vote count: ${nomineeResult.data.votes}`);
    } else {
      console.log('❌ Individual nominee API failed:', nomineeResult.error);
    }
    
    // Test stats API
    console.log('\n2️⃣ Testing nominee stats API...');
    const statsResponse = await fetch(`${baseUrl}/api/nominees/${nomineeId}/stats`);
    const statsResult = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Stats API working');
      console.log(`   Total votes: ${statsResult.totalVotes}`);
      console.log(`   Real votes: ${statsResult.realVotes}`);
      console.log(`   Additional votes: ${statsResult.additionalVotes}`);
      console.log(`   Category rank: ${statsResult.categoryRank} of ${statsResult.totalInCategory}`);
      console.log(`   Trending: ${statsResult.trendingPercentile}`);
      console.log(`   Vote momentum: ${statsResult.voteMomentum} this week`);
    } else {
      console.log('❌ Stats API failed:', statsResult.error);
    }
    
    // Test nominees directory API
    console.log('\n3️⃣ Testing nominees directory API...');
    const directoryResponse = await fetch(`${baseUrl}/api/nominees`);
    const directoryResult = await directoryResponse.json();
    
    if (directoryResult.success) {
      const nominee = directoryResult.data.find(n => n.id === nomineeId);
      if (nominee) {
        console.log('✅ Directory API working');
        console.log(`   Vote count in directory: ${nominee.votes}`);
      } else {
        console.log('⚠️  Nominee not found in directory');
      }
    } else {
      console.log('❌ Directory API failed:', directoryResult.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNomineeStats();