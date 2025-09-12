#!/usr/bin/env node

const fetch = require('node-fetch');

async function testCategoryFiltering() {
  console.log('🔍 Testing category filtering...');
  
  try {
    // Test 1: Get all nominees
    console.log('\n1. Testing all nominees:');
    const allResponse = await fetch('http://localhost:3000/api/nominees');
    const allResult = await allResponse.json();
    console.log(`   Found ${allResult.data?.length || 0} total nominees`);
    
    if (allResult.data && allResult.data.length > 0) {
      console.log('   Sample categories:', allResult.data.slice(0, 3).map(n => ({
        name: n.name,
        category: n.category
      })));
    }
    
    // Test 2: Get nominees for specific category
    console.log('\n2. Testing category filter for "top-recruiter":');
    const categoryResponse = await fetch('http://localhost:3000/api/nominees?category=top-recruiter');
    const categoryResult = await categoryResponse.json();
    console.log(`   Found ${categoryResult.data?.length || 0} nominees for top-recruiter`);
    
    if (categoryResult.data && categoryResult.data.length > 0) {
      console.log('   Categories in filtered results:', categoryResult.data.map(n => n.category));
    }
    
    // Test 3: Check database directly
    console.log('\n3. Testing with subcategoryId parameter:');
    const subcatResponse = await fetch('http://localhost:3000/api/nominees?subcategoryId=top-recruiter');
    const subcatResult = await subcatResponse.json();
    console.log(`   Found ${subcatResult.data?.length || 0} nominees for subcategoryId=top-recruiter`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCategoryFiltering();