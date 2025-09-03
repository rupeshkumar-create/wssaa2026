#!/usr/bin/env node

async function testPodiumAPI() {
  console.log('Testing Podium API with different categories...\n');
  
  const testCategories = [
    'top-ai-driven-staffing-platform',
    'top-digital-experience-for-clients',
    'top-recruiter',
    'best-recruitment-agency'
  ];
  
  for (const category of testCategories) {
    try {
      console.log(`Testing category: ${category}`);
      const response = await fetch(`http://localhost:3000/api/podium?category=${category}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${category}: ${data.items?.length || 0} items`);
        if (data.items?.length > 0) {
          data.items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.name} (${item.votes} votes)`);
          });
        }
      } else {
        console.log(`❌ ${category}: ${data.error}`);
      }
    } catch (error) {
      console.log(`❌ ${category}: Network error - ${error.message}`);
    }
    console.log('');
  }
}

testPodiumAPI().catch(console.error);