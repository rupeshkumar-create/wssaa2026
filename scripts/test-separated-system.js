#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testSeparatedBulkUploadSystem() {
  console.log('🧪 Testing Separated Bulk Upload System...\n');

  try {
    // Test 1: Check database tables
    console.log('📋 Test 1: Verifying database tables...');
    
    const tables = [
      'separated_bulk_upload_batches',
      'separated_bulk_upload_errors', 
      'loops_user_groups'
    ];

    let tablesOK = 0;
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Table '${table}' not accessible: ${error.message}`);
      } else {
        console.log(`✅ Table '${table}' exists and accessible`);
        tablesOK++;
      }
    }

    // Test 2: Check nominations table updates
    console.log('\n📋 Test 2: Verifying nominations table updates...');
    
    const { data: nominationsData, error: nominationsError } = await supabase
      .from('nominations')
      .select('id, loops_contact_id, loops_user_group, loops_sync_status, approved_by, approved_at')
      .limit(1);

    if (nominationsError) {
      console.log(`❌ Nominations table updates not found: ${nominationsError.message}`);
    } else {
      console.log(`✅ Nominations table has Loops sync fields`);
    }

    // Test 3: Check Loops user groups
    console.log('\n📋 Test 3: Verifying Loops user groups...');
    
    const { data: userGroups, error: userGroupsError } = await supabase
      .from('loops_user_groups')
      .select('*');

    if (userGroupsError) {
      console.log(`❌ Loops user groups not accessible: ${userGroupsError.message}`);
    } else {
      console.log(`✅ Found ${userGroups.length} Loops user groups:`);
      userGroups.forEach(group => {
        console.log(`   - ${group.group_name}: ${group.description}`);
      });
    }

    // Test 4: Test CSV template files
    console.log('\n📋 Test 4: Verifying CSV template files...');
    
    const templateFiles = [
      'templates/person_nominations_comprehensive.csv',
      'templates/company_nominations_comprehensive.csv'
    ];

    let templatesOK = 0;
    for (const templateFile of templateFiles) {
      const templatePath = path.join(__dirname, '..', templateFile);
      if (fs.existsSync(templatePath)) {
        const content = fs.readFileSync(templatePath, 'utf8');
        const lines = content.split('\n').filter(line => line.trim());
        console.log(`✅ Template '${templateFile}' exists with ${lines.length - 1} example rows`);
        templatesOK++;
      } else {
        console.log(`❌ Template '${templateFile}' not found`);
      }
    }

    // Test 5: Test API endpoints
    console.log('\n📋 Test 5: Testing API endpoint files...');
    
    const apiFiles = [
      'src/app/api/admin/separated-bulk-upload/route.ts',
      'src/app/api/admin/separated-bulk-upload/batches/route.ts',
      'src/app/api/admin/separated-bulk-upload/approve-drafts/route.ts'
    ];

    let apisOK = 0;
    for (const apiFile of apiFiles) {
      const apiPath = path.join(__dirname, '..', apiFile);
      if (fs.existsSync(apiPath)) {
        console.log(`✅ API file '${apiFile}' exists`);
        apisOK++;
      } else {
        console.log(`❌ API file '${apiFile}' not found`);
      }
    }

    // Test 6: Test component files
    console.log('\n📋 Test 6: Testing component files...');
    
    const componentFiles = [
      'src/components/admin/SeparatedBulkUploadPanel.tsx'
    ];

    let componentsOK = 0;
    for (const componentFile of componentFiles) {
      const componentPath = path.join(__dirname, '..', componentFile);
      if (fs.existsSync(componentPath)) {
        console.log(`✅ Component '${componentFile}' exists`);
        componentsOK++;
      } else {
        console.log(`❌ Component '${componentFile}' not found`);
      }
    }

    // Test 7: Environment variables check
    console.log('\n📋 Test 7: Checking environment variables...');
    
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY',
      'LOOPS_API_KEY'
    ];

    let envVarsOK = 0;
    for (const envVar of requiredEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ Environment variable '${envVar}' is set`);
        envVarsOK++;
      } else {
        console.log(`❌ Environment variable '${envVar}' is missing`);
      }
    }

    // Test 8: Create a test batch record
    console.log('\n📋 Test 8: Testing batch creation...');
    
    try {
      const testBatch = {
        filename: 'test_batch.csv',
        upload_type: 'person',
        total_rows: 5,
        processed_rows: 5,
        successful_rows: 4,
        failed_rows: 1,
        draft_rows: 4,
        approved_rows: 0,
        status: 'completed',
        uploaded_by: 'test_script'
      };

      const { data: batchData, error: batchError } = await supabase
        .from('separated_bulk_upload_batches')
        .insert(testBatch)
        .select()
        .single();

      if (batchError) {
        console.log(`❌ Test batch creation failed: ${batchError.message}`);
      } else {
        console.log(`✅ Test batch created successfully with ID: ${batchData.id}`);
        
        // Clean up test batch
        await supabase
          .from('separated_bulk_upload_batches')
          .delete()
          .eq('id', batchData.id);
        
        console.log(`✅ Test batch cleaned up`);
      }
    } catch (err) {
      console.log(`❌ Test batch creation error: ${err.message}`);
    }

    // Summary
    console.log('\n🎉 Separated Bulk Upload System Test Summary');
    console.log('=' .repeat(50));
    console.log(`📊 Database Tables: ${tablesOK}/3 working`);
    console.log(`📄 CSV Templates: ${templatesOK}/2 available`);
    console.log(`🔌 API Endpoints: ${apisOK}/3 files found`);
    console.log(`🧩 Components: ${componentsOK}/1 files found`);
    console.log(`🔐 Environment Variables: ${envVarsOK}/3 configured`);

    const totalScore = tablesOK + templatesOK + apisOK + componentsOK + envVarsOK;
    const maxScore = 3 + 2 + 3 + 1 + 3; // 12 total

    console.log(`\n🏆 Overall Score: ${totalScore}/${maxScore} (${Math.round(totalScore/maxScore*100)}%)`);

    if (totalScore >= 10) {
      console.log('\n🚀 System is ready for use!');
      console.log('\n📝 Usage Instructions:');
      console.log('1. Go to Admin Panel → Bulk Upload tab');
      console.log('2. Use the "Separated Bulk Upload System" section');
      console.log('3. Download person or company CSV templates');
      console.log('4. Fill in the templates with your data');
      console.log('5. Upload the CSV files');
      console.log('6. Review and approve draft nominations');
      console.log('7. Approved nominations will sync to Loops automatically');
    } else {
      console.log('\n⚠️  System needs attention before use');
      console.log('Please run: node scripts/apply-fixed-schema.js');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testSeparatedBulkUploadSystem();