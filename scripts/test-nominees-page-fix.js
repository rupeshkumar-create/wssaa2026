#!/usr/bin/env node

/**
 * Test Nominees Page Fix
 * Tests the nominees page with the updated category structure
 */

console.log('🧪 Testing Nominees Page Fix...\n');

async function testNomineesPage() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('📋 Testing API endpoints...');
  
  try {
    // Test categories API
    console.log('1. Testing /api/categories...');
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    const categoriesResult = await categoriesResponse.json();
    console.log(`   ✅ Categories API: ${categoriesResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📊 Found ${categoriesResult.count} categories`);
    
    // Test trending categories API
    console.log('2. Testing /api/categories/trending...');
    const trendingResponse = await fetch(`${baseUrl}/api/categories/trending`);
    const trendingResult = await trendingResponse.json();
    console.log(`   ✅ Trending API: ${trendingResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📊 Found ${trendingResult.data?.length || 0} trending categories`);
    
    if (trendingResult.data && trendingResult.data.length > 0) {
      console.log('   📋 Trending categories:');
      trendingResult.data.forEach((cat, index) => {
        console.log(`      ${index + 1}. ${cat.label} (${cat.id})`);
      });
    }
    
    // Test nominees API
    console.log('3. Testing /api/nominees...');
    const nomineesResponse = await fetch(`${baseUrl}/api/nominees`);
    const nomineesResult = await nomineesResponse.json();
    console.log(`   ✅ Nominees API: ${nomineesResult.success ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📊 Found ${nomineesResult.data?.length || 0} nominees`);
    
    // Test nominees page
    console.log('4. Testing /nominees page...');
    const pageResponse = await fetch(`${baseUrl}/nominees`);
    console.log(`   ✅ Nominees Page: ${pageResponse.ok ? 'SUCCESS' : 'FAILED'}`);
    console.log(`   📊 Status: ${pageResponse.status}`);
    
    console.log('\n🎉 All tests completed!');
    console.log('\n💡 Next steps:');
    console.log('1. Visit http://localhost:3000/nominees in your browser');
    console.log('2. Check that the page loads without errors');
    console.log('3. Test the category filtering functionality');
    console.log('4. Verify the search functionality works');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running:');
    console.log('   npm run dev');
  }
}

testNomineesPage();