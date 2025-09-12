#!/usr/bin/env node

const BASE_URL = 'http://localhost:3005';

async function testCategoryLinks() {
  console.log('🧪 Testing Category Links from Home Page...\n');

  try {
    // Test the main categories that should have nominees
    const testCategories = [
      { id: 'top-recruiter', name: 'Top Recruiters' },
      { id: 'top-executive-leader', name: 'Top Executive Leaders' },
      { id: 'rising-star-under-30', name: 'Rising Stars (Under 30)' },
      { id: 'top-staffing-influencer', name: 'Top Staffing Influencers' },
      { id: 'best-sourcer', name: 'Best Sourcers' }
    ];

    console.log('🔗 Testing category links and filtering:\n');

    for (const category of testCategories) {
      console.log(`📂 Testing: ${category.name} (${category.id})`);
      
      // Test API endpoint
      const apiResponse = await fetch(`${BASE_URL}/api/nominees?category=${category.id}`);
      const apiData = await apiResponse.json();
      
      if (apiData.success) {
        const count = apiData.data?.length || 0;
        console.log(`   ✅ API: ${count} nominees found`);
        
        if (count > 0) {
          // Verify all returned nominees have the correct category
          const correctCategory = apiData.data.every(nominee => nominee.category === category.id);
          if (correctCategory) {
            console.log(`   ✅ All nominees have correct category: ${category.id}`);
          } else {
            console.log(`   ❌ Some nominees have incorrect category!`);
            // Show first few with wrong category
            const wrongOnes = apiData.data.filter(nominee => nominee.category !== category.id).slice(0, 3);
            wrongOnes.forEach(nominee => {
              console.log(`      - ${nominee.name}: expected ${category.id}, got ${nominee.category}`);
            });
          }
        }
        
        // Test frontend page
        const pageResponse = await fetch(`${BASE_URL}/nominees?category=${category.id}`);
        const pageStatus = pageResponse.ok ? '✅' : '❌';
        console.log(`   ${pageStatus} Frontend page loads (Status: ${pageResponse.status})`);
        
      } else {
        console.log(`   ❌ API Error: ${apiData.error || 'Unknown error'}`);
      }
      
      console.log(''); // Empty line for readability
    }

    // Test the home page category links
    console.log('🏠 Testing home page category card links:\n');
    
    const homeResponse = await fetch(`${BASE_URL}/`);
    if (homeResponse.ok) {
      console.log('✅ Home page loads successfully');
      console.log('💡 Manual test: Click on category badges on home page');
      console.log('   Each should redirect to /nominees?category=<category-id>');
      console.log('   And show only nominees from that category');
    } else {
      console.log('❌ Home page failed to load');
    }

    console.log('\n🎉 Category links test completed!');
    console.log('\n🔧 If filtering is not working:');
    console.log('   1. Check browser console for errors');
    console.log('   2. Verify database has nominees with correct subcategory_id');
    console.log('   3. Check that API is receiving category parameter correctly');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCategoryLinks();