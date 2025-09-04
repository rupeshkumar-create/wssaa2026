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

async function applySchema() {
  try {
    console.log('🚀 Applying Separated Bulk Upload Schema...');

    // Read the schema file
    const schemaPath = path.join(__dirname, '..', 'SEPARATED_BULK_UPLOAD_SCHEMA_FIXED.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        try {
          console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
          
          const { error } = await supabase.rpc('exec_sql', { 
            sql_query: statement + ';' 
          });

          if (error) {
            // Try direct query if RPC fails
            const { error: directError } = await supabase
              .from('_temp')
              .select('*')
              .limit(0);
            
            // Execute using raw query
            const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'apikey': supabaseServiceKey
              },
              body: JSON.stringify({ sql_query: statement + ';' })
            });

            if (!response.ok) {
              console.warn(`⚠️  Statement ${i + 1} may have failed, but continuing...`);
              console.warn(`Statement: ${statement.substring(0, 100)}...`);
            } else {
              console.log(`✅ Statement ${i + 1} executed successfully`);
            }
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.warn(`⚠️  Statement ${i + 1} encountered an error, but continuing...`);
          console.warn(`Error: ${err.message}`);
          console.warn(`Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }

    // Verify the tables were created
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

    // Check if nominations table has new columns
    console.log('\n🔍 Verifying nominations table updates...');
    try {
      const { data, error } = await supabase
        .from('nominations')
        .select('loops_contact_id, loops_user_group, loops_sync_status')
        .limit(1);

      if (error) {
        console.log(`❌ Nominations table updates verification failed: ${error.message}`);
      } else {
        console.log(`✅ Nominations table has been updated with Loops sync fields`);
      }
    } catch (err) {
      console.log(`❌ Nominations table updates verification failed: ${err.message}`);
    }

    console.log('\n🎉 Separated Bulk Upload Schema application completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Test the separated bulk upload functionality in the admin panel');
    console.log('2. Download and use the person/company CSV templates');
    console.log('3. Verify Loops integration is working correctly');
    console.log('4. Check that draft nominations can be approved successfully');

  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Run the schema application
applySchema();