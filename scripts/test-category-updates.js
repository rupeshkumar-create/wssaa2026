#!/usr/bin/env node

/**
 * Test Category Updates
 * Verifies that the category changes are working correctly
 */

const { CATEGORIES } = require('../src/lib/constants.ts');

console.log('🧪 Testing Category Updates...\n');

console.log('📋 Current Categories:');
CATEGORIES.forEach((category, index) => {
  console.log(`${index + 1}. ${category.label}`);
  console.log(`   ID: ${category.id}`);
  console.log(`   Type: ${category.type}`);
  console.log(`   Group: ${category.group}\n`);
});

console.log(`✅ Total Categories: ${CATEGORIES.length}`);
console.log('✅ Expected: 3 categories');
console.log(`✅ Match: ${CATEGORIES.length === 3 ? 'YES' : 'NO'}\n`);

// Check if all expected categories are present
const expectedCategories = [
  'top-100-staffing-leaders-2026',
  'top-100-staffing-companies-2026', 
  'top-100-recruiters-2026'
];

console.log('🔍 Checking Expected Categories:');
expectedCategories.forEach(expectedId => {
  const found = CATEGORIES.find(c => c.id === expectedId);
  console.log(`${found ? '✅' : '❌'} ${expectedId}: ${found ? found.label : 'NOT FOUND'}`);
});

console.log('\n🚀 Category update test complete!');
console.log('Next: Start the development server with npm run dev');