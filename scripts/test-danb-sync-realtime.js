#!/usr/bin/env node

/**
 * Test Real-time Sync for login@danb.art
 * 
 * This script simulates the nomination submission process to test
 * if the real-time sync is working properly.
 */

require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🧪 Testing Real-time Sync for login@danb.art');
console.log('==============================================');

async function testRealtimeSync() {
  const testNominatorData = {
    firstname: 'Daniel',
    lastname: 'Bartakovics',
    email: 'login@danb.art',
    linkedin: null,
    company: null,
    jobTitle: null,
    phone: null,
    country: null,
  };

  console.log('\n1. Testing HubSpot sync...');
  console.log('Configuration:');
  console.log(`- HUBSPOT_SYNC_ENABLED: ${process.env.HUBSPOT_SYNC_ENABLED}`);
  console.log(`- HUBSPOT_TOKEN exists: ${!!process.env.HUBSPOT_TOKEN}`);
  console.log(`- HUBSPOT_ACCESS_TOKEN exists: ${!!process.env.HUBSPOT_ACCESS_TOKEN}`);

  try {
    // Test HubSpot API directly
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    if (hubspotToken) {
      console.log('\n🔄 Testing HubSpot API connection...');
      
      const testResponse = await fetch('https://api.hubapi.com/contacts/v1/lists/all/contacts/all', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (testResponse.ok) {
        console.log('✅ HubSpot API connection successful');
        
        // Try to create/update contact
        console.log('🔄 Testing contact creation/update...');
        
        const contactData = {
          properties: {
            email: testNominatorData.email,
            firstname: testNominatorData.firstname,
            lastname: testNominatorData.lastname,
            wsa_nominator_2026: 'true'
          }
        };

        const createResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(contactData)
        });

        if (createResponse.ok) {
          const result = await createResponse.json();
          console.log(`✅ HubSpot contact created/updated: ${result.id}`);
        } else if (createResponse.status === 409) {
          console.log('ℹ️ Contact already exists, trying update...');
          
          // Try to update existing contact
          const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${testNominatorData.email}?idProperty=email`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${hubspotToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ properties: contactData.properties })
          });

          if (updateResponse.ok) {
            const result = await updateResponse.json();
            console.log(`✅ HubSpot contact updated: ${result.id}`);
          } else {
            const errorText = await updateResponse.text();
            console.log(`❌ HubSpot update failed: ${updateResponse.status} - ${errorText}`);
          }
        } else {
          const errorText = await createResponse.text();
          console.log(`❌ HubSpot create failed: ${createResponse.status} - ${errorText}`);
        }
      } else {
        const errorText = await testResponse.text();
        console.log(`❌ HubSpot API connection failed: ${testResponse.status} - ${errorText}`);
      }
    } else {
      console.log('❌ No HubSpot token found');
    }
  } catch (error) {
    console.error('❌ HubSpot test error:', error.message);
  }

  console.log('\n2. Testing Loops sync...');
  console.log('Configuration:');
  console.log(`- LOOPS_SYNC_ENABLED: ${process.env.LOOPS_SYNC_ENABLED}`);
  console.log(`- LOOPS_API_KEY exists: ${!!process.env.LOOPS_API_KEY}`);

  try {
    const loopsApiKey = process.env.LOOPS_API_KEY;
    
    if (loopsApiKey) {
      console.log('\n🔄 Testing Loops API connection...');
      
      const contactData = {
        email: testNominatorData.email,
        firstName: testNominatorData.firstname,
        lastName: testNominatorData.lastname,
        userGroup: 'Nominator 2026'
      };

      const loopsResponse = await fetch('https://app.loops.so/api/v1/contacts/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${loopsApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (loopsResponse.ok) {
        const result = await loopsResponse.json();
        console.log(`✅ Loops contact created/updated: ${result.id || 'success'}`);
      } else {
        const errorText = await loopsResponse.text();
        console.log(`❌ Loops API failed: ${loopsResponse.status} - ${errorText}`);
      }
    } else {
      console.log('❌ No Loops API key found');
    }
  } catch (error) {
    console.error('❌ Loops test error:', error.message);
  }

  console.log('\n3. Testing nomination submission API...');
  try {
    // Test the actual nomination submission endpoint
    const nominationData = {
      type: 'person',
      categoryGroupId: 'individual-awards',
      subcategoryId: 'rising-star-under-30',
      nominator: {
        firstname: 'Daniel',
        lastname: 'Bartakovics',
        email: 'login@danb.art',
        linkedin: '',
        company: '',
        jobTitle: '',
        phone: '',
        country: ''
      },
      nominee: {
        firstname: 'Test',
        lastname: 'Nominee',
        email: 'test.nominee@example.com',
        linkedin: 'https://linkedin.com/in/testnominee',
        jobtitle: 'Test Role',
        company: 'Test Company',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'Test nomination for sync testing',
        bio: 'Test bio',
        achievements: 'Test achievements'
      }
    };

    console.log('🔄 Submitting test nomination...');
    const submitResponse = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nominationData)
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Nomination submitted successfully');
      console.log('Sync results:', {
        hubspotNominatorSynced: result.hubspotSync?.nominatorSynced,
        hubspotNomineeSynced: result.hubspotSync?.nomineeSynced,
        loopsNominatorSynced: result.loopsSync?.nominatorSynced
      });
    } else {
      const errorText = await submitResponse.text();
      console.log(`❌ Nomination submission failed: ${submitResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Nomination submission test error:', error.message);
  }
}

console.log('\n🔧 Diagnostic Summary:');
console.log('======================');
console.log('This test will:');
console.log('1. Test HubSpot API connection and contact creation');
console.log('2. Test Loops API connection and contact creation');
console.log('3. Test the nomination submission API with sync');
console.log('4. Show you exactly where the sync is failing');

testRealtimeSync();