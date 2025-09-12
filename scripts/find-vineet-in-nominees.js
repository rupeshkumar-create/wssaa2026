const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findVineetInNominees() {
  console.log('🔍 Checking nominees table...');
  
  // Get sample from nominees table
  const { data: sample, error } = await supabase
    .from('nominees')
    .select('*')
    .limit(1);
    
  if (error) {
    console.log('❌ Error accessing nominees table:', error.message);
  } else if (sample && sample.length > 0) {
    console.log('✅ Nominees table structure:');
    console.log('Columns:', Object.keys(sample[0]));
  }
  
  // Search for Vineet in nominees
  const { data: vineetNominees, error: vineetError } = await supabase
    .from('nominees')
    .select('*')
    .or('firstname.ilike.%vineet%,lastname.ilike.%bikram%,name.ilike.%vineet%');
    
  if (vineetError) {
    console.log('❌ Error searching nominees:', vineetError.message);
  } else if (vineetNominees && vineetNominees.length > 0) {
    console.log('✅ Found Vineet in nominees:', vineetNominees);
    
    // Now find the corresponding nominations
    for (const nominee of vineetNominees) {
      console.log(`\n🔍 Finding nominations for nominee ID: ${nominee.id}`);
      
      const { data: nominations, error: nomError } = await supabase
        .from('nominations')
        .select('*')
        .eq('nominee_id', nominee.id);
        
      if (nominations && nominations.length > 0) {
        console.log('✅ Found nominations:', nominations);
        
        // Check if any match the URL pattern
        nominations.forEach(nom => {
          console.log(`\nNomination ${nom.id}:`);
          console.log(`- Live URL: ${nom.live_url}`);
          console.log(`- Votes: ${nom.votes}`);
          console.log(`- Additional Votes: ${nom.additional_votes}`);
          console.log(`- Total: ${(nom.votes || 0) + (nom.additional_votes || 0)}`);
          console.log(`- State: ${nom.state}`);
          
          if (nom.live_url && nom.live_url.includes('06f21cbc-5553-4af5-ae72-1a35b4ad4232')) {
            console.log('🎯 THIS MATCHES THE URL FROM THE USER!');
          }
        });
      }
    }
  }
  
  // Also try to search all nominees for any containing vineet
  console.log('\n🔍 Searching all nominees for Vineet...');
  const { data: allNominees, error: allError } = await supabase
    .from('nominees')
    .select('*');
    
  if (allNominees && !allError) {
    const vineetMatches = allNominees.filter(nom => {
      const str = JSON.stringify(nom).toLowerCase();
      return str.includes('vineet') || str.includes('bikram');
    });
    
    console.log(`Found ${vineetMatches.length} nominees containing 'vineet' or 'bikram':`);
    vineetMatches.forEach(nom => {
      console.log(`- ${nom.id}: ${nom.firstname} ${nom.lastname} (${nom.name})`);
    });
  }
}

findVineetInNominees().catch(console.error);