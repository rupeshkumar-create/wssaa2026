#!/usr/bin/env node

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function fixNominationSourceColumn() {
  console.log('🔧 Fixing nomination_source column...\n');

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Read the SQL fix
    const sqlFix = fs.readFileSync('FIX_NOMINATION_SOURCE_COLUMN.sql', 'utf8');
    
    console.log('Executing SQL fix...');
    console.log(sqlFix);

    // Execute the SQL fix using Supabase RPC
    console.log('Adding nomination_source column...');
    
    const { data: addColumnResult, error: addColumnError } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE nominations ADD COLUMN IF NOT EXISTS nomination_source TEXT DEFAULT 'public' CHECK (nomination_source IN ('public', 'admin'));`
    });

    if (addColumnError) {
      console.log('Column might already exist, trying direct approach...');
      
      // Try to update existing records first
      const { data: updateResult, error: updateError } = await supabase
        .from('nominations')
        .update({ nomination_source: 'public' })
        .is('nomination_source', null);

      if (updateError && !updateError.message.includes('column "nomination_source" of relation "nominations" does not exist')) {
        console.error('❌ Update failed:', updateError);
      } else {
        console.log('✅ Column handling completed');
      }
    } else {
      console.log('✅ Column added successfully');
    }

    // Verify the fix worked by trying to select from nominations
    console.log('\n🔍 Verifying the fix...');
    
    const { data: testData, error: testError } = await supabase
      .from('nominations')
      .select('id, nomination_source')
      .limit(1);

    if (testError) {
      console.error('❌ Verification failed:', testError);
    } else {
      console.log('✅ Column verification successful - can query nomination_source');
      if (testData && testData.length > 0) {
        console.log('Sample data:', testData[0]);
      }
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

// Run the fix
fixNominationSourceColumn().catch(console.error);