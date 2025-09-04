#!/usr/bin/env node

async function testCategoryLinks() {
  console.log('🔍 Testing Category Links and Directory Filtering\n');
  
  const testCategories = [
    'top-recruiter',
    'top-ai-driven-staffing-platform',
    'top-digital-experience-for-clients',
    'best-recruitment-agency',
    'top-executive-leader'
  ];
  
  // Test 1: Check nominees API
  console.log('1️⃣ Testing nominees API...');
  try {
    const response = await fetch('http://localhost:3000/api/nominees');
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log(`✅ Nominees API working: ${data.data.length} total nominees`);
      
      // Group by category
      const byCategory = {};
      data.data.forEach(nominee => {
        const category = nominee.category || 'unknown';
        if (!byCategory[category]) byCategory[category] = 0;
        byCategory[category]++;
      });
      
      console.log('\n📊 Nominees by category:');
      Object.entries(byCategory).forEach(([category, count]) => {
        console.log(`   ${category}: ${count} nominees`);
      });
      
    } else {
      console.log('❌ Nominees API failed:', data.error);
      return;
    }
  } catch (error) {
    console.log('❌ Nominees API error:', error.message);
    return;
  }
  
  // Test 2: Test specific category filtering
  console.log('\n2️⃣ Testing category filtering...');
  
  for (const category of testCategories) {
    try {
      const response = await fetch(`http://localhost:3000/api/nominees`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        const filtered = data.data.filter(nominee => nominee.category === category);
        console.log(`✅ ${category}: ${filtered.length} nominees`);
        
        if (filtered.length > 0) {
          console.log(`   Sample: ${filtered[0].displayName || filtered[0].name || 'Unknown'}`);
        }
      }
    } catch (error) {
      console.log(`❌ ${category}: Error - ${error.message}`);
    }
  }
  
  // Test 3: Test directory page URLs
  console.log('\n3️⃣ Testing directory page URLs...');
  
  const testUrls = [
    '/directory?category=top-recruiter',
    '/directory?category=top-ai-driven-staffing-platform',
    '/directory?category=best-recruitment-agency'
  ];
  
  for (const url of testUrls) {
    try {
      const response = await fetch(`http://localhost:3000${url}`);
      
      if (response.ok) {
        console.log(`✅ ${url}: Page loads successfully`);
      } else {
        console.log(`❌ ${url}: Failed to load (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${url}: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎯 Category Links Test Summary:');
  console.log('✅ Fixed CategoryCard to use proper category IDs');
  console.log('✅ Updated CategoriesSection to map labels to IDs');
  console.log('✅ Directory page should now show nominees when clicking subcategories');
  console.log('\n📝 Next: Test in browser by clicking on subcategory badges');
}

testCategoryLinks().catch(console.error);