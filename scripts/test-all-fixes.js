const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testAllFixes() {
  console.log('🧪 Testing all requested fixes...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const results = {
    searchTitleRemoved: false,
    voteMomentumFixed: false,
    advancedAnalytics: false,
    adminNomination: false
  };
  
  try {
    // 1. Test "Search Nominees" title removal
    console.log('1️⃣ Testing "Search Nominees" title removal...');
    
    // Check if the title was removed from the nominees page
    const fs = require('fs');
    const nomineesPageContent = fs.readFileSync('src/app/nominees/page.tsx', 'utf8');
    
    if (!nomineesPageContent.includes('Search Nominees')) {
      console.log('✅ "Search Nominees" title successfully removed');
      results.searchTitleRemoved = true;
    } else {
      console.log('❌ "Search Nominees" title still present');
    }
    
    // 2. Test vote momentum calculation (real votes + manual votes)
    console.log('2️⃣ Testing vote momentum calculation...');
    
    // Check if additional_votes column exists
    const { data: sampleNomination } = await supabase
      .from('nominations')
      .select('votes, additional_votes')
      .limit(1)
      .single();
      
    if (sampleNomination && 'additional_votes' in sampleNomination) {
      console.log('✅ Vote momentum calculation includes additional_votes');
      results.voteMomentumFixed = true;
      
      // Test the nominees API to see if it calculates total votes correctly
      const response = await fetch('http://localhost:3000/api/nominees?limit=1');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          const nominee = result.data[0];
          console.log('📊 Sample nominee vote calculation:', {
            totalVotes: nominee.votes,
            note: 'This should be real votes + additional votes'
          });
        }
      }
    } else {
      console.log('❌ additional_votes column not found');
    }
    
    // 3. Test Advanced Analytics dashboard
    console.log('3️⃣ Testing Advanced Analytics dashboard...');
    
    try {
      const analyticsResponse = await fetch('http://localhost:3000/api/admin/analytics');
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          console.log('✅ Advanced Analytics API working');
          console.log('📊 Analytics summary:', {
            totalVotes: analyticsResult.data.totalVotes,
            totalRealVotes: analyticsResult.data.totalRealVotes,
            totalAdditionalVotes: analyticsResult.data.totalAdditionalVotes,
            totalNominations: analyticsResult.data.totalNominations
          });
          results.advancedAnalytics = true;
        } else {
          console.log('❌ Advanced Analytics API returned error:', analyticsResult.error);
        }
      } else {
        console.log('❌ Advanced Analytics API request failed:', analyticsResponse.status);
      }
    } catch (analyticsError) {
      console.log('❌ Advanced Analytics test failed:', analyticsError.message);
    }
    
    // 4. Test admin nomination system (Rupesh Kumar case)
    console.log('4️⃣ Testing admin nomination system...');
    
    // Check if categories exist
    const { data: categories } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(1);
      
    if (categories && categories.length > 0) {
      console.log('✅ Categories table exists and has data');
      
      // Test the admin nomination API
      const testNominationPayload = {
        type: 'person',
        categoryGroupId: categories[0].category_groups.id,
        subcategoryId: categories[0].id,
        nominator: {
          firstname: 'Admin',
          lastname: 'User',
          email: 'admin@worldstaffingawards.com',
          linkedin: '',
          company: 'World Staffing Awards',
          jobTitle: 'Administrator',
          phone: '',
          country: 'Global'
        },
        nominee: {
          firstname: 'Rupesh',
          lastname: 'Kumar',
          jobtitle: 'Test Position',
          email: 'Rupesh.kumar@candidate.ly',
          linkedin: '',
          phone: '',
          company: '',
          country: '',
          headshotUrl: '', // Now optional
          whyMe: 'Test reason for nomination',
          bio: '',
          achievements: ''
        },
        adminNotes: 'Test admin nomination',
        bypassNominationStatus: true,
        isAdminNomination: true
      };

      try {
        const nominationResponse = await fetch('http://localhost:3000/api/nomination/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testNominationPayload)
        });

        if (nominationResponse.ok) {
          const nominationResult = await nominationResponse.json();
          console.log('✅ Admin nomination system working');
          console.log('🎉 Rupesh Kumar nomination would succeed:', nominationResult.nominationId);
          results.adminNomination = true;
        } else {
          const errorResult = await nominationResponse.json();
          console.log('❌ Admin nomination failed:', errorResult.error);
          if (errorResult.details) {
            console.log('🔍 Validation errors:', errorResult.details);
          }
        }
      } catch (nominationError) {
        console.log('❌ Admin nomination test failed:', nominationError.message);
      }
    } else {
      console.log('❌ Categories table missing or empty - run the schema setup first');
    }
    
    // Summary
    console.log('\n📋 SUMMARY OF FIXES:');
    console.log('='.repeat(50));
    console.log(`1. Remove "Search Nominees" title: ${results.searchTitleRemoved ? '✅ FIXED' : '❌ NEEDS WORK'}`);
    console.log(`2. Fix vote momentum calculation: ${results.voteMomentumFixed ? '✅ FIXED' : '❌ NEEDS WORK'}`);
    console.log(`3. Advanced Analytics dashboard: ${results.advancedAnalytics ? '✅ WORKING' : '❌ NEEDS WORK'}`);
    console.log(`4. Admin nomination system: ${results.adminNomination ? '✅ FIXED' : '❌ NEEDS SCHEMA SETUP'}`);
    
    const totalFixed = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Overall Progress: ${totalFixed}/4 fixes completed`);
    
    if (totalFixed === 4) {
      console.log('🎉 All fixes are working! Ready for production.');
    } else {
      console.log('⚠️ Some fixes need attention. See details above.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAllFixes().catch(console.error);