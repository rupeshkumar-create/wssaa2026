#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testHomeToNomineesFlow() {
  console.log('🔍 Testing Home → Nominees flow...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('\n📋 Simulating user journey:');
    console.log('1. User visits home page: http://localhost:3000/');
    console.log('2. User scrolls to "Award Categories" section');
    console.log('3. User clicks on "Top Recruiters" badge');
    console.log('4. Browser navigates to: http://localhost:3000/nominees?category=top-recruiter');
    console.log('5. Nominees page should show ONLY Top Recruiters');
    
    // Test the exact API call that should be made
    console.log('\n🔍 Testing the API call that should be made:');
    const apiUrl = `${baseUrl}/api/nominees?category=top-recruiter`;
    console.log(`   API URL: ${apiUrl}`);
    
    const apiResponse = await fetch(apiUrl);
    const apiResult = await apiResponse.json();
    
    if (apiResult.success) {
      const nominees = apiResult.data || [];
      const categories = [...new Set(nominees.map(n => n.category))];
      const isCorrectlyFiltered = categories.length === 1 && categories[0] === 'top-recruiter';
      
      console.log(`   ✅ API Response: ${nominees.length} nominees`);
      console.log(`   Categories: ${categories.join(', ')}`);
      console.log(`   ${isCorrectlyFiltered ? '✅ API filtering works perfectly' : '❌ API filtering broken'}`);
      
      if (isCorrectlyFiltered) {
        console.log('\n   📊 Sample Top Recruiters:');
        nominees.slice(0, 5).forEach((nominee, i) => {
          console.log(`     ${i + 1}. ${nominee.name} (${nominee.votes} votes)`);
        });
      }
    } else {
      console.log(`   ❌ API Error: ${apiResult.error}`);
      return;
    }
    
    // Test the page URL
    console.log('\n🌐 Testing the page URL:');
    const pageUrl = `${baseUrl}/nominees?category=top-recruiter`;
    console.log(`   Page URL: ${pageUrl}`);
    
    const pageResponse = await fetch(pageUrl);
    console.log(`   Status: ${pageResponse.status}`);
    console.log(`   ${pageResponse.ok ? '✅ Page loads successfully' : '❌ Page load failed'}`);
    
    // Test other categories to ensure they work too
    console.log('\n🧪 Testing other categories:');
    const testCategories = [
      { id: 'top-executive-leader', name: 'Top Executive Leaders' },
      { id: 'rising-star-under-30', name: 'Rising Stars (Under 30)' }
    ];
    
    for (const category of testCategories) {
      const response = await fetch(`${baseUrl}/api/nominees?category=${category.id}`);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrect = categories.length === 1 && categories[0] === category.id;
        
        console.log(`   ${category.name}: ${nominees.length} nominees ${isCorrect ? '✅' : '❌'}`);
      }
    }
    
    console.log('\n🎯 Expected Behavior:');
    console.log('✅ API returns only nominees from the selected category');
    console.log('✅ Page loads without errors');
    console.log('✅ React component should display filtered results');
    
    console.log('\n🔧 If the page still shows all nominees instead of filtered ones:');
    console.log('1. Open browser dev tools (F12)');
    console.log('2. Go to Console tab');
    console.log('3. Visit: http://localhost:3000/nominees?category=top-recruiter');
    console.log('4. Look for debug logs starting with "🔍 Nominees"');
    console.log('5. Check if the category parameter is being read correctly');
    console.log('6. Verify the API call is made with the correct category parameter');
    
    console.log('\n💡 Manual Test:');
    console.log('1. Open http://localhost:3000/ in browser');
    console.log('2. Scroll to Award Categories section');
    console.log('3. Click on "Top Recruiters" badge');
    console.log('4. Should show URL: /nominees?category=top-recruiter');
    console.log('5. Should display only Top Recruiter nominees');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testHomeToNomineesFlow();