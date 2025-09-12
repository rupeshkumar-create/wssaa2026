#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testCompleteCategoryFlow() {
  console.log('🔍 Testing complete category filtering flow...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Get trending categories
    console.log('\n1. Testing trending categories API:');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    
    if (!trendingResult.success) {
      console.error('❌ Trending categories API error:', trendingResult.error);
      return;
    }
    
    console.log(`   Found ${trendingResult.data?.length || 0} trending categories`);
    if (trendingResult.data && trendingResult.data.length > 0) {
      console.log('   Categories:', trendingResult.data.map(c => `${c.id} (${c.label})`).join(', '));
    }
    
    // Test 2: Test each trending category
    for (const category of trendingResult.data.slice(0, 3)) {
      console.log(`\n2. Testing category "${category.id}" (${category.label}):`);
      
      const categoryResponse = await fetch(`${baseUrl}/api/nominees?category=${category.id}`);
      const categoryResult = await categoryResponse.json();
      
      if (!categoryResult.success) {
        console.error(`   ❌ API error for ${category.id}:`, categoryResult.error);
        continue;
      }
      
      const nominees = categoryResult.data || [];
      console.log(`   Found ${nominees.length} nominees`);
      
      if (nominees.length > 0) {
        // Check if all nominees belong to the requested category
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrectlyFiltered = categories.length === 1 && categories[0] === category.id;
        
        console.log(`   Categories in results: ${categories.join(', ')}`);
        console.log(`   ${isCorrectlyFiltered ? '✅ Correctly filtered' : '❌ Filtering failed'}`);
        
        if (!isCorrectlyFiltered) {
          console.log('   Sample nominees:', nominees.slice(0, 3).map(n => `${n.name} (${n.category})`));
        }
      }
    }
    
    // Test 3: Test specific problematic category
    console.log('\n3. Testing specific category "top-recruiter":');
    const recruiterResponse = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const recruiterResult = await recruiterResponse.json();
    
    if (recruiterResult.success) {
      const nominees = recruiterResult.data || [];
      console.log(`   Found ${nominees.length} nominees for top-recruiter`);
      
      if (nominees.length > 0) {
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrectlyFiltered = categories.length === 1 && categories[0] === 'top-recruiter';
        
        console.log(`   Categories: ${categories.join(', ')}`);
        console.log(`   ${isCorrectlyFiltered ? '✅ Correctly filtered' : '❌ Filtering failed'}`);
        
        console.log('   Sample nominees:');
        nominees.slice(0, 5).forEach((n, i) => {
          console.log(`     ${i + 1}. ${n.name} (${n.category})`);
        });
      }
    }
    
    console.log('\n✅ Complete category flow test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCompleteCategoryFlow();