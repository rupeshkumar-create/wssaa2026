#!/usr/bin/env node

async function testPodiumSimple() {
  console.log('Testing Podium Category Switching Logic...\n');
  
  // Test all Innovation & Technology categories
  const innovationCategories = [
    'top-ai-driven-staffing-platform',
    'top-digital-experience-for-clients'
  ];
  
  console.log('Testing Innovation & Technology categories:');
  for (const category of innovationCategories) {
    try {
      const response = await fetch(`http://localhost:3000/api/podium?category=${category}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${category}: ${data.items?.length || 0} champions found`);
        if (data.items?.length > 0) {
          console.log(`   🏆 Winner: ${data.items[0].name} (${data.items[0].votes} votes)`);
        }
      } else {
        console.log(`❌ ${category}: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${category}: ${error.message}`);
    }
  }
  
  console.log('\n🎯 Testing category validation...');
  
  // Test invalid category
  try {
    const response = await fetch('http://localhost:3000/api/podium?category=invalid-category');
    const data = await response.json();
    
    if (response.status === 400 && data.error === 'Invalid category') {
      console.log('✅ Invalid category properly rejected');
    } else {
      console.log('❌ Invalid category not properly handled');
    }
  } catch (error) {
    console.log(`❌ Error testing invalid category: ${error.message}`);
  }
  
  console.log('\n✅ All tests completed!');
}

testPodiumSimple().catch(console.error);