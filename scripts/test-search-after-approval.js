#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testSearchAfterApproval() {
  console.log('🔍 Testing Search After Approval...\n');

  // Test 1: Check if we have any approved nominations
  console.log('1. Checking approved nominations:');
  try {
    const nomineesResponse = await fetch('http://localhost:3000/api/nominees?limit=10');
    const nomineesResult = await nomineesResponse.json();
    
    console.log(`   Found ${nomineesResult.data?.length || 0} approved nominees`);
    if (nomineesResult.data && nomineesResult.data.length > 0) {
      console.log('   Sample nominees:');
      nomineesResult.data.slice(0, 3).forEach((nominee, index) => {
        console.log(`   ${index + 1}. ${nominee.name} (${nominee.type}) - ${nominee.votes} votes`);
      });
    }
  } catch (error) {
    console.log(`   ❌ Error fetching nominees: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 2: Test search suggestions
  console.log('2. Testing search suggestions:');
  const searchQueries = ['test', 'john', 'company', 'recruiter'];
  
  for (const query of searchQueries) {
    try {
      const suggestionsResponse = await fetch(`http://localhost:3000/api/search/suggestions?q=${encodeURIComponent(query)}`);
      const suggestionsResult = await suggestionsResponse.json();
      
      console.log(`   Query "${query}": ${suggestionsResult.data?.length || 0} suggestions`);
      if (suggestionsResult.data && suggestionsResult.data.length > 0) {
        suggestionsResult.data.slice(0, 2).forEach(suggestion => {
          console.log(`     - ${suggestion.text} (${suggestion.type})`);
        });
      }
    } catch (error) {
      console.log(`   ❌ Error with query "${query}": ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 3: Test search results (the main issue)
  console.log('3. Testing search results:');
  
  for (const query of searchQueries) {
    try {
      const searchResponse = await fetch(`http://localhost:3000/api/nominees?search=${encodeURIComponent(query)}`);
      const searchResult = await searchResponse.json();
      
      console.log(`   Search "${query}": ${searchResult.data?.length || 0} results`);
      if (searchResult.data && searchResult.data.length > 0) {
        searchResult.data.slice(0, 2).forEach(nominee => {
          console.log(`     - ${nominee.name} (${nominee.type})`);
        });
      } else {
        console.log(`     No results found for "${query}"`);
      }
    } catch (error) {
      console.log(`   ❌ Error searching "${query}": ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 4: Test specific nominee search (if we have data)
  console.log('4. Testing specific nominee search:');
  
  try {
    // First get a nominee name to search for
    const nomineesResponse = await fetch('http://localhost:3000/api/nominees?limit=1');
    const nomineesResult = await nomineesResponse.json();
    
    if (nomineesResult.data && nomineesResult.data.length > 0) {
      const testNominee = nomineesResult.data[0];
      const searchName = testNominee.name.split(' ')[0]; // Search by first name/word
      
      console.log(`   Searching for: "${searchName}" (from nominee: ${testNominee.name})`);
      
      const searchResponse = await fetch(`http://localhost:3000/api/nominees?search=${encodeURIComponent(searchName)}`);
      const searchResult = await searchResponse.json();
      
      console.log(`   Results: ${searchResult.data?.length || 0} nominees found`);
      if (searchResult.data && searchResult.data.length > 0) {
        console.log('   ✅ Search is working! Found:');
        searchResult.data.forEach(nominee => {
          console.log(`     - ${nominee.name} (${nominee.type})`);
        });
      } else {
        console.log('   ❌ Search not working - no results found');
      }
    } else {
      console.log('   ⚠️  No approved nominees found to test search with');
    }
  } catch (error) {
    console.log(`   ❌ Error in specific search test: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // Test 5: Test real-time approval workflow
  console.log('5. Testing real-time approval workflow:');
  console.log('   This would require:');
  console.log('   1. Submit a test nomination');
  console.log('   2. Approve it via admin panel');
  console.log('   3. Immediately search for it');
  console.log('   4. Verify it appears in search results');
  console.log('   (This test requires manual admin panel interaction)');

  console.log('\n🔍 Search Testing Complete!');
  console.log('\nNext steps:');
  console.log('1. If search results are empty, check database for approved nominations');
  console.log('2. If suggestions work but results don\'t, the API fix should resolve it');
  console.log('3. Test by approving a nomination in admin panel and searching immediately');
}

// Run the test
testSearchAfterApproval().catch(console.error);