#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function simulateFrontendFlow() {
  console.log('🔍 Simulating frontend category filtering flow...');
  
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Initial page load - get all nominees
    console.log('\n1. Initial page load (all nominees):');
    const allResponse = await fetch(`${baseUrl}/api/nominees?_t=${Date.now()}`);
    const allResult = await allResponse.json();
    
    if (!allResult.success) {
      console.error('❌ Error loading all nominees:', allResult.error);
      return;
    }
    
    const allNominees = allResult.data || [];
    console.log(`   Loaded ${allNominees.length} total nominees`);
    
    const allCategories = [...new Set(allNominees.map(n => n.category))];
    console.log(`   Categories: ${allCategories.join(', ')}`);
    
    // Step 2: User clicks on "Top Recruiters" category
    console.log('\n2. User clicks "Top Recruiters" category:');
    const categoryFilter = 'top-recruiter';
    
    const filteredResponse = await fetch(`${baseUrl}/api/nominees?_t=${Date.now()}&category=${categoryFilter}`);
    const filteredResult = await filteredResponse.json();
    
    if (!filteredResult.success) {
      console.error('❌ Error loading filtered nominees:', filteredResult.error);
      return;
    }
    
    const filteredNominees = filteredResult.data || [];
    console.log(`   Loaded ${filteredNominees.length} nominees for "${categoryFilter}"`);
    
    const filteredCategories = [...new Set(filteredNominees.map(n => n.category))];
    console.log(`   Categories in filtered results: ${filteredCategories.join(', ')}`);
    
    // Step 3: Verify filtering worked correctly
    const isCorrectlyFiltered = filteredCategories.length === 1 && filteredCategories[0] === categoryFilter;
    console.log(`   ${isCorrectlyFiltered ? '✅ Filtering working correctly' : '❌ Filtering failed'}`);
    
    if (isCorrectlyFiltered) {
      console.log('   Sample filtered nominees:');
      filteredNominees.slice(0, 5).forEach((n, i) => {
        console.log(`     ${i + 1}. ${n.name} (${n.category}) - ${n.votes} votes`);
      });
    } else {
      console.log('   ⚠️ Issue detected - showing all categories in filtered results');
      console.log('   This suggests the API filtering is not working as expected');
    }
    
    // Step 4: Test another category
    console.log('\n3. Testing another category (top-executive-leader):');
    const categoryFilter2 = 'top-executive-leader';
    
    const filtered2Response = await fetch(`${baseUrl}/api/nominees?_t=${Date.now()}&category=${categoryFilter2}`);
    const filtered2Result = await filtered2Response.json();
    
    if (filtered2Result.success) {
      const filtered2Nominees = filtered2Result.data || [];
      const filtered2Categories = [...new Set(filtered2Nominees.map(n => n.category))];
      const isCorrectlyFiltered2 = filtered2Categories.length === 1 && filtered2Categories[0] === categoryFilter2;
      
      console.log(`   Found ${filtered2Nominees.length} nominees for "${categoryFilter2}"`);
      console.log(`   Categories: ${filtered2Categories.join(', ')}`);
      console.log(`   ${isCorrectlyFiltered2 ? '✅ Filtering working correctly' : '❌ Filtering failed'}`);
    }
    
    console.log('\n✅ Frontend flow simulation completed');
    
  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
  }
}

simulateFrontendFlow();