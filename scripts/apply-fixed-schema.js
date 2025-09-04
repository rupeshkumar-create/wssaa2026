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
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    if (error) {
      throw error;
    }
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function applyFixedSchema() {
  try {
    console.log('🚀 Applying Fixed Separated Bulk Upload Schema...\n');

    // Read the fixed schema file
    const schemaPath = path.join(__dirname, '..', 'SEPARATED_BULK_UPLOAD_SCHEMA_FIXED.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema as individual statements
    const statements = [
      // Create loops_user_groups table first
      `CREATE TABLE IF NOT EXISTS loops_user_groups (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        group_name TEXT UNIQUE NOT NULL,
        description TEXT,
        category_filter TEXT,
        type_filter TEXT CHECK (type_filter IN ('person', 'company')),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create separated bulk upload batches table
      `CREATE TABLE IF NOT EXISTS separated_bulk_upload_batches (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        filename TEXT NOT NULL,
        upload_type TEXT NOT NULL CHECK (upload_type IN ('person', 'company')),
        total_rows INTEGER NOT NULL DEFAULT 0,
        processed_rows INTEGER NOT NULL DEFAULT 0,
        successful_rows INTEGER NOT NULL DEFAULT 0,
        failed_rows INTEGER NOT NULL DEFAULT 0,
        draft_rows INTEGER NOT NULL DEFAULT 0,
        approved_rows INTEGER NOT NULL DEFAULT 0,
        loops_synced_rows INTEGER NOT NULL DEFAULT 0,
        status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
        uploaded_by TEXT NOT NULL DEFAULT 'admin',
        uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        completed_at TIMESTAMP WITH TIME ZONE,
        approval_completed_at TIMESTAMP WITH TIME ZONE,
        error_summary TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Create separated bulk upload errors table
      `CREATE TABLE IF NOT EXISTS separated_bulk_upload_errors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        batch_id UUID NOT NULL REFERENCES separated_bulk_upload_batches(id) ON DELETE CASCADE,
        row_number INTEGER NOT NULL,
        field_name TEXT,
        error_message TEXT NOT NULL,
        raw_data JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )`,

      // Add Loops sync fields to nominations table
      `ALTER TABLE nominations 
       ADD COLUMN IF NOT EXISTS loops_contact_id TEXT,
       ADD COLUMN IF NOT EXISTS loops_user_group TEXT,
       ADD COLUMN IF NOT EXISTS loops_synced_at TIMESTAMP WITH TIME ZONE,
       ADD COLUMN IF NOT EXISTS loops_sync_status TEXT DEFAULT 'pending',
       ADD COLUMN IF NOT EXISTS loops_sync_error TEXT,
       ADD COLUMN IF NOT EXISTS approved_by TEXT,
       ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE`,

      // Insert Loops user groups
      `INSERT INTO loops_user_groups (group_name, description, category_filter, type_filter) VALUES
       ('nominees-person-usa', 'Person nominees from USA region', 'usa,north-america', 'person'),
       ('nominees-person-europe', 'Person nominees from Europe region', 'europe', 'person'),
       ('nominees-person-global', 'Global person nominees', 'global', 'person'),
       ('nominees-person-general', 'General person nominees', NULL, 'person'),
       ('nominees-company-usa', 'Company nominees from USA region', 'usa,north-america', 'company'),
       ('nominees-company-europe', 'Company nominees from Europe region', 'europe', 'company'),
       ('nominees-company-global', 'Global company nominees', 'global', 'company'),
       ('nominees-company-general', 'General company nominees', NULL, 'company')
       ON CONFLICT (group_name) DO UPDATE SET
       description = EXCLUDED.description,
       category_filter = EXCLUDED.category_filter,
       type_filter = EXCLUDED.type_filter,
       updated_at = NOW()`
    ];

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      const result = await executeSQL(statements[i]);
      
      if (result.success) {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } else {
        console.log(`⚠️  Statement ${i + 1} warning: ${result.error}`);
      }
    }

    // Create indexes
    console.log('\n📋 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_status ON separated_bulk_upload_batches(status)',
      'CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_upload_type ON separated_bulk_upload_batches(upload_type)',
      'CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_batches_uploaded_at ON separated_bulk_upload_batches(uploaded_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_separated_bulk_upload_errors_batch_id ON separated_bulk_upload_errors(batch_id)',
      'CREATE INDEX IF NOT EXISTS idx_nominations_loops_sync_status ON nominations(loops_sync_status)',
      'CREATE INDEX IF NOT EXISTS idx_nominations_loops_user_group ON nominations(loops_user_group)'
    ];

    for (const indexSQL of indexes) {
      const result = await executeSQL(indexSQL);
      if (result.success) {
        console.log(`✅ Index created successfully`);
      } else {
        console.log(`⚠️  Index warning: ${result.error}`);
      }
    }

    // Verify tables were created
    console.log('\n🔍 Verifying table creation...');
    
    const tables = [
      'separated_bulk_upload_batches',
      'separated_bulk_upload_errors',
      'loops_user_groups'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.log(`❌ Table '${table}' verification failed: ${error.message}`);
        } else {
          console.log(`✅ Table '${table}' exists and is accessible`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}' verification failed: ${err.message}`);
      }
    }

    // Check Loops user groups
    console.log('\n📋 Checking Loops user groups...');
    try {
      const { data: userGroups, error } = await supabase
        .from('loops_user_groups')
        .select('*');

      if (error) {
        console.log(`❌ Loops user groups check failed: ${error.message}`);
      } else {
        console.log(`✅ Found ${userGroups.length} Loops user groups:`);
        userGroups.forEach(group => {
          console.log(`   - ${group.group_name}: ${group.description}`);
        });
      }
    } catch (err) {
      console.log(`❌ Loops user groups check failed: ${err.message}`);
    }

    console.log('\n🎉 Fixed Schema Application Completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the separated bulk upload in the admin panel');
    console.log('2. Download person/company CSV templates');
    console.log('3. Upload test CSV files');
    console.log('4. Verify draft/approval workflow');
    console.log('5. Test Loops integration');

  } catch (error) {
    console.error('❌ Error applying fixed schema:', error);
    process.exit(1);
  }
}

// Run the schema application
applyFixedSchema();