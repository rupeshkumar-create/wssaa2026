#!/usr/bin/env node

/**
 * Test script to verify category filtering is working correctly
 */

const API_BASE = process.env.VERCEL_URL 
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000';

async function testCategoryFiltering() {
  console.log('🧪 Testing Category Filtering Fix');
  console.log('================================');
  
  try {
    // Test 1: Get all nominees
    console.log('\n1. Testing all nominees...');
    const allResponse = await fetch(`${API_BASE}/api/nominees?_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!allResponse.ok) {
      throw new Error(`HTTP ${allResponse.status}: ${allResponse.statusText}`);
    }
    
    const allResult = await allResponse.json();
    console.log(`✅ All nominees: ${allResult.data?.length || 0} found`);
    
    if (allResult.data && allResult.data.length > 0) {
      const categories = [...new Set(allResult.data.map(n => n.category))];
      console.log(`📋 Available categories: ${categories.join(', ')}`);
    }
    
    // Test 2: Test specific category filtering
    const testCategories = [
      'top-recruiter',
      'top-executive-leader', 
      'rising-star-under-30',
      'best-staffing-firm'
    ];
    
    for (const category of testCategories) {
      console.log(`\n2. Testing category: ${category}`);
      
      const categoryResponse = await fetch(`${API_BASE}/api/nominees?category=${category}&_t=${Date.now()}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!categoryResponse.ok) {
        console.log(`❌ Category ${category}: HTTP ${categoryResponse.status}`);
        continue;
      }
      
      const categoryResult = await categoryResponse.json();
      const count = categoryResult.data?.length || 0;
      
      if (count > 0) {
        console.log(`✅ Category ${category}: ${count} nominees found`);
        
        // Verify all returned nominees are in the correct category
        const wrongCategory = categoryResult.data.find(n => n.category !== category);
        if (wrongCategory) {
          console.log(`❌ Found nominee in wrong category: ${wrongCategory.name} (${wrongCategory.category})`);
        } else {
          console.log(`✅ All nominees correctly filtered for ${category}`);
        }
      } else {
        console.log(`⚠️  Category ${category}: No nominees found`);
      }
    }
    
    // Test 3: Test the home page to nominees flow
    console.log('\n3. Testing home page to nominees flow...');
    
    // Simulate clicking on "Top Recruiters" from home page
    const topRecruitersUrl = `${API_BASE}/nominees?category=top-recruiter`;
    console.log(`🔗 Testing URL: ${topRecruitersUrl}`);
    
    const topRecruitersResponse = await fetch(`${API_BASE}/api/nominees?category=top-recruiter&_t=${Date.now()}`, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
    
    if (topRecruitersResponse.ok) {
      const result = await topRecruitersResponse.json();
      console.log(`✅ Top Recruiters flow: ${result.data?.length || 0} nominees`);
      
      if (result.data && result.data.length > 0) {
        console.log(`📝 Sample nominee: ${result.data[0].name} (${result.data[0].category})`);
      }
    } else {
      console.log(`❌ Top Recruiters flow failed: HTTP ${topRecruitersResponse.status}`);
    }
    
    console.log('\n🎉 Category filtering test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testCategoryFiltering();