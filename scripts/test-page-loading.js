async function testPageLoading() {
  console.log('🔍 Testing page loading for Vineet Bikram...');
  
  // First test the API directly
  console.log('\n1. Testing API endpoint...');
  try {
    const apiResponse = await fetch('http://localhost:3000/api/nominees/06f21cbc-5553-4af5-ae72-1a35b4ad4232');
    const apiData = await apiResponse.json();
    
    if (apiData.success) {
      console.log('✅ API working correctly');
      console.log('- Vote count:', apiData.data.votes);
      console.log('- Name:', apiData.data.name);
    } else {
      console.log('❌ API error:', apiData.error);
      return;
    }
  } catch (error) {
    console.log('❌ API fetch error:', error.message);
    return;
  }
  
  // Test the page HTML
  console.log('\n2. Testing page HTML...');
  try {
    const pageResponse = await fetch('http://localhost:3000/nominee/06f21cbc-5553-4af5-ae72-1a35b4ad4232');
    const pageHtml = await pageResponse.text();
    
    // Check if it's showing loading state
    if (pageHtml.includes('skeleton') || pageHtml.includes('animate-pulse')) {
      console.log('⚠️ Page is showing loading skeleton');
    }
    
    // Check if it contains the nominee name
    if (pageHtml.includes('Vineet Bikram')) {
      console.log('✅ Page contains nominee name');
    } else {
      console.log('❌ Page does not contain nominee name');
    }
    
    // Check if it contains vote numbers
    const voteMatches = pageHtml.match(/\b(47|4|43)\b/g);
    if (voteMatches) {
      console.log('✅ Found vote-related numbers:', voteMatches);
    } else {
      console.log('❌ No vote numbers found in HTML');
    }
    
  } catch (error) {
    console.log('❌ Page fetch error:', error.message);
  }
  
  // Test if there are any console errors in the logs
  console.log('\n3. Check server logs for any errors...');
  console.log('(Check the terminal where npm run dev is running)');
}

testPageLoading();