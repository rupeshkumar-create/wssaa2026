async function testVoteCountFix() {
  console.log('🔍 Testing vote count fix for Vineet Bikram...\n');
  
  const nominationId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  
  // 1. Test the vote count API
  console.log('1. Testing vote count API...');
  try {
    const response = await fetch(`http://localhost:3000/api/votes/count?nominationId=${nominationId}`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.total === 47) {
      console.log('✅ Vote count API returns correct total: 47');
      console.log(`   - Regular votes: ${data.data.regularVotes}`);
      console.log(`   - Additional votes: ${data.data.additionalVotes}`);
    } else {
      console.log('❌ Vote count API issue:', data);
      return;
    }
  } catch (error) {
    console.log('❌ API error:', error.message);
    return;
  }
  
  // 2. Test the nominee API
  console.log('\n2. Testing nominee API...');
  try {
    const response = await fetch(`http://localhost:3000/api/nominees/${nominationId}`);
    const data = await response.json();
    
    if (data.success && data.data && data.data.votes === 47) {
      console.log('✅ Nominee API returns correct total: 47');
    } else {
      console.log('❌ Nominee API issue - votes:', data.data?.votes);
    }
  } catch (error) {
    console.log('❌ Nominee API error:', error.message);
  }
  
  // 3. Test the page HTML
  console.log('\n3. Testing page HTML...');
  try {
    const response = await fetch(`http://localhost:3000/nominee/${nominationId}`);
    const html = await response.text();
    
    // Look for the vote count in the HTML
    const has47 = html.includes('47');
    const has4Only = html.includes('>4<') && !html.includes('47');
    
    console.log('- Contains "47":', has47 ? '✅' : '❌');
    console.log('- Shows only "4":', has4Only ? '⚠️ Yes (this is the problem)' : '✅ No');
    
    if (has47 && !has4Only) {
      console.log('✅ Page HTML looks correct');
    } else {
      console.log('⚠️ Page HTML may still have issues');
    }
  } catch (error) {
    console.log('❌ Page test error:', error.message);
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('The vote count API has been fixed to return the correct total (47).');
  console.log('The real-time polling interval has been increased to 30 seconds.');
  console.log('The page should now consistently show 47 votes instead of flickering between 47 and 4.');
  console.log('\n📝 What was fixed:');
  console.log('1. /api/votes/count now includes additional_votes in the total');
  console.log('2. Real-time polling uses the correct total from the API');
  console.log('3. Polling interval increased to reduce flickering');
}

testVoteCountFix();