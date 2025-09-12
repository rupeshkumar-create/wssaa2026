const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking nominations table schema...');
  
  // Get a sample record to see the structure
  const { data: sample, error } = await supabase
    .from('nominations')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('❌ Error:', error.message);
    return;
  }
  
  if (sample && sample.length > 0) {
    console.log('✅ Sample nomination record:');
    console.log('Columns:', Object.keys(sample[0]));
    console.log('Sample data:', JSON.stringify(sample[0], null, 2));
  }
  
  // Search for Vineet by different approaches
  console.log('\n🔍 Searching for Vineet Bikram...');
  
  // Try searching by firstname/lastname if they exist as separate columns
  const { data: byName, error: nameError } = await supabase
    .from('nominations')
    .select('*')
    .or('firstname.ilike.%vineet%,lastname.ilike.%bikram%');
    
  if (byName && byName.length > 0) {
    console.log('✅ Found by name columns:', byName);
  } else if (nameError) {
    console.log('❌ Name search error:', nameError.message);
  }
  
  // Try searching all records and filter manually
  const { data: all, error: allError } = await supabase
    .from('nominations')
    .select('*')
    .limit(50);
    
  if (all && !allError) {
    console.log(`\n📊 Found ${all.length} total nominations`);
    const vineetNoms = all.filter(nom => {
      const str = JSON.stringify(nom).toLowerCase();
      return str.includes('vineet') || str.includes('bikram');
    });
    
    if (vineetNoms.length > 0) {
      console.log('✅ Found Vineet nominations:', vineetNoms);
    } else {
      console.log('❌ No Vineet nominations found in first 50 records');
    }
  }
}

checkSchema().catch(console.error);