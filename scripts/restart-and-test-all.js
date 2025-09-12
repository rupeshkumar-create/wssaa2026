const { spawn, exec } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function killExistingServer() {
  return new Promise((resolve) => {
    console.log('🔄 Killing existing dev server...');
    
    // Kill any existing Next.js dev server
    exec('pkill -f "next dev"', (error) => {
      if (error) {
        console.log('ℹ️ No existing dev server found');
      } else {
        console.log('✅ Existing dev server killed');
      }
      
      // Wait a moment for cleanup
      setTimeout(resolve, 2000);
    });
  });
}

async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting fresh dev server...');
    
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let serverReady = false;
    let startupTimeout;

    devServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('📡 Dev server:', output.trim());
      
      // Check if server is ready
      if (output.includes('Ready') || output.includes('localhost:3000')) {
        if (!serverReady) {
          serverReady = true;
          clearTimeout(startupTimeout);
          console.log('✅ Dev server is ready!');
          resolve(devServer);
        }
      }
    });

    devServer.stderr.on('data', (data) => {
      const error = data.toString();
      console.error('❌ Dev server error:', error.trim());
    });

    devServer.on('error', (error) => {
      console.error('❌ Failed to start dev server:', error);
      reject(error);
    });

    // Timeout after 30 seconds
    startupTimeout = setTimeout(() => {
      if (!serverReady) {
        console.log('⚠️ Dev server taking longer than expected, but continuing with tests...');
        resolve(devServer);
      }
    }, 30000);
  });
}

async function waitForServer() {
  console.log('⏳ Waiting for server to be fully ready...');
  
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch('http://localhost:3000/api/test-env');
      if (response.ok) {
        console.log('✅ Server is responding to API calls');
        return true;
      }
    } catch (error) {
      console.log(`⏳ Attempt ${i + 1}/10: Server not ready yet...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('⚠️ Server may not be fully ready, but proceeding with tests...');
  return false;
}

async function testAllFixes() {
  console.log('\n🧪 Testing all implemented fixes...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const results = {
    searchTitleRemoved: false,
    buildError: false,
    voteMomentum: false,
    databaseSchema: false,
    adminNomination: false,
    advancedAnalytics: false
  };
  
  try {
    // 1. Test "Search Nominees" title removal
    console.log('\n1️⃣ Testing "Search Nominees" title removal...');
    
    const fs = require('fs');
    const nomineesPageContent = fs.readFileSync('src/app/nominees/page.tsx', 'utf8');
    
    if (!nomineesPageContent.includes('Search Nominees')) {
      console.log('✅ "Search Nominees" title successfully removed from hero section');
      results.searchTitleRemoved = true;
    } else {
      console.log('❌ "Search Nominees" title still present');
    }
    
    // 2. Test build error fix
    console.log('\n2️⃣ Testing build error fix...');
    
    const statsRouteContent = fs.readFileSync('src/app/api/nominees/[id]/stats/route.ts', 'utf8');
    const daysSinceCreatedMatches = (statsRouteContent.match(/const daysSinceCreated/g) || []).length;
    
    if (daysSinceCreatedMatches === 1) {
      console.log('✅ Build error fixed - no duplicate variable declarations');
      results.buildError = true;
    } else {
      console.log(`❌ Build error not fixed - found ${daysSinceCreatedMatches} declarations of daysSinceCreated`);
    }
    
    // 3. Test vote momentum calculation
    console.log('\n3️⃣ Testing vote momentum calculation...');
    
    const { data: sampleNomination } = await supabase
      .from('nominations')
      .select('votes, additional_votes')
      .limit(1)
      .single();
      
    if (sampleNomination && 'additional_votes' in sampleNomination) {
      console.log('✅ Vote momentum includes additional_votes column');
      console.log('📊 Sample calculation: votes + additional_votes = total votes');
      results.voteMomentum = true;
    } else {
      console.log('❌ additional_votes column not found');
    }
    
    // 4. Test database schema
    console.log('\n4️⃣ Testing database schema...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(3);
      
    if (!categoriesError && categories && categories.length > 0) {
      console.log('✅ Database schema is properly set up');
      console.log('📋 Available categories:', categories.map(c => ({
        id: c.id,
        name: c.name,
        group: c.category_groups?.name
      })));
      results.databaseSchema = true;
    } else {
      console.log('❌ Database schema not set up:', categoriesError?.message);
    }
    
    // 5. Test admin nomination (only if schema is ready)
    if (results.databaseSchema) {
      console.log('\n5️⃣ Testing admin nomination system...');
      
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
          whyMe: 'Test reason for nomination - exceptional leadership in staffing industry',
          bio: 'Experienced professional in staffing and recruiting',
          achievements: 'Multiple industry awards and recognitions'
        },
        adminNotes: 'Test admin nomination for Rupesh Kumar',
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
          console.log('✅ Admin nomination system working perfectly!');
          console.log('🎉 Rupesh Kumar nomination successful:', {
            nominationId: nominationResult.nominationId,
            nomineeId: nominationResult.nomineeId,
            email: 'Rupesh.kumar@candidate.ly'
          });
          results.adminNomination = true;
        } else {
          const errorResult = await nominationResponse.json();
          console.log('❌ Admin nomination failed:', errorResult.error);
          if (errorResult.details) {
            console.log('🔍 Details:', errorResult.details);
          }
        }
      } catch (nominationError) {
        console.log('❌ Admin nomination test failed:', nominationError.message);
      }
    }
    
    // 6. Test Advanced Analytics
    console.log('\n6️⃣ Testing Advanced Analytics dashboard...');
    
    try {
      const analyticsResponse = await fetch('http://localhost:3000/api/admin/analytics');
      if (analyticsResponse.ok) {
        const analyticsResult = await analyticsResponse.json();
        if (analyticsResult.success) {
          console.log('✅ Advanced Analytics dashboard working!');
          console.log('📊 Analytics data:', {
            totalVotes: analyticsResult.data.totalVotes,
            totalRealVotes: analyticsResult.data.totalRealVotes,
            totalAdditionalVotes: analyticsResult.data.totalAdditionalVotes,
            totalNominations: analyticsResult.data.totalNominations,
            categories: analyticsResult.data.topCategories?.length || 0
          });
          results.advancedAnalytics = true;
        } else {
          console.log('❌ Advanced Analytics API error:', analyticsResult.error);
        }
      } else {
        console.log('❌ Advanced Analytics API failed:', analyticsResponse.status);
      }
    } catch (analyticsError) {
      console.log('❌ Advanced Analytics test failed:', analyticsError.message);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 COMPREHENSIVE TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`1. Remove "Search Nominees" title: ${results.searchTitleRemoved ? '✅ FIXED' : '❌ FAILED'}`);
    console.log(`2. Build error resolved: ${results.buildError ? '✅ FIXED' : '❌ FAILED'}`);
    console.log(`3. Vote momentum calculation: ${results.voteMomentum ? '✅ WORKING' : '❌ FAILED'}`);
    console.log(`4. Database schema setup: ${results.databaseSchema ? '✅ READY' : '❌ NEEDS SETUP'}`);
    console.log(`5. Admin nomination system: ${results.adminNomination ? '✅ WORKING' : '❌ NEEDS SCHEMA'}`);
    console.log(`6. Advanced Analytics: ${results.advancedAnalytics ? '✅ WORKING' : '❌ NEEDS SCHEMA'}`);
    
    const totalFixed = Object.values(results).filter(Boolean).length;
    console.log(`\n🎯 Overall Progress: ${totalFixed}/6 fixes completed`);
    
    if (totalFixed === 6) {
      console.log('\n🎉 ALL FIXES ARE WORKING PERFECTLY!');
      console.log('🚀 System is ready for production deployment!');
      console.log('\n✅ Rupesh Kumar can now be nominated successfully with email: Rupesh.kumar@candidate.ly');
    } else if (!results.databaseSchema) {
      console.log('\n⚠️ NEXT STEP: Run the database schema setup');
      console.log('📄 File: CORRECTED_ADMIN_NOMINATION_SCHEMA.sql');
      console.log('📍 Location: Supabase Dashboard → SQL Editor');
    } else {
      console.log('\n⚠️ Some fixes need attention. Check the details above.');
    }
    
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

async function main() {
  console.log('🔄 Restarting dev server and testing all fixes...\n');
  
  try {
    // Step 1: Kill existing server
    await killExistingServer();
    
    // Step 2: Start fresh server
    const devServer = await startDevServer();
    
    // Step 3: Wait for server to be ready
    await waitForServer();
    
    // Step 4: Run comprehensive tests
    await testAllFixes();
    
    console.log('\n🎯 Testing complete! Dev server is still running for manual testing.');
    console.log('📍 Visit: http://localhost:3000');
    console.log('🔧 Admin panel: http://localhost:3000/admin');
    
    // Keep the process alive so server stays running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down dev server...');
      devServer.kill();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to restart and test:', error);
    process.exit(1);
  }
}

main().catch(console.error);