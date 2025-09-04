const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugBulkUpload() {
  try {
    console.log('🔍 Debugging bulk upload issue...\n');
    
    // Check nominations table structure
    const { data, error } = await supabase
      .from('nominations')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Error checking nominations table:', error.message);
      return;
    }
    
    console.log('✅ Nominations table exists and accessible');
    
    // Check if we have any draft nominations
    const { data: drafts, error: draftError } = await supabase
      .from('nominations')
      .select('id, state, upload_source, bulk_upload_batch_id, type, category')
      .eq('state', 'draft')
      .eq('upload_source', 'separated_bulk_upload');
    
    if (draftError) {
      console.log('❌ Error checking draft nominations:', draftError.message);
    } else {
      console.log(`📝 Draft nominations from bulk upload: ${drafts?.length || 0}`);
      if (drafts && drafts.length > 0) {
        console.log('Draft nominations:', drafts.slice(0, 3));
      }
    }
    
    // Check bulk upload batches
    const { data: batches, error: batchError } = await supabase
      .from('separated_bulk_upload_batches')
      .select('*')
      .order('uploaded_at', { ascending: false })
      .limit(5);
    
    if (batchError) {
      console.log('❌ Error checking batches:', batchError.message);
    } else {
      console.log('\n📊 Recent batches:');
      batches?.forEach(b => {
        console.log(`  - ${b.filename} (${b.upload_type}): ${b.successful_rows}/${b.total_rows} successful, ${b.failed_rows} failed, ${b.draft_rows} drafts - Status: ${b.status}`);
      });
    }
    
    // Check errors for latest batch
    if (batches && batches.length > 0) {
      const latestBatch = batches[0];
      console.log(`\n🔍 Checking errors for latest batch: ${latestBatch.filename}`);
      
      const { data: errors, error: errorError } = await supabase
        .from('separated_bulk_upload_errors')
        .select('*')
        .eq('batch_id', latestBatch.id)
        .limit(10);
      
      if (errorError) {
        console.log('❌ Error checking batch errors:', errorError.message);
      } else {
        console.log(`📋 Errors found: ${errors?.length || 0}`);
        errors?.forEach(e => {
          console.log(`  Row ${e.row_number}: ${e.field_name} - ${e.error_message}`);
        });
      }
    }
    
    // Check if tables exist
    console.log('\n🔍 Checking table existence...');
    
    const tables = ['separated_bulk_upload_batches', 'separated_bulk_upload_errors', 'loops_user_groups'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: exists and accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugBulkUpload();