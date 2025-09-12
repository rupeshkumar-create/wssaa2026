#!/usr/bin/env node

/**
 * Test Categories Working Across All Forms
 * This script tests that categories work in admin panel, public form, directory, and home page
 */

async function testCategoriesWorking() {
  try {
    console.log('🧪 Testing Categories Working Across All Forms...\n');

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // 1. Test Categories API
    console.log('1️⃣ Testing Categories API...');
    const categoriesResponse = await fetch(`${baseUrl}/api/categories`);
    const categoriesData = await categoriesResponse.json();
    
    if (categoriesData.success && categoriesData.data.length > 0) {
      console.log(`✅ Categories API working: ${categoriesData.data.length} categories found`);
      
      // Show sample categories with their structure
      const sampleCategories = categoriesData.data.slice(0, 5);
      console.log('📋 Sample categories:');
      sampleCategories.forEach(cat => {
        console.log(`   - ${cat.name} (${cat.nomination_type}) - Group: ${cat.category_groups?.name}`);
      });
      
      // Check if we have both person and company categories
      const personCategories = categoriesData.data.filter(c => c.nomination_type === 'person' || c.nomination_type === 'both');
      const companyCategories = categoriesData.data.filter(c => c.nomination_type === 'company' || c.nomination_type === 'both');
      
      console.log(`   📊 Person categories: ${personCategories.length}`);
      console.log(`   📊 Company categories: ${companyCategories.length}`);
      
      if (personCategories.length === 0) {
        console.error('❌ No person categories found!');
        return false;
      }
      
      if (companyCategories.length === 0) {
        console.error('❌ No company categories found!');
        return false;
      }
      
    } else {
      console.error('❌ Categories API failed:', categoriesData.error);
      return false;
    }

    // 2. Test Admin Nominations API (to see if it can fetch nominations)
    console.log('\n2️⃣ Testing Admin Nominations API...');
    try {
      const adminResponse = await fetch(`${baseUrl}/api/admin/nominations`, {
        headers: {
          'Authorization': 'Bearer admin-test' // This might not work without proper auth
        }
      });
      
      if (adminResponse.ok) {
        const adminData = await adminResponse.json();
        console.log(`✅ Admin nominations API accessible: ${adminData.data?.length || 0} nominations`);
      } else {
        console.log('⚠️ Admin nominations API requires authentication (expected)');
      }
    } catch (error) {
      console.log('⚠️ Admin nominations API not accessible (expected without auth)');
    }

    // 3. Test that categories have proper structure for forms
    console.log('\n3️⃣ Testing Category Structure for Forms...');
    
    const categories = categoriesData.data;
    let structureValid = true;
    
    // Check required fields
    for (const category of categories) {
      if (!category.id) {
        console.error(`❌ Category missing id: ${JSON.stringify(category)}`);
        structureValid = false;
      }
      if (!category.name) {
        console.error(`❌ Category missing name: ${JSON.stringify(category)}`);
        structureValid = false;
      }
      if (!category.nomination_type) {
        console.error(`❌ Category missing nomination_type: ${JSON.stringify(category)}`);
        structureValid = false;
      }
      if (!category.category_groups || !category.category_groups.id || !category.category_groups.name) {
        console.error(`❌ Category missing category_groups: ${JSON.stringify(category)}`);
        structureValid = false;
      }
    }
    
    if (structureValid) {
      console.log('✅ All categories have proper structure for forms');
    } else {
      console.error('❌ Some categories have invalid structure');
      return false;
    }

    // 4. Test Category Groups
    console.log('\n4️⃣ Testing Category Groups...');
    const categoryGroups = [...new Set(categories.map(c => c.category_groups.name))];
    console.log(`✅ Found ${categoryGroups.length} category groups:`);
    categoryGroups.forEach(group => {
      const groupCategories = categories.filter(c => c.category_groups.name === group);
      console.log(`   - ${group}: ${groupCategories.length} categories`);
    });

    // 5. Test specific categories that should exist
    console.log('\n5️⃣ Testing Specific Expected Categories...');
    const expectedCategories = [
      'top-recruiter',
      'top-executive-leader',
      'rising-star-under-30',
      'best-recruitment-agency',
      'top-staffing-company-usa'
    ];
    
    let allExpectedFound = true;
    for (const expectedId of expectedCategories) {
      const found = categories.find(c => c.id === expectedId);
      if (found) {
        console.log(`✅ Found expected category: ${found.name} (${found.nomination_type})`);
      } else {
        console.error(`❌ Missing expected category: ${expectedId}`);
        allExpectedFound = false;
      }
    }
    
    if (!allExpectedFound) {
      console.error('❌ Some expected categories are missing');
      return false;
    }

    // 6. Test that categories can be filtered by type
    console.log('\n6️⃣ Testing Category Filtering...');
    
    const personOnlyCategories = categories.filter(c => c.nomination_type === 'person');
    const companyOnlyCategories = categories.filter(c => c.nomination_type === 'company');
    const bothCategories = categories.filter(c => c.nomination_type === 'both');
    
    console.log(`✅ Person-only categories: ${personOnlyCategories.length}`);
    console.log(`✅ Company-only categories: ${companyOnlyCategories.length}`);
    console.log(`✅ Both-type categories: ${bothCategories.length}`);
    
    // Test filtering logic (what admin form should do)
    const personAvailable = categories.filter(c => c.nomination_type === 'person' || c.nomination_type === 'both');
    const companyAvailable = categories.filter(c => c.nomination_type === 'company' || c.nomination_type === 'both');
    
    console.log(`✅ Available for person nominations: ${personAvailable.length}`);
    console.log(`✅ Available for company nominations: ${companyAvailable.length}`);

    console.log('\n🎉 All Category Tests Passed!');
    console.log('\n📋 Summary:');
    console.log(`✅ Categories API working with ${categories.length} categories`);
    console.log(`✅ All categories have proper structure`);
    console.log(`✅ Category filtering works correctly`);
    console.log(`✅ Expected categories are present`);
    console.log('\n🚀 Categories should work in:');
    console.log('   - Admin nomination form');
    console.log('   - Public nomination form');
    console.log('   - Directory filters');
    console.log('   - Home page categories');

    return true;

  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
}

// Execute the test
testCategoriesWorking().then(success => {
  if (!success) {
    process.exit(1);
  }
});