const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('🔍 Checking nominations table schema...\n');
    
    // Get table structure using raw SQL
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'nominations' 
        ORDER BY ordinal_position;
      `
    });
    
    if (error) {
      console.log('❌ Error checking schema:', error.message);
      
      // Try alternative method
      const { data: sample, error: sampleError } = await supabase
        .from('nominations')
        .select('*')
        .limit(1);
      
      if (sampleError) {
        console.log('❌ Error getting sample:', sampleError.message);
      } else {
        console.log('✅ Sample nomination structure:');
        if (sample && sample.length > 0) {
          console.log('Columns:', Object.keys(sample[0]));
        } else {
          console.log('No nominations found');
        }
      }
    } else {
      console.log('✅ Nominations table columns:');
      data?.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error);
  }
}

checkSchema();