#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function debugNomineesPageIssue() {
  console.log('🔍 Debugging nominees page issue...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Direct API call
    console.log('\n1. Testing direct API call:');
    const apiResponse = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const apiResult = await apiResponse.json();
    
    if (apiResult.success) {
      console.log(`   ✅ API working: Found ${apiResult.data.length} nominees`);
      console.log(`   Sample: ${apiResult.data.slice(0, 2).map(n => n.name).join(', ')}`);
    } else {
      console.log(`   ❌ API error: ${apiResult.error}`);
    }
    
    // Test 2: Test trending categories API
    console.log('\n2. Testing trending categories API:');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    
    if (trendingResult.success) {
      console.log(`   ✅ Trending API working: Found ${trendingResult.data.length} categories`);
      const topRecruiterCategory = trendingResult.data.find(c => c.id === 'top-recruiter');
      if (topRecruiterCategory) {
        console.log(`   Top Recruiter category: ${topRecruiterCategory.label} (${topRecruiterCategory.nominationCount} nominations)`);
      }
    } else {
      console.log(`   ❌ Trending API error: ${trendingResult.error}`);
    }
    
    // Test 3: Test different categories
    console.log('\n3. Testing different categories:');
    const testCategories = ['top-recruiter', 'top-executive-leader', 'rising-star-under-30'];
    
    for (const category of testCategories) {
      const response = await fetch(`${baseUrl}/api/nominees?category=${category}`);
      const result = await response.json();
      
      if (result.success) {
        console.log(`   ${category}: ${result.data.length} nominees`);
      } else {
        console.log(`   ${category}: ERROR - ${result.error}`);
      }
    }
    
    // Test 4: Test without category filter
    console.log('\n4. Testing without category filter:');
    const allResponse = await fetch(`${baseUrl}/api/nominees`);
    const allResult = await allResponse.json();
    
    if (allResult.success) {
      console.log(`   ✅ All nominees: ${allResult.data.length} total`);
      const categories = [...new Set(allResult.data.map(n => n.category))];
      console.log(`   Available categories: ${categories.join(', ')}`);
    }
    
    console.log('\n✅ Debug completed');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugNomineesPageIssue();