#!/usr/bin/env node

/**
 * Test Nominees API with New Categories
 * Verifies that the nominees API only returns nominees from valid categories
 */

console.log('🧪 Testing Nominees API with New Categories...\n');

async function testNomineesAPI() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Get all nominees (should only show valid categories)
    console.log('1. Testing /api/nominees (all nominees)...');
    const allResponse = await fetch(`${baseUrl}/api/nominees`);
    const allResult = await allResponse.json();
    
    console.log(`   ✅ Status: ${allResponse.status}`);
    console.log(`   📊 Total nominees: ${allResult.data?.length || 0}`);
    
    if (allResult.data && allResult.data.length > 0) {
      const categories = [...new Set(allResult.data.map(n => n.category))];
      console.log(`   📋 Categories found: ${categories.join(', ')}`);
      
      // Check if all categories are valid
      const validCategories = [
        'top-100-staffing-leaders-2026',
        'top-100-staffing-companies-2026', 
        'top-100-recruiters-2026'
      ];
      
      const invalidCategories = categories.filter(cat => !validCategories.includes(cat));
      if (invalidCategories.length > 0) {
        console.log(`   ❌ Invalid categories found: ${invalidCategories.join(', ')}`);
      } else {
        console.log(`   ✅ All categories are valid`);
      }
    }
    
    // Test 2: Test each specific category
    const testCategories = [
      'top-100-staffing-leaders-2026',
      'top-100-staffing-companies-2026', 
      'top-100-recruiters-2026'
    ];
    
    for (const category of testCategories) {
      console.log(`\n2. Testing category: ${category}...`);
      const categoryResponse = await fetch(`${baseUrl}/api/nominees?category=${category}`);
      const categoryResult = await categoryResponse.json();
      
      console.log(`   ✅ Status: ${categoryResponse.status}`);
      console.log(`   📊 Nominees in category: ${categoryResult.data?.length || 0}`);
      
      if (categoryResult.data && categoryResult.data.length > 0) {
        const firstNominee = categoryResult.data[0];
        console.log(`   👤 Sample nominee: ${firstNominee.name} (${firstNominee.category})`);
      }
    }
    
    // Test 3: Test trending categories API
    console.log('\n3. Testing /api/categories/trending...');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    
    console.log(`   ✅ Status: ${trendingResponse.status}`);
    console.log(`   📊 Trending categories: ${trendingResult.data?.length || 0}`);
    
    if (trendingResult.data && trendingResult.data.length > 0) {
      console.log('   📋 Trending categories:');
      trendingResult.data.forEach((cat, index) => {
        console.log(`      ${index + 1}. ${cat.label} (${cat.id})`);
      });
    }
    
    console.log('\n🎉 All tests completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Visit http://localhost:3000/nominees in your browser');
    console.log('2. Verify only nominees from the 3 new categories are shown');
    console.log('3. Test category filtering by clicking on category badges');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

testNomineesAPI();