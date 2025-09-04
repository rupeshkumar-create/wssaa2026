#!/usr/bin/env node

/**
 * Test nomination submission and watch server logs
 */

require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🧪 Testing nomination with server logs');
console.log('======================================');

async function testWithLogs() {
  const testEmail = 'login@danb.art';
  
  const nominationData = {
    type: 'person',
    categoryGroupId: 'individual-awards',
    subcategoryId: 'rising-star-under-30',
    nominator: {
      firstname: 'Daniel',
      lastname: 'Bartakovics',
      email: testEmail,
      linkedin: '',
      company: '',
      jobTitle: '',
      phone: '',
      country: ''
    },
    nominee: {
      firstname: 'Server',
      lastname: 'Log Test',
      email: 'serverlog.test@example.com',
      linkedin: 'https://linkedin.com/in/serverlogtest',
      jobtitle: 'Test Role',
      company: 'Test Company',
      country: 'United States',
      headshotUrl: 'https://example.com/headshot.jpg',
      whyMe: 'Server log test',
      bio: 'Server log test bio',
      achievements: 'Server log test achievements'
    }
  };

  console.log('🔄 Submitting nomination - check server console for detailed logs...');
  console.log('📧 Nominator email:', testEmail);
  console.log('');
  
  try {
    const submitResponse = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nominationData)
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Nomination submitted successfully!');
      console.log('');
      console.log('📊 Sync Results:');
      console.log(`- HubSpot Nominator Synced: ${result.hubspotSync?.nominatorSynced ? '✅' : '❌'}`);
      console.log(`- HubSpot Nominee Synced: ${result.hubspotSync?.nomineeSynced ? '✅' : '❌'}`);
      console.log(`- Loops Nominator Synced: ${result.loopsSync?.nominatorSynced ? '✅' : '❌'}`);
      console.log(`- Processing Time: ${result.processingTime}ms`);
      console.log('');
      
      if (result.hubspotSync?.nominatorSynced && result.loopsSync?.nominatorSynced) {
        console.log('🎉 SUCCESS: All sync working perfectly!');
      } else {
        console.log('⚠️ Check the server console above for detailed error messages');
        console.log('Look for lines starting with:');
        console.log('- "🔄 Syncing nominator to HubSpot"');
        console.log('- "🔄 Syncing nominator to Loops"');
        console.log('- "❌ Failed to sync nominator"');
      }
    } else {
      const errorText = await submitResponse.text();
      console.log(`❌ Nomination submission failed: ${submitResponse.status}`);
      console.log('Error:', errorText);
    }
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testWithLogs();