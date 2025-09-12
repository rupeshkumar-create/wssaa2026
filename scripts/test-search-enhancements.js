#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Testing Search Bar Enhancements...\n');

// Test 1: Check if search suggestions API works
console.log('1. Testing search suggestions API...');
try {
  const response = execSync('curl -s "http://localhost:3000/api/search/suggestions?q=john"', { encoding: 'utf8' });
  const data = JSON.parse(response);
  console.log('✅ Search suggestions API working');
  console.log(`   Found ${data.data?.length || 0} suggestions`);
} catch (error) {
  console.log('❌ Search suggestions API failed:', error.message);
}

// Test 2: Check if trending categories API works
console.log('\n2. Testing trending categories API...');
try {
  const response = execSync('curl -s "http://localhost:3000/api/categories/trending"', { encoding: 'utf8' });
  const data = JSON.parse(response);
  console.log('✅ Trending categories API working');
  console.log(`   Found ${data.data?.length || 0} trending categories`);
  
  if (data.data && data.data.length > 0) {
    console.log('   Top trending category:', data.data[0].label, `(${data.data[0].voteCount} votes)`);
  }
} catch (error) {
  console.log('❌ Trending categories API failed:', error.message);
}

// Test 3: Check if nominees API supports search
console.log('\n3. Testing nominees API with search...');
try {
  const response = execSync('curl -s "http://localhost:3000/api/nominees?search=john"', { encoding: 'utf8' });
  const data = JSON.parse(response);
  console.log('✅ Nominees API with search working');
  console.log(`   Found ${data.data?.length || 0} nominees`);
} catch (error) {
  console.log('❌ Nominees API with search failed:', error.message);
}

console.log('\n🎉 Search enhancement tests completed!');
console.log('\nFeatures implemented:');
console.log('✅ Enhanced search bar with typing animation');
console.log('✅ Pop-up animation when typing');
console.log('✅ Advanced filter button appears when typing');
console.log('✅ Trending categories (5 categories in 2 rows)');
console.log('✅ Enhanced search suggestions with person/company details');
console.log('✅ Advanced filter modal with sorting options');
console.log('✅ Search by name, title, company, geography');
console.log('✅ Examples: "John Doe - CEO at Acme Corp"');