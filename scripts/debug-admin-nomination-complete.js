const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function debugAdminNomination() {
  console.log('🔍 Comprehensive Admin Nomination Debug...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. Check database schema
    console.log('1️⃣ Checking database schema...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(3);
      
    if (categoriesError) {
      console.error('❌ Categories not available:', categoriesError.message);
      console.log('🔧 Please run: node scripts/apply-homepage-categories.js');
      return;
    }
    
    console.log('✅ Categories available:', categories.length);
    console.log('📋 Sample categories:', categories.map(c => ({
      id: c.id,
      name: c.name,
      group: c.category_groups?.name
    })));
    
    // 2. Check settings table
    console.log('\n2️⃣ Checking settings...');
    
    const { data: settings, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .single();
      
    if (settingsError) {
      console.error('❌ Settings not available:', settingsError.message);
      console.log('🔧 Creating default settings...');
      
      const { error: insertError } = await supabase
        .from('settings')
        .insert({ nominations_open: true, voting_open: true });
        
      if (insertError) {
        console.error('❌ Failed to create settings:', insertError.message);
      } else {
        console.log('✅ Default settings created');
      }
    } else {
      console.log('✅ Settings available:', {
        nominations_open: settings.nominations_open,
        voting_open: settings.voting_open
      });
    }
    
    // 3. Test categories API
    console.log('\n3️⃣ Testing categories API...');
    
    try {
      const categoriesResponse = await fetch('http://localhost:3000/api/categories');
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        if (categoriesResult.success) {
          console.log('✅ Categories API working:', categoriesResult.data?.length || 0, 'categories');
        } else {
          console.error('❌ Categories API error:', categoriesResult.error);
        }
      } else {
        console.error('❌ Categories API failed:', categoriesResponse.status);
      }
    } catch (apiError) {
      console.error('❌ Categories API test failed:', apiError.message);
    }
    
    // 4. Test admin nomination submission
    console.log('\n4️⃣ Testing admin nomination submission...');
    
    if (categories && categories.length > 0) {
      const testCategory = categories[0];
      
      const testNominationPayload = {
        type: 'person',
        categoryGroupId: testCategory.category_groups.id,
        subcategoryId: testCategory.id,
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
          firstname: 'Test',
          lastname: 'Nominee',
          jobtitle: 'Test Position',
          email: 'test.nominee@example.com',
          linkedin: 'https://linkedin.com/in/testnominee',
          phone: '+1-555-0123',
          company: 'Test Company',
          country: 'United States',
          headshotUrl: '', // Optional for admin nominations
          whyMe: 'Test nomination for debugging admin panel functionality.',
          bio: 'Test bio for debugging purposes.',
          achievements: 'Test achievements for debugging.'
        },
        adminNotes: 'Debug test nomination',
        bypassNominationStatus: true,
        isAdminNomination: true
      };

      console.log('📤 Submitting test nomination...');
      console.log('🎯 Category:', testCategory.name);
      console.log('👤 Nominee:', testNominationPayload.nominee.firstname, testNominationPayload.nominee.lastname);

      try {
        const nominationResponse = await fetch('http://localhost:3000/api/nomination/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testNominationPayload)
        });

        console.log('📥 Response status:', nominationResponse.status);
        
        const nominationResult = await nominationResponse.json();
        console.log('📥 Response body:', JSON.stringify(nominationResult, null, 2));

        if (nominationResponse.ok) {
          console.log('✅ Admin nomination successful!');
          console.log('🎉 Nomination ID:', nominationResult.nominationId);
          
          // 5. Verify nomination appears in database
          console.log('\n5️⃣ Verifying nomination in database...');
          
          const { data: verifyNomination, error: verifyError } = await supabase
            .from('nominations')
            .select(`
              *,
              nominees!inner(*),
              nominators!inner(*),
              subcategories!inner(name, category_groups!inner(name))
            `)
            .eq('id', nominationResult.nominationId);
            
          if (verifyError) {
            console.error('❌ Failed to verify nomination:', verifyError);
          } else if (verifyNomination && verifyNomination.length > 0) {
            const nomination = verifyNomination[0];
            console.log('✅ Nomination verified in database:');
            console.log('📋 Details:', {
              id: nomination.id,
              nominee: `${nomination.nominees.firstname} ${nomination.nominees.lastname}`,
              category: nomination.subcategories?.name,
              group: nomination.subcategories?.category_groups?.name,
              state: nomination.state,
              votes: nomination.votes || 0,
              additionalVotes: nomination.additional_votes || 0
            });
            
            // 6. Test admin nominations API
            console.log('\n6️⃣ Testing admin nominations API...');
            
            try {
              const adminNominationsResponse = await fetch('http://localhost:3000/api/admin/nominations');
              if (adminNominationsResponse.ok) {
                const adminNominationsResult = await adminNominationsResponse.json();
                if (adminNominationsResult.success) {
                  const foundNomination = adminNominationsResult.data?.find(n => n.id === nominationResult.nominationId);
                  if (foundNomination) {
                    console.log('✅ Nomination appears in admin panel');
                    console.log('📋 Admin panel data:', {
                      id: foundNomination.id,
                      nominee: foundNomination.nomineeName,
                      category: foundNomination.category,
                      state: foundNomination.state
                    });
                  } else {
                    console.log('⚠️ Nomination not found in admin panel list');
                  }
                } else {
                  console.error('❌ Admin nominations API error:', adminNominationsResult.error);
                }
              } else {
                console.error('❌ Admin nominations API failed:', adminNominationsResponse.status);
              }
            } catch (adminApiError) {
              console.error('❌ Admin nominations API test failed:', adminApiError.message);
            }
          }
          
        } else {
          console.error('❌ Admin nomination failed');
          console.error('🔍 Error details:', nominationResult);
          
          // Check specific error types
          if (nominationResult.details) {
            console.error('🔍 Validation errors:', nominationResult.details);
          }
          
          if (nominationResult.error?.includes('nominations_open')) {
            console.log('💡 Suggestion: Nominations might be closed. Admin bypass should work.');
          }
          
          if (nominationResult.error?.includes('validation')) {
            console.log('💡 Suggestion: Check Zod schema validation.');
          }
        }
      } catch (nominationError) {
        console.error('❌ Nomination request failed:', nominationError.message);
        console.log('💡 Suggestion: Make sure dev server is running on localhost:3000');
      }
    }
    
    console.log('\n📋 ADMIN NOMINATION DEBUG SUMMARY:');
    console.log('='.repeat(50));
    console.log('1. Database schema: Check categories and settings tables');
    console.log('2. Categories API: Test /api/categories endpoint');
    console.log('3. Admin nomination: Test /api/nomination/submit with bypass');
    console.log('4. Database verification: Check nomination was created');
    console.log('5. Admin panel API: Test /api/admin/nominations endpoint');
    
    console.log('\n🔧 TROUBLESHOOTING STEPS:');
    console.log('1. Run: node scripts/apply-homepage-categories.js');
    console.log('2. Check dev server is running: http://localhost:3000');
    console.log('3. Test admin panel: http://localhost:3000/admin');
    console.log('4. Check browser console for errors');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugAdminNomination().catch(console.error);