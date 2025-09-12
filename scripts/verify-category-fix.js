#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function verifyCategoryFix() {
  console.log('🔍 Verifying category filtering fix...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Test multiple requests to the same category to check for caching issues
    console.log('\n1. Testing cache-busting for top-recruiter:');
    
    for (let i = 1; i <= 3; i++) {
      console.log(`   Request ${i}:`);
      const response = await fetch(`${baseUrl}/api/nominees?category=top-recruiter&_t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrect = categories.length === 1 && categories[0] === 'top-recruiter';
        
        console.log(`     Found ${nominees.length} nominees`);
        console.log(`     Categories: ${categories.join(', ')}`);
        console.log(`     ${isCorrect ? '✅ Correct' : '❌ Incorrect'}`);
      } else {
        console.log(`     ❌ API Error: ${result.error}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Test switching between categories quickly
    console.log('\n2. Testing rapid category switching:');
    
    const testCategories = ['top-recruiter', 'top-executive-leader', 'rising-star-under-30'];
    
    for (const category of testCategories) {
      console.log(`   Testing ${category}:`);
      const response = await fetch(`${baseUrl}/api/nominees?category=${category}&_t=${Date.now()}`);
      const result = await response.json();
      
      if (result.success) {
        const nominees = result.data || [];
        const categories = [...new Set(nominees.map(n => n.category))];
        const isCorrect = categories.length === 1 && categories[0] === category;
        
        console.log(`     Found ${nominees.length} nominees`);
        console.log(`     ${isCorrect ? '✅ Correct' : '❌ Incorrect'} - Categories: ${categories.join(', ')}`);
      }
    }
    
    // Test edge cases
    console.log('\n3. Testing edge cases:');
    
    // Test with invalid category
    console.log('   Testing invalid category:');
    const invalidResponse = await fetch(`${baseUrl}/api/nominees?category=invalid-category&_t=${Date.now()}`);
    const invalidResult = await invalidResponse.json();
    
    if (invalidResult.success) {
      const nominees = invalidResult.data || [];
      console.log(`     Found ${nominees.length} nominees for invalid category (should be 0)`);
      console.log(`     ${nominees.length === 0 ? '✅ Correct' : '❌ Should return 0 nominees'}`);
    }
    
    // Test with empty category (should return all)
    console.log('   Testing empty category:');
    const emptyResponse = await fetch(`${baseUrl}/api/nominees?category=&_t=${Date.now()}`);
    const emptyResult = await emptyResponse.json();
    
    if (emptyResult.success) {
      const nominees = emptyResult.data || [];
      const categories = [...new Set(nominees.map(n => n.category))];
      console.log(`     Found ${nominees.length} nominees for empty category`);
      console.log(`     Categories: ${categories.length} different categories`);
      console.log(`     ${categories.length > 1 ? '✅ Correct (multiple categories)' : '❌ Should return multiple categories'}`);
    }
    
    console.log('\n✅ Category filtering verification completed');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
  }
}

verifyCategoryFix();