const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function findVineetNomination() {
  const vineetNomineeId = '5916ac19-ef1e-4b37-899a-7792985b6d83';
  
  console.log('🔍 Finding nomination for Vineet Bikram...');
  console.log('Nominee ID:', vineetNomineeId);
  
  // Get the nominee details
  const { data: nominee, error: nomineeError } = await supabase
    .from('nominees')
    .select('*')
    .eq('id', vineetNomineeId)
    .single();
    
  if (nomineeError) {
    console.log('❌ Error getting nominee:', nomineeError.message);
    return;
  }
  
  console.log('✅ Nominee details:', {
    id: nominee.id,
    name: `${nominee.firstname} ${nominee.lastname}`,
    type: nominee.type,
    live_url: nominee.live_url
  });
  
  // Find the nomination
  const { data: nominations, error: nomError } = await supabase
    .from('nominations')
    .select('*')
    .eq('nominee_id', vineetNomineeId);
    
  if (nomError) {
    console.log('❌ Error getting nominations:', nomError.message);
    return;
  }
  
  console.log(`\n✅ Found ${nominations.length} nominations for Vineet:`);
  
  nominations.forEach((nom, i) => {
    console.log(`\n${i+1}. Nomination ID: ${nom.id}`);
    console.log(`   Live URL: ${nom.live_url}`);
    console.log(`   Votes: ${nom.votes || 0}`);
    console.log(`   Additional Votes: ${nom.additional_votes || 0}`);
    console.log(`   Total Votes: ${(nom.votes || 0) + (nom.additional_votes || 0)}`);
    console.log(`   State: ${nom.state}`);
    console.log(`   Category: ${nom.subcategory_id}`);
    
    // Check if this matches the URL pattern from the user
    if (nom.live_url && nom.live_url.includes('06f21cbc-5553-4af5-ae72-1a35b4ad4232')) {
      console.log('   🎯 THIS MATCHES THE USER\'S URL!');
    }
    
    // Check if the nomination ID matches
    if (nom.id === '06f21cbc-5553-4af5-ae72-1a35b4ad4232') {
      console.log('   🎯 THIS IS THE NOMINATION ID FROM THE USER\'S URL!');
    }
  });
  
  // Also check if the user's ID is actually a nomination ID
  console.log('\n🔍 Checking if user ID is a nomination ID...');
  const { data: directNom, error: directError } = await supabase
    .from('nominations')
    .select('*, nominees(*)')
    .eq('id', '06f21cbc-5553-4af5-ae72-1a35b4ad4232')
    .single();
    
  if (directNom && !directError) {
    console.log('✅ Found nomination by direct ID match:');
    console.log('Nomination:', {
      id: directNom.id,
      nominee_name: `${directNom.nominees.firstname} ${directNom.nominees.lastname}`,
      votes: directNom.votes,
      additional_votes: directNom.additional_votes,
      total_votes: (directNom.votes || 0) + (directNom.additional_votes || 0),
      live_url: directNom.live_url,
      state: directNom.state
    });
  } else {
    console.log('❌ No direct nomination match:', directError?.message);
  }
}

findVineetNomination().catch(console.error);