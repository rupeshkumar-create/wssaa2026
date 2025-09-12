#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testNomineesPageFix() {
  console.log('🔍 Testing nominees page fix...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Simulate clicking on "Top Recruiters" from home page
    console.log('\n1. Simulating click on "Top Recruiters" from home page:');
    console.log('   URL: /nominees?category=top-recruiter');
    
    const response = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const result = await response.json();
    
    if (result.success) {
      const nominees = result.data || [];
      console.log(`   ✅ API returns ${nominees.length} nominees`);
      
      if (nominees.length > 0) {
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrectlyFiltered = categories.length === 1 && categories[0] === 'top-recruiter';
        
        console.log(`   Categories: ${categories.join(', ')}`);
        console.log(`   ${isCorrectlyFiltered ? '✅ Correctly filtered' : '❌ Filtering failed'}`);
        
        console.log('   Sample nominees:');
        nominees.slice(0, 3).forEach((n, i) => {
          console.log(`     ${i + 1}. ${n.name} (${n.category}) - ${n.votes} votes`);
        });
      } else {
        console.log('   ❌ No nominees returned');
      }
    } else {
      console.log(`   ❌ API error: ${result.error}`);
    }
    
    // Test 2: Test other categories
    console.log('\n2. Testing other categories:');
    const testCategories = [
      { id: 'top-executive-leader', label: 'Top Executive Leaders' },
      { id: 'rising-star-under-30', label: 'Rising Stars (Under 30)' }
    ];
    
    for (const category of testCategories) {
      const response = await fetch(`${baseUrl}/api/nominees?category=${category.id}`);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrect = categories.length === 1 && categories[0] === category.id;
        
        console.log(`   ${category.label}: ${nominees.length} nominees ${isCorrect ? '✅' : '❌'}`);
      } else {
        console.log(`   ${category.label}: ERROR - ${result.error}`);
      }
    }
    
    // Test 3: Test trending categories endpoint
    console.log('\n3. Testing trending categories endpoint:');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    
    if (trendingResult.success) {
      console.log(`   ✅ Found ${trendingResult.data.length} trending categories`);
      
      const topRecruiters = trendingResult.data.find(c => c.id === 'top-recruiter');
      if (topRecruiters) {
        console.log(`   Top Recruiters: ${topRecruiters.nominationCount} nominations, ${topRecruiters.voteCount} votes`);
      }
    } else {
      console.log(`   ❌ Trending API error: ${trendingResult.error}`);
    }
    
    // Test 4: Test edge cases
    console.log('\n4. Testing edge cases:');
    
    // Empty category
    const emptyResponse = await fetch(`${baseUrl}/api/nominees?category=`);
    const emptyResult = await emptyResponse.json();
    if (emptyResult.success) {
      console.log(`   Empty category: ${emptyResult.data.length} nominees (should be all)`);
    }
    
    // Invalid category
    const invalidResponse = await fetch(`${baseUrl}/api/nominees?category=invalid-category`);
    const invalidResult = await invalidResponse.json();
    if (invalidResult.success) {
      console.log(`   Invalid category: ${invalidResult.data.length} nominees (should be 0)`);
    }
    
    console.log('\n✅ Nominees page fix test completed');
    console.log('\n💡 To test in browser:');
    console.log('   1. Visit http://localhost:3000');
    console.log('   2. Click on "Top Recruiters" badge in any category card');
    console.log('   3. Should redirect to /nominees?category=top-recruiter');
    console.log('   4. Should show only Top Recruiter nominees');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testNomineesPageFix();