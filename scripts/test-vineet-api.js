const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testVineetAPI() {
  console.log('🔍 Testing Vineet Bikram API endpoint...');
  
  // Test the API endpoint directly
  try {
    const response = await fetch('http://localhost:3003/api/nominees/06f21cbc-5553-4af5-ae72-1a35b4ad4232');
    
    if (!response.ok) {
      console.log('❌ API response not OK:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n📊 Vote Information:');
      console.log('- API votes field:', data.data.votes);
      console.log('- Additional votes:', data.data.additionalVotes || data.data.additional_votes);
      console.log('- Nominee votes:', data.data.nominee?.votes);
    }
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testVineetAPI();