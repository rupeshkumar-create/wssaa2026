#!/usr/bin/env node

/**
 * Create the missing wsa_nominator_2026 property in HubSpot
 */

require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🔧 Creating missing HubSpot property: wsa_nominator_2026');
console.log('====================================================');

async function createMissingProperty() {
  try {
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    if (!hubspotToken) {
      console.log('❌ No HubSpot token found');
      return;
    }

    // Create the boolean property correctly
    const property = {
      name: 'wsa_nominator_2026',
      label: 'WSA Nominator 2026',
      type: 'bool',
      fieldType: 'booleancheckbox',
      groupName: 'contactinformation',
      description: 'Indicates if this contact is a nominator for World Staffing Awards 2026'
    };

    console.log('🔄 Creating boolean property...');
    const response = await fetch('https://api.hubapi.com/crm/v3/properties/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${hubspotToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(property)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Created property successfully: ${result.name}`);
      console.log(`Property details:`, {
        name: result.name,
        label: result.label,
        type: result.type,
        fieldType: result.fieldType
      });
    } else if (response.status === 409) {
      console.log('ℹ️ Property already exists');
    } else {
      const errorText = await response.text();
      console.log(`❌ Failed to create property: ${response.status}`);
      console.log('Error details:', errorText);
    }

    // Now test the property by updating the contact
    console.log('\n🧪 Testing the property...');
    
    const testEmail = 'login@danb.art';
    const contactData = {
      properties: {
        wsa_nominator_2026: 'true' // Use string 'true' for boolean properties
      }
    };

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
      console.log(`✅ Property test successful - contact updated: ${result.id}`);
    } else {
      const errorText = await updateResponse.text();
      console.log(`❌ Property test failed: ${updateResponse.status} - ${errorText}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createMissingProperty();