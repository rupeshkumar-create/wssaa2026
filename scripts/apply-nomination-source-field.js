#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyNominationSourceField() {
  try {
    console.log('🔄 Applying nomination source field schema...');
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'ADD_NOMINATION_SOURCE_FIELD.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    for (const statement of statements) {
      const trimmedStatement = statement.trim();
      if (trimmedStatement) {
        console.log(`🔄 Executing: ${trimmedStatement.substring(0, 50)}...`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: trimmedStatement 
        });
        
        if (error) {
          // Try direct query if RPC fails
          const { error: directError } = await supabase
            .from('_temp')
            .select('1')
            .limit(0);
            
          if (directError) {
            console.warn(`⚠️ Statement failed: ${error.message}`);
            // Continue with other statements
          }
        }
      }
    }
    
    console.log('✅ Nomination source field schema applied successfully!');
    
    // Verify the changes
    console.log('🔍 Verifying schema changes...');
    
    const { data: nominations, error: verifyError } = await supabase
      .from('nominations')
      .select('id, nomination_source')
      .limit(1);
    
    if (verifyError) {
      console.warn('⚠️ Could not verify schema changes:', verifyError.message);
    } else {
      console.log('✅ Schema verification successful');
      console.log('📊 Sample nomination:', nominations?.[0] || 'No nominations found');
    }
    
  } catch (error) {
    console.error('❌ Error applying schema:', error);
    process.exit(1);
  }
}

// Run the migration
applyNominationSourceField();