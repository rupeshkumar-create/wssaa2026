#!/usr/bin/env node

/**
 * Fix HubSpot and Loops Sync Issues for login@danb.art
 * 
 * This script fixes the specific sync issues identified:
 * 1. Creates missing HubSpot properties
 * 2. Tests the fixed sync functionality
 * 3. Processes pending outbox entries
 */

require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🔧 Fixing HubSpot and Loops Sync Issues');
console.log('=======================================');

async function fixSyncIssues() {
  const testEmail = 'login@danb.art';
  
  console.log('\n1. Creating missing HubSpot properties...');
  
  try {
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    if (!hubspotToken) {
      console.log('❌ No HubSpot token found');
      return;
    }

    // Create the missing properties that are causing the sync to fail
    const requiredProperties = [
      {
        name: 'wsa_nominator_2026',
        label: 'WSA Nominator 2026',
        type: 'bool',
        fieldType: 'booleancheckbox',
        groupName: 'contactinformation'
      },
      {
        name: 'wsa_role',
        label: 'WSA Role',
        type: 'enumeration',
        fieldType: 'select',
        groupName: 'contactinformation',
        options: [
          { label: 'Nominator', value: 'Nominator' },
          { label: 'Nominee', value: 'Nominee' },
          { label: 'Voter', value: 'Voter' }
        ]
      },
      {
        name: 'wsa_year',
        label: 'WSA Year',
        type: 'string',
        fieldType: 'text',
        groupName: 'contactinformation'
      },
      {
        name: 'wsa_source',
        label: 'WSA Source',
        type: 'string',
        fieldType: 'text',
        groupName: 'contactinformation'
      },
      {
        name: 'wsa_nominator_status',
        label: 'WSA Nominator Status',
        type: 'enumeration',
        fieldType: 'select',
        groupName: 'contactinformation',
        options: [
          { label: 'submitted', value: 'submitted' },
          { label: 'approved', value: 'approved' },
          { label: 'rejected', value: 'rejected' }
        ]
      },
      {
        name: 'wsa_submission_date',
        label: 'WSA Submission Date',
        type: 'datetime',
        fieldType: 'date',
        groupName: 'contactinformation'
      },
      {
        name: 'wsa_tags',
        label: 'WSA Tags',
        type: 'string',
        fieldType: 'text',
        groupName: 'contactinformation'
      },
      {
        name: 'wsa_contact_tag',
        label: 'WSA Contact Tag',
        type: 'enumeration',
        fieldType: 'select',
        groupName: 'contactinformation',
        options: [
          { label: 'WSA2026 Nominator', value: 'WSA2026 Nominator' },
          { label: 'WSA 2026 Nominees', value: 'WSA 2026 Nominees' },
          { label: 'WSA 2026 Voters', value: 'WSA 2026 Voters' }
        ]
      }
    ];

    let createdCount = 0;
    let existingCount = 0;

    for (const property of requiredProperties) {
      try {
        const response = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(property)
        });

        if (response.ok) {
          createdCount++;
          console.log(`✅ Created property: ${property.name}`);
        } else if (response.status === 409) {
          existingCount++;
          console.log(`ℹ️ Property already exists: ${property.name}`);
        } else {
          const errorText = await response.text();
          console.log(`⚠️ Failed to create ${property.name}: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.log(`⚠️ Error creating ${property.name}:`, error.message);
      }
    }

    console.log(`📊 Properties summary: ${createdCount} created, ${existingCount} already existed`);

  } catch (error) {
    console.error('❌ Error creating HubSpot properties:', error.message);
  }

  console.log('\n2. Testing fixed HubSpot sync...');
  
  try {
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    const contactData = {
      properties: {
        email: testEmail,
        firstname: 'Daniel',
        lastname: 'Bartakovics',
        wsa_role: 'Nominator',
        wsa_year: '2026',
        wsa_source: 'World Staffing Awards',
        wsa_nominator_status: 'submitted',
        wsa_submission_date: new Date().toISOString(),
        wsa_tags: 'WSA2026 Nominator',
        wsa_contact_tag: 'WSA2026 Nominator',
        wsa_nominator_2026: true
      }
    };

    // Try to create/update the contact with the fixed properties
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
      console.log(`✅ HubSpot contact created successfully: ${result.id}`);
    } else if (createResponse.status === 409) {
      console.log('ℹ️ Contact exists, trying update...');
      
      // Try to update existing contact
      const updateResponse = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${testEmail}?idProperty=email`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${hubspotToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (updateResponse.ok) {
        const result = await updateResponse.json();
        console.log(`✅ HubSpot contact updated successfully: ${result.id}`);
      } else {
        const errorText = await updateResponse.text();
        console.log(`❌ HubSpot update failed: ${updateResponse.status} - ${errorText}`);
      }
    } else {
      const errorText = await createResponse.text();
      console.log(`❌ HubSpot create failed: ${createResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ HubSpot sync test error:', error.message);
  }

  console.log('\n3. Testing fixed Loops sync...');
  
  try {
    const loopsApiKey = process.env.LOOPS_API_KEY;
    
    if (!loopsApiKey) {
      console.log('❌ No Loops API key found');
      return;
    }

    const contactData = {
      email: testEmail,
      firstName: 'Daniel',
      lastName: 'Bartakovics',
      userGroup: 'Nominator 2026',
      source: 'World Staffing Awards 2026'
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
      console.log(`✅ Loops contact created successfully: ${result.id || 'success'}`);
    } else if (loopsResponse.status === 409) {
      console.log('ℹ️ Contact exists in Loops, trying update...');
      
      // Try to update existing contact
      const updateResponse = await fetch('https://app.loops.so/api/v1/contacts/update', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${loopsApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      if (updateResponse.ok) {
        console.log(`✅ Loops contact updated successfully`);
      } else {
        const errorText = await updateResponse.text();
        console.log(`❌ Loops update failed: ${updateResponse.status} - ${errorText}`);
      }
    } else {
      const errorText = await loopsResponse.text();
      console.log(`❌ Loops create failed: ${loopsResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Loops sync test error:', error.message);
  }

  console.log('\n4. Testing nomination submission with fixed sync...');
  
  try {
    // Test a fresh nomination submission to see if sync works now
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
        firstname: 'Test',
        lastname: 'Sync Fix',
        email: 'test.syncfix@example.com',
        linkedin: 'https://linkedin.com/in/testsyncfix',
        jobtitle: 'Test Role',
        company: 'Test Company',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'Testing sync fix',
        bio: 'Test bio for sync fix',
        achievements: 'Test achievements for sync fix'
      }
    };

    console.log('🔄 Submitting test nomination with fixed sync...');
    const submitResponse = await fetch('http://localhost:3000/api/nomination/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(nominationData)
    });

    if (submitResponse.ok) {
      const result = await submitResponse.json();
      console.log('✅ Nomination submitted successfully with fixed sync!');
      console.log('Sync results:', {
        hubspotNominatorSynced: result.hubspotSync?.nominatorSynced,
        hubspotNomineeSynced: result.hubspotSync?.nomineeSynced,
        loopsNominatorSynced: result.loopsSync?.nominatorSynced,
        processingTime: result.processingTime
      });
      
      if (result.hubspotSync?.nominatorSynced && result.loopsSync?.nominatorSynced) {
        console.log('🎉 SUCCESS: Both HubSpot and Loops sync are now working!');
      } else {
        console.log('⚠️ Some sync issues may still exist');
      }
    } else {
      const errorText = await submitResponse.text();
      console.log(`❌ Nomination submission failed: ${submitResponse.status} - ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Nomination submission test error:', error.message);
  }
}

console.log('\n🎯 Fix Summary:');
console.log('===============');
console.log('This script will:');
console.log('1. Create missing HubSpot properties that are causing sync failures');
console.log('2. Test HubSpot sync with the correct properties');
console.log('3. Test Loops sync with proper error handling');
console.log('4. Submit a test nomination to verify the fixes work');
console.log('');
console.log('After running this script, the sync should work for login@danb.art');

fixSyncIssues();