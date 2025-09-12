#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPIFiltering() {
  console.log('🔍 Testing API category filtering...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Get all nominees
    console.log('\n1. Testing all nominees:');
    const allResponse = await fetch(`${baseUrl}/api/nominees`);
    const allResult = await allResponse.json();
    
    if (!allResult.success) {
      console.error('❌ API error:', allResult.error);
      return;
    }
    
    console.log(`   Found ${allResult.data?.length || 0} total nominees`);
    
    if (allResult.data && allResult.data.length > 0) {
      const categories = [...new Set(allResult.data.map(n => n.category))];
      console.log('   Available categories:', categories);
      console.log('   Sample nominees:', allResult.data.slice(0, 3).map(n => ({
        name: n.name,
        category: n.category
      })));
    }
    
    // Test 2: Get nominees for specific category
    console.log('\n2. Testing category filter for "top-recruiter":');
    const categoryResponse = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const categoryResult = await categoryResponse.json();
    
    if (!categoryResult.success) {
      console.error('❌ API error:', categoryResult.error);
      return;
    }
    
    console.log(`   Found ${categoryResult.data?.length || 0} nominees for top-recruiter`);
    
    if (categoryResult.data && categoryResult.data.length > 0) {
      console.log('   All categories in filtered results:', [...new Set(categoryResult.data.map(n => n.category))]);
      console.log('   Sample filtered nominees:', categoryResult.data.slice(0, 3).map(n => ({
        name: n.name,
        category: n.category
      })));
    }
    
    // Test 3: Test another category
    console.log('\n3. Testing category filter for "top-executive-leader":');
    const category2Response = await fetch(`${baseUrl}/api/nominees?category=top-executive-leader`);
    const category2Result = await category2Response.json();
    
    if (!category2Result.success) {
      console.error('❌ API error:', category2Result.error);
      return;
    }
    
    console.log(`   Found ${category2Result.data?.length || 0} nominees for top-executive-leader`);
    
    console.log('\n✅ API filtering test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the dev server is running: npm run dev');
  }
}

testAPIFiltering();