async function testAPIEndpoint() {
  console.log('🔍 Testing API endpoint for Vineet Bikram...');
  
  const nominationId = '06f21cbc-5553-4af5-ae72-1a35b4ad4232';
  const url = `http://localhost:3000/api/nominees/${nominationId}`;
  
  try {
    console.log('📡 Calling:', url);
    
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
    
    console.log('📊 Response status:', response.status);
    
    if (!response.ok) {
      console.log('❌ Response not OK');
      const text = await response.text();
      console.log('Response text:', text);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API Response:');
    console.log('Success:', data.success);
    
    if (data.success && data.data) {
      console.log('\n📊 Vote Information:');
      console.log('- votes field:', data.data.votes);
      console.log('- nominee.votes:', data.data.nominee?.votes);
      console.log('- additionalVotes:', data.data.additionalVotes);
      console.log('- additional_votes:', data.data.additional_votes);
      
      console.log('\n👤 Nominee Info:');
      console.log('- ID:', data.data.id);
      console.log('- Name:', data.data.name || data.data.displayName);
      console.log('- Live URL:', data.data.liveUrl);
    } else {
      console.log('❌ API returned error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error calling API:', error.message);
  }
}

testAPIEndpoint();