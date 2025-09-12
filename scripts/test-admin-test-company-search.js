#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminTestCompanySearch() {
  console.log('🔍 Testing Admin Test Company search functionality...\n');

  try {
    // 1. First, let's find the specific nominee by slug
    console.log('1. Looking for nominee with slug "admin-test-company"...');
    const { data: nomineeBySlug, error: slugError } = await supabase
      .from('nominations')
      .select(`
        *,
        nominees!inner(*),
        nominators!inner(*)
      `)
      .eq('live_url', 'admin-test-company')
      .single();

    if (slugError) {
      console.log('   ❌ Error finding by slug:', slugError.message);
      
      // Try alternative approach - search by company name
      console.log('2. Searching by company name "Admin Test Company"...');
      const { data: nomineeByName, error: nameError } = await supabase
        .from('nominations')
        .select(`
          *,
          nominees!inner(*),
          nominators!inner(*)
        `)
        .ilike('nominees.company_name', '%admin test company%');

      if (nameError) {
        console.log('   ❌ Error searching by name:', nameError.message);
        return;
      }

      if (!nomineeByName || nomineeByName.length === 0) {
        console.log('   ❌ No nominees found with company name "Admin Test Company"');
        
        // Let's see what nominees exist
        console.log('3. Checking all approved nominees...');
        const { data: allNominees, error: allError } = await supabase
          .from('nominations')
          .select(`
            id,
            state,
            live_url,
            nominees!inner(company_name, firstname, lastname, type)
          `)
          .eq('state', 'approved')
          .limit(10);

        if (allError) {
          console.log('   ❌ Error fetching all nominees:', allError.message);
          return;
        }

        console.log('   📋 Found approved nominees:');
        allNominees.forEach(nom => {
          const name = nom.nominees.type === 'company' 
            ? nom.nominees.company_name 
            : `${nom.nominees.firstname} ${nom.nominees.lastname}`;
          console.log(`      - ID: ${nom.id}, Name: ${name}, Live URL: ${nom.live_url}, State: ${nom.state}`);
        });
        return;
      }

      console.log(`   ✅ Found ${nomineeByName.length} nominees by name`);
      nomineeByName.forEach(nom => {
        console.log(`      - ID: ${nom.id}, State: ${nom.state}, Live URL: ${nom.live_url}`);
      });
      
      // Use the first one found
      if (nomineeByName.length > 0) {
        console.log('\n4. Testing the first nominee found...');
        await testNomineeDetails(nomineeByName[0]);
      }
      return;
    }

    console.log('   ✅ Found nominee by slug!');
    console.log(`      - ID: ${nomineeBySlug.id}`);
    console.log(`      - State: ${nomineeBySlug.state}`);
    console.log(`      - Live URL: ${nomineeBySlug.live_url}`);
    console.log(`      - Company Name: ${nomineeBySlug.nominees?.company_name}`);

    await testNomineeDetails(nomineeBySlug);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

async function testNomineeDetails(nominee) {
  console.log('\n📋 Nominee Details:');
  console.log(`   - ID: ${nominee.id}`);
  console.log(`   - State: ${nominee.state}`);
  console.log(`   - Type: ${nominee.nominees?.type}`);
  console.log(`   - Company Name: ${nominee.nominees?.company_name}`);
  console.log(`   - Live URL: ${nominee.live_url}`);
  console.log(`   - Created: ${nominee.created_at}`);
  console.log(`   - Approved: ${nominee.approved_at}`);

  // Test if this nominee appears in the API
  console.log('\n🔍 Testing API endpoints...');
  
  // Test 1: General nominees API
  console.log('1. Testing /api/nominees...');
  try {
    const response = await fetch('http://localhost:3000/api/nominees');
    const result = await response.json();
    
    if (!result.success) {
      console.log('   ❌ API call failed:', result.error);
      return;
    }

    const foundInGeneral = result.data.find(n => n.id === nominee.id);
    if (foundInGeneral) {
      console.log('   ✅ Found in general nominees API');
    } else {
      console.log('   ❌ NOT found in general nominees API');
      console.log(`   📊 Total nominees returned: ${result.data.length}`);
    }
  } catch (error) {
    console.log('   ❌ Error calling nominees API:', error.message);
  }

  // Test 2: Search API with company name
  console.log('\n2. Testing search with "admin test company"...');
  try {
    const searchQuery = encodeURIComponent('admin test company');
    const response = await fetch(`http://localhost:3000/api/nominees?search=${searchQuery}`);
    const result = await response.json();
    
    if (!result.success) {
      console.log('   ❌ Search API call failed:', result.error);
      return;
    }

    const foundInSearch = result.data.find(n => n.id === nominee.id);
    if (foundInSearch) {
      console.log('   ✅ Found in search results');
    } else {
      console.log('   ❌ NOT found in search results');
      console.log(`   📊 Search returned: ${result.data.length} results`);
      if (result.data.length > 0) {
        console.log('   📋 Search results:');
        result.data.forEach(n => {
          console.log(`      - ${n.name} (ID: ${n.id})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Error calling search API:', error.message);
  }

  // Test 3: Search suggestions API
  console.log('\n3. Testing search suggestions with "admin"...');
  try {
    const response = await fetch('http://localhost:3000/api/search/suggestions?q=admin');
    const result = await response.json();
    
    if (!result.success) {
      console.log('   ❌ Suggestions API call failed:', result.error);
      return;
    }

    const foundInSuggestions = result.data.find(s => s.nominationId === nominee.id);
    if (foundInSuggestions) {
      console.log('   ✅ Found in search suggestions');
    } else {
      console.log('   ❌ NOT found in search suggestions');
      console.log(`   📊 Suggestions returned: ${result.data.length} results`);
      if (result.data.length > 0) {
        console.log('   📋 Suggestions:');
        result.data.forEach(s => {
          console.log(`      - ${s.text} (${s.type})`);
        });
      }
    }
  } catch (error) {
    console.log('   ❌ Error calling suggestions API:', error.message);
  }

  // Test 4: Direct nominee page
  console.log('\n4. Testing direct nominee page access...');
  try {
    const response = await fetch(`http://localhost:3000/api/nominees/${nominee.id}`);
    const result = await response.json();
    
    if (!result.success) {
      console.log('   ❌ Direct nominee API call failed:', result.error);
      return;
    }

    console.log('   ✅ Direct nominee page accessible');
    console.log(`   📋 Nominee name: ${result.data.name}`);
  } catch (error) {
    console.log('   ❌ Error calling direct nominee API:', error.message);
  }
}

// Run the test
testAdminTestCompanySearch().catch(console.error);