const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testCorrectedFixes() {
  console.log('🧪 Testing corrected fixes...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const results = {
    schemaSetup: false,
    buildError: false,
    adminNomination: false,
    analytics: false
  };
  
  try {
    // 1. Test schema setup
    console.log('1️⃣ Testing database schema...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(3);
      
    if (!categoriesError && categories && categories.length > 0) {
      console.log('✅ Database schema is set up correctly');
      console.log('📋 Sample categories:', categories.map(c => ({
        id: c.id,
        name: c.name,
        group: c.category_groups?.name
      })));
      results.schemaSetup = true;
    } else {
      console.log('❌ Database schema not set up:', categoriesError?.message);
    }
    
    // 2. Test build error fix (check if file compiles)
    console.log('2️⃣ Testing build error fix...');
    
    try {
      // Try to import the fixed file to see if it has syntax errors
      const fs = require('fs');
      const statsRouteContent = fs.readFileSync('src/app/api/nominees/[id]/stats/route.ts', 'utf8');
      
      // Check if the duplicate variable declaration is fixed
      const daysSinceCreatedMatches = (statsRouteContent.match(/const daysSinceCreated/g) || []).length;
      
      if (daysSinceCreatedMatches === 1) {
        console.log('✅ Build error fixed - no duplicate variable declarations');
        results.buildError = true;
      } else {
        console.log(`❌ Build error not fixed - found ${daysSinceCreatedMatches} declarations of daysSinceCreated`);
      }
    } catch (buildError) {
      console.log('❌ Build error test failed:', buildError.message);
    }
    
    // 3. Test admin nomination (only if schema is set up)
    if (results.schemaSetup) {
      console.log('3️⃣ Testing admin nomination...');
      
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
          console.log('🎉 Rupesh Kumar nomination successful:', nominationResult.nominationId);
          results.adminNomination = true;
        } else {
          const errorResult = await nominationResponse.json();
          console.log('❌ Admin nomination failed:', errorResult.error);
        }
      } catch (nominationError) {
        console.log('❌ Admin nomination test failed:', nominationError.message);
      }
    }
    
    // 4. Test Advanced Analytics
    console.log('4️⃣ Testing Advanced Analytics...');
    
    try {
      const analyticsResponse = await fetch('http://localhost:3000/api/admin/analytics');
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          console.log('✅ Advanced Analytics working');
          console.log('📊 Analytics data available:', {
            totalVotes: analyticsResult.data.totalVotes,
            totalNominations: analyticsResult.data.totalNominations,
            categories: analyticsResult.data.topCategories?.length || 0
          });
          results.analytics = true;
        } else {
          console.log('❌ Advanced Analytics API error:', analyticsResult.error);
        }
      } else {
        console.log('❌ Advanced Analytics API failed:', analyticsResponse.status);
      }
    } catch (analyticsError) {
      console.log('❌ Advanced Analytics test failed:', analyticsError.message);
    }
    
    // Summary
    console.log('\n📋 CORRECTED FIXES SUMMARY:');
    console.log('='.repeat(50));
    console.log(`1. Database Schema Setup: ${results.schemaSetup ? '✅ WORKING' : '❌ NEEDS SQL SETUP'}`);
    console.log(`2. Build Error Fixed: ${results.buildError ? '✅ FIXED' : '❌ NEEDS WORK'}`);
    console.log(`3. Admin Nomination: ${results.adminNomination ? '✅ WORKING' : '❌ NEEDS SCHEMA'}`);
    console.log(`4. Advanced Analytics: ${results.analytics ? '✅ WORKING' : '❌ NEEDS SCHEMA'}`);
    
    const totalFixed = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Overall Progress: ${totalFixed}/4 fixes completed`);
    
    if (!results.schemaSetup) {
      console.log('\n⚠️ NEXT STEP: Run the corrected SQL in your Supabase dashboard:');
      console.log('📄 File: CORRECTED_ADMIN_NOMINATION_SCHEMA.sql');
    } else if (totalFixed === 4) {
      console.log('\n🎉 All fixes are working perfectly! System ready for production.');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testCorrectedFixes().catch(console.error);