#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHomePageCategoryLinks() {
  console.log('🔍 Testing home page category links...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test 1: Direct API call for top-recruiter
    console.log('\n1. Testing API directly:');
    const apiResponse = await fetch(`${baseUrl}/api/nominees?category=top-recruiter`);
    const apiResult = await apiResponse.json();
    
    if (apiResult.success) {
      const nominees = apiResult.data || [];
      const categories = [...new Set(nominees.map(n => n.category))];
      const isCorrect = categories.length === 1 && categories[0] === 'top-recruiter';
      
      console.log(`   Found ${nominees.length} nominees`);
      console.log(`   Categories: ${categories.join(', ')}`);
      console.log(`   ${isCorrect ? '✅ API filtering works' : '❌ API filtering broken'}`);
      
      if (nominees.length > 0) {
        console.log('   Sample nominees:');
        nominees.slice(0, 3).forEach((n, i) => {
          console.log(`     ${i + 1}. ${n.name} (${n.category})`);
        });
      }
    } else {
      console.log(`   ❌ API error: ${apiResult.error}`);
      return;
    }
    
    // Test 2: Test the exact URL that would be generated from home page
    console.log('\n2. Testing home page category link URL:');
    const linkUrl = `${baseUrl}/nominees?category=top-recruiter`;
    console.log(`   Testing URL: ${linkUrl}`);
    
    const pageResponse = await fetch(linkUrl);
    console.log(`   Status: ${pageResponse.status}`);
    console.log(`   ${pageResponse.ok ? '✅ Page loads' : '❌ Page error'}`);
    
    // Test 3: Check if the issue is with the React component
    console.log('\n3. Testing different category IDs:');
    const testCategories = [
      'top-recruiter',
      'top-executive-leader', 
      'rising-star-under-30'
    ];
    
    for (const categoryId of testCategories) {
      const response = await fetch(`${baseUrl}/api/nominees?category=${categoryId}`);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrect = categories.length === 1 && categories[0] === categoryId;
        
        console.log(`   ${categoryId}: ${nominees.length} nominees ${isCorrect ? '✅' : '❌'}`);
      } else {
        console.log(`   ${categoryId}: ❌ ERROR`);
      }
    }
    
    // Test 4: Check what categories are available
    console.log('\n4. Checking available categories:');
    const allResponse = await fetch(`${baseUrl}/api/nominees`);
    const allResult = await allResponse.json();
    
    if (allResult.success) {
      const allNominees = allResult.data || [];
      const allCategories = [...new Set(allNominees.map(n => n.category))];
      console.log(`   Total nominees: ${allNominees.length}`);
      console.log(`   Available categories: ${allCategories.join(', ')}`);
      
      // Check if top-recruiter exists
      const topRecruiters = allNominees.filter(n => n.category === 'top-recruiter');
      console.log(`   Top recruiters in all data: ${topRecruiters.length}`);
    }
    
    console.log('\n📋 Diagnosis:');
    console.log('If the API is working but the page shows all results:');
    console.log('1. The React component is not reading URL parameters correctly');
    console.log('2. There might be a client-side state management issue');
    console.log('3. The category parameter is being ignored or overridden');
    
    console.log('\n🔧 To fix this:');
    console.log('1. Check browser dev tools for JavaScript errors');
    console.log('2. Look at network tab to see what API calls are made');
    console.log('3. Check if the nominees page is reading the category parameter');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHomePageCategoryLinks();