#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function diagnoseNomineesIssue() {
  console.log('🔍 Diagnosing nominees page issue...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Check if home page loads
    console.log('\n1. Testing home page:');
    const homeResponse = await fetch(`${baseUrl}/`);
    console.log(`   Status: ${homeResponse.status}`);
    console.log(`   ${homeResponse.ok ? '✅ Home page loads' : '❌ Home page error'}`);
    
    // Test 2: Check if nominees page loads
    console.log('\n2. Testing nominees page:');
    const nomineesResponse = await fetch(`${baseUrl}/nominees`);
    console.log(`   Status: ${nomineesResponse.status}`);
    console.log(`   ${nomineesResponse.ok ? '✅ Nominees page loads' : '❌ Nominees page error'}`);
    
    // Test 3: Check nominees API
    console.log('\n3. Testing nominees API:');
    const apiResponse = await fetch(`${baseUrl}/api/nominees`);
    const apiResult = await apiResponse.json();
    
    if (apiResult.success) {
      console.log(`   ✅ API working: ${apiResult.data.length} nominees`);
      console.log(`   Sample: ${apiResult.data.slice(0, 2).map(n => n.name).join(', ')}`);
    } else {
      console.log(`   ❌ API error: ${apiResult.error}`);
    }
    
    // Test 4: Check specific category
    console.log('\n4. Testing category filtering:');
    const categoryResponse = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const categoryResult = await categoryResponse.json();
    
    if (categoryResult.success) {
      console.log(`   ✅ Category API working: ${categoryResult.data.length} top recruiters`);
    } else {
      console.log(`   ❌ Category API error: ${categoryResult.error}`);
    }
    
    // Test 5: Check trending categories
    console.log('\n5. Testing trending categories:');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    
    if (trendingResult.success) {
      console.log(`   ✅ Trending API working: ${trendingResult.data.length} categories`);
    } else {
      console.log(`   ❌ Trending API error: ${trendingResult.error}`);
    }
    
    console.log('\n📋 Summary:');
    console.log('If all APIs are working but the page shows no content, the issue is likely:');
    console.log('1. React component state management');
    console.log('2. Client-side rendering issue');
    console.log('3. JavaScript error preventing data display');
    
    console.log('\n🔧 Next steps:');
    console.log('1. Open browser dev tools and check for JavaScript errors');
    console.log('2. Check network tab to see if API calls are being made');
    console.log('3. Look at React component state in dev tools');
    
  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  }
}

diagnoseNomineesIssue();