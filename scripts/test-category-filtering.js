#!/usr/bin/env node

const BASE_URL = 'http://localhost:3005';

async function testCategoryFiltering() {
  console.log('🧪 Testing Category Filtering...\n');

  try {
    // Test 1: Get all nominees
    console.log('1️⃣ Testing: Get all nominees');
    const allResponse = await fetch(`${BASE_URL}/api/nominees`);
    const allData = await allResponse.json();
    console.log(`   ✅ All nominees: ${allData.data?.length || 0} found`);
    
    // Test 2: Filter by top-recruiter category
    console.log('\n2️⃣ Testing: Filter by top-recruiter category');
    const categoryResponse = await fetch(`${BASE_URL}/api/nominees?category=top-recruiter`);
    const categoryData = await categoryResponse.json();
    console.log(`   ✅ Top Recruiter nominees: ${categoryData.data?.length || 0} found`);
    
    if (categoryData.data && categoryData.data.length > 0) {
      console.log('   📋 Sample nominees in this category:');
      categoryData.data.slice(0, 3).forEach((nominee, index) => {
        console.log(`      ${index + 1}. ${nominee.name || nominee.displayName} (Category: ${nominee.category})`);
      });
    }
    
    // Test 3: Test other categories
    const testCategories = [
      'best-sourcer',
      'top-executive-leader',
      'rising-star-under-30',
      'top-staffing-influencer'
    ];
    
    console.log('\n3️⃣ Testing other categories:');
    for (const category of testCategories) {
      const response = await fetch(`${BASE_URL}/api/nominees?category=${category}`);
      const data = await response.json();
      console.log(`   📂 ${category}: ${data.data?.length || 0} nominees`);
    }
    
    // Test 4: Verify the frontend page
    console.log('\n4️⃣ Testing frontend page with category filter');
    const pageResponse = await fetch(`${BASE_URL}/nominees?category=top-recruiter`);
    const pageStatus = pageResponse.ok ? '✅ Page loads successfully' : '❌ Page failed to load';
    console.log(`   ${pageStatus} (Status: ${pageResponse.status})`);
    
    console.log('\n🎉 Category filtering test completed!');
    console.log('\n💡 To test manually:');
    console.log(`   1. Visit: ${BASE_URL}/nominees?category=top-recruiter`);
    console.log(`   2. Check that only "Top Recruiters" are shown`);
    console.log(`   3. Try other categories like: best-sourcer, top-executive-leader`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCategoryFiltering();