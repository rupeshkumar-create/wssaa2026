#!/usr/bin/env node

const BASE_URL = 'http://localhost:3000';

async function debugCategoryFiltering() {
  console.log('🔍 Debugging Category Filtering Issue...\n');

  try {
    // Test 1: Check what the API returns for all nominees
    console.log('1️⃣ Testing: Get all nominees');
    const allResponse = await fetch(`${BASE_URL}/api/nominees`);
    const allData = await allResponse.json();
    console.log(`   ✅ Total nominees: ${allData.data?.length || 0}`);
    
    if (allData.data && allData.data.length > 0) {
      console.log('   📋 Sample categories in database:');
      const categories = [...new Set(allData.data.map(n => n.category))];
      categories.slice(0, 10).forEach(cat => console.log(`      - ${cat}`));
    }

    // Test 2: Test the specific category filter
    console.log('\n2️⃣ Testing: Filter by top-recruiter');
    const categoryResponse = await fetch(`${BASE_URL}/api/nominees?category=top-recruiter`);
    const categoryData = await categoryResponse.json();
    console.log(`   📊 API Response:`, {
      success: categoryData.success,
      count: categoryData.data?.length || 0,
      message: categoryData.message
    });

    if (categoryData.data && categoryData.data.length > 0) {
      console.log('   📋 First 3 nominees in top-recruiter:');
      categoryData.data.slice(0, 3).forEach((nominee, index) => {
        console.log(`      ${index + 1}. ${nominee.name} (Category: ${nominee.category})`);
      });
    } else {
      console.log('   ❌ No nominees found for top-recruiter category');
    }

    // Test 3: Test with subcategoryId parameter
    console.log('\n3️⃣ Testing: Filter by subcategoryId=top-recruiter');
    const subcategoryResponse = await fetch(`${BASE_URL}/api/nominees?subcategoryId=top-recruiter`);
    const subcategoryData = await subcategoryResponse.json();
    console.log(`   📊 SubcategoryId Response:`, {
      success: subcategoryData.success,
      count: subcategoryData.data?.length || 0
    });

    // Test 4: Check frontend page
    console.log('\n4️⃣ Testing: Frontend page with category filter');
    const pageResponse = await fetch(`${BASE_URL}/nominees?category=top-recruiter`);
    console.log(`   📄 Page Status: ${pageResponse.status} ${pageResponse.statusText}`);

    // Test 5: Check if there are any nominees with top-recruiter category
    console.log('\n5️⃣ Analyzing: Nominees with top-recruiter category');
    if (allData.data) {
      const topRecruiters = allData.data.filter(n => n.category === 'top-recruiter');
      console.log(`   📊 Found ${topRecruiters.length} nominees with category 'top-recruiter'`);
      
      if (topRecruiters.length > 0) {
        console.log('   ✅ Sample top-recruiter nominees:');
        topRecruiters.slice(0, 3).forEach((nominee, index) => {
          console.log(`      ${index + 1}. ${nominee.name || nominee.displayName}`);
        });
      }
    }

    console.log('\n🎯 Summary:');
    console.log('   - API filtering logic appears to be working');
    console.log('   - Check if frontend is properly handling the filtered results');
    console.log('   - Verify that nominees have the correct category values in database');

  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugCategoryFiltering();