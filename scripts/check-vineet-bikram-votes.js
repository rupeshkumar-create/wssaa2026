const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkNominee() {
  console.log('🔍 Checking nominee with ID: 06f21cbc-5553-4af5-ae72-1a35b4ad4232');
  
  // Check if this is a nomination ID or live URL slug
  const { data: nomination, error } = await supabase
    .from('nominations')
    .select('*')
    .eq('id', '06f21cbc-5553-4af5-ae72-1a35b4ad4232')
    .single();
    
  if (error) {
    console.log('❌ Error finding nomination by ID:', error.message);
    
    // Try finding by live_url slug
    const { data: nominationByUrl, error: urlError } = await supabase
      .from('nominations')
      .select('*')
      .eq('live_url', '/nominee/06f21cbc-5553-4af5-ae72-1a35b4ad4232')
      .single();
      
    if (urlError) {
      console.log('❌ Error finding nomination by URL:', urlError.message);
      
      // Try searching for Vineet Bikram by name
      const { data: vineetNominations, error: nameError } = await supabase
        .from('nominations')
        .select('*')
        .ilike('firstname', '%vineet%')
        .ilike('lastname', '%bikram%');
        
      if (nameError) {
        console.log('❌ Error searching by name:', nameError.message);
        return;
      }
      
      console.log('🔍 Found nominations matching Vineet Bikram:', vineetNominations);
      return;
    }
    
    console.log('✅ Found nomination by URL:', nominationByUrl);
    return;
  }
  
  console.log('✅ Found nomination:', {
    id: nomination.id,
    name: nomination.type === 'person' ? `${nomination.firstname} ${nomination.lastname}` : nomination.company_name,
    votes: nomination.votes,
    additional_votes: nomination.additional_votes,
    total_votes: (nomination.votes || 0) + (nomination.additional_votes || 0),
    live_url: nomination.live_url,
    approved: nomination.approved
  });
  
  // Check recent votes for this nomination
  const { data: recentVotes, error: votesError } = await supabase
    .from('votes')
    .select('*, voters(email, firstname, lastname)')
    .eq('nomination_id', nomination.id)
    .order('vote_timestamp', { ascending: false })
    .limit(10);
    
  if (votesError) {
    console.log('❌ Error fetching votes:', votesError.message);
  } else {
    console.log(`📊 Recent votes (${recentVotes.length}):`);
    recentVotes.forEach((vote, i) => {
      console.log(`  ${i+1}. ${vote.voters?.firstname} ${vote.voters?.lastname} (${vote.voters?.email}) - ${vote.vote_timestamp}`);
    });
  }
  
  // Check for any database triggers that might be affecting vote counts
  console.log('\n🔍 Checking database triggers...');
  const { data: triggers, error: triggerError } = await supabase
    .rpc('get_triggers_info');
    
  if (triggerError) {
    console.log('❌ Could not fetch trigger info:', triggerError.message);
  }
}

checkNominee().catch(console.error);