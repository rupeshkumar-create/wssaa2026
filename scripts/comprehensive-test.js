async function comprehensiveTest() {
  console.log('🔍 Comprehensive test for Vineet Bikram vote count issue...\n');
  
  const nominationId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  
  // 1. Test database directly
  console.log('1. Testing database directly...');
  const { createClient } = require('@supabase/supabase-js');
  require('dotenv').config({ path: '.env.local' });
  
  const supabase = createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  const { data: nomination, error } = await supabase
    .from('nominations')
    .select('*, nominees(*)')
    .eq('id', nominationId)
    .single();
    
  if (error) {
    console.log('❌ Database error:', error.message);
    return;
  }
  
  console.log('✅ Database result:');
  console.log('- Regular votes:', nomination.votes);
  console.log('- Additional votes:', nomination.additional_votes);
  console.log('- Total should be:', (nomination.votes || 0) + (nomination.additional_votes || 0));
  console.log('- Nominee name:', nomination.nominees.firstname, nomination.nominees.lastname);
  
  // 2. Test API endpoint
  console.log('\n2. Testing API endpoint...');
  try {
    const apiResponse = await fetch(`http://localhost:3000/api/nominees/${nominationId}`);
    const apiData = await apiResponse.json();
    
    if (apiData.success) {
      console.log('✅ API result:');
      console.log('- API votes field:', apiData.data.votes);
      console.log('- API additionalVotes:', apiData.data.additionalVotes);
      console.log('- API name:', apiData.data.name);
    } else {
      console.log('❌ API error:', apiData.error);
    }
  } catch (error) {
    console.log('❌ API fetch error:', error.message);
  }
  
  // 3. Test vote count API
  console.log('\n3. Testing vote count API...');
  try {
    const voteResponse = await fetch(`http://localhost:3000/api/votes/count?nominationId=${nominationId}`);
    const voteData = await voteResponse.json();
    
    if (voteData.success) {
      console.log('✅ Vote count API result:');
      console.log('- Count:', voteData.data.count);
    } else {
      console.log('❌ Vote count API error:', voteData.error);
    }
  } catch (error) {
    console.log('❌ Vote count API fetch error:', error.message);
  }
  
  // 4. Check if there are any recent votes being added/removed
  console.log('\n4. Checking recent vote activity...');
  const { data: recentVotes } = await supabase
    .from('votes')
    .select('*')
    .eq('nomination_id', nominationId)
    .order('vote_timestamp', { ascending: false })
    .limit(5);
    
  console.log(`Recent votes (${recentVotes?.length || 0}):`);
  recentVotes?.forEach((vote, i) => {
    console.log(`  ${i+1}. ${vote.vote_timestamp} - Voter ID: ${vote.voter_id}`);
  });
  
  // 5. Summary
  console.log('\n📊 SUMMARY:');
  console.log('Expected total votes:', (nomination.votes || 0) + (nomination.additional_votes || 0));
  console.log('The issue is likely in the frontend display, not the data itself.');
  console.log('Check the browser console for client-side errors.');
}

comprehensiveTest().catch(console.error);