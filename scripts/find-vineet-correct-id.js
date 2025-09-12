const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findVineet() {
  console.log('🔍 Searching for Vineet Bikram in database...');
  
  // Search by name
  const { data: nominations, error } = await supabase
    .from('nominations')
    .select('*')
    .or('nominee_data->>firstName.ilike.%vineet%,nominee_data->>name.ilike.%vineet%')
    .eq('status', 'approved');
    
  if (error) {
    console.log('❌ Error searching:', error.message);
    return;
  }
  
  console.log(`✅ Found ${nominations.length} nominations matching Vineet:`);
  
  nominations.forEach((nom, i) => {
    const nomineeData = nom.nominee_data;
    console.log(`\n${i+1}. Nomination ID: ${nom.id}`);
    console.log(`   Name: ${nomineeData?.firstName} ${nomineeData?.lastName} (${nomineeData?.name})`);
    console.log(`   Live URL: ${nom.live_url}`);
    console.log(`   Votes: ${nom.votes || 0}`);
    console.log(`   Additional Votes: ${nom.additional_votes || 0}`);
    console.log(`   Total: ${(nom.votes || 0) + (nom.additional_votes || 0)}`);
    console.log(`   Status: ${nom.status}`);
  });
  
  // Also check the URL from the user's request
  console.log('\n🔍 Checking the specific URL path...');
  const urlPath = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  
  // Check if this matches any live_url
  const { data: urlMatch, error: urlError } = await supabase
    .from('nominations')
    .select('*')
    .like('live_url', `%${urlPath}%`);
    
  if (urlMatch && urlMatch.length > 0) {
    console.log('✅ Found by URL match:', urlMatch[0]);
  } else {
    console.log('❌ No URL match found for:', urlPath);
  }
}

findVineet().catch(console.error);