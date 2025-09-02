#!/usr/bin/env node

/**
 * Manual HubSpot Sync Fix
 * 
 * This script manually processes pending outbox entries and syncs contacts to HubSpot
 */

// Load environment variables
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// HubSpot API functions
async function createHubSpotContact(properties) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
  
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ properties })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function searchHubSpotContact(email) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
  
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: 'email',
          operator: 'EQ',
          value: email
        }]
      }]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot search error: ${response.status} - ${error}`);
  }

  const result = await response.json();
  return result.results?.[0] || null;
}

async function updateHubSpotContact(contactId, properties) {
  const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
  
  const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${hubspotToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ properties })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot update error: ${response.status} - ${error}`);
  }

  return await response.json();
}

async function syncNominatorToHubSpot(nominatorData) {
  try {
    console.log(`🔄 Syncing nominator: ${nominatorData.email}`);

    // Check if contact exists
    let contact = await searchHubSpotContact(nominatorData.email);
    
    const properties = {
      email: nominatorData.email.toLowerCase(),
      firstname: nominatorData.firstname || '',
      lastname: nominatorData.lastname || '',
      lifecyclestage: 'lead',
      
      // WSA properties
      wsa_role: 'Nominator',
      wsa_year: '2026',
      wsa_source: 'World Staffing Awards',
      wsa_nominator_status: 'submitted',
      wsa_submission_date: new Date().toISOString(),
      wsa_contact_tag: 'WSA2026 Nominator',
      wsa_tags: 'WSA2026 Nominator',
    };

    // Add optional fields
    if (nominatorData.linkedin) {
      properties.linkedin = nominatorData.linkedin;
      properties.wsa_linkedin = nominatorData.linkedin;
    }
    
    if (nominatorData.company) {
      properties.company = nominatorData.company;
      properties.wsa_company = nominatorData.company;
    }
    
    if (nominatorData.jobTitle) {
      properties.jobtitle = nominatorData.jobTitle;
      properties.wsa_job_title = nominatorData.jobTitle;
    }
    
    if (nominatorData.phone) {
      properties.phone = nominatorData.phone;
      properties.wsa_phone = nominatorData.phone;
    }
    
    if (nominatorData.country) {
      properties.country = nominatorData.country;
      properties.wsa_country = nominatorData.country;
    }

    if (contact) {
      // Update existing contact
      contact = await updateHubSpotContact(contact.id, properties);
      console.log(`   ✅ Updated existing contact: ${contact.id}`);
    } else {
      // Create new contact
      contact = await createHubSpotContact(properties);
      console.log(`   ✅ Created new contact: ${contact.id}`);
    }

    return { success: true, contactId: contact.id };
  } catch (error) {
    console.log(`   ❌ Failed to sync nominator: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function syncNomineeToHubSpot(nomineeData) {
  try {
    const email = nomineeData.email || nomineeData.companyEmail;
    if (!email) {
      throw new Error('No email provided for nominee');
    }

    console.log(`🔄 Syncing nominee: ${email}`);

    // Check if contact exists
    let contact = await searchHubSpotContact(email);
    
    const properties = {
      email: email.toLowerCase(),
      firstname: nomineeData.firstname || 'Company',
      lastname: nomineeData.lastname || nomineeData.companyName || 'Nominee',
      
      // WSA properties
      wsa_role: nomineeData.type === 'person' ? 'Nominee_Person' : 'Nominee_Company',
      wsa_year: '2026',
      wsa_source: 'World Staffing Awards',
      wsa_nominee_type: nomineeData.type,
      wsa_nominee_status: 'approved',
      wsa_approval_date: new Date().toISOString(),
      wsa_category: nomineeData.subcategoryId,
      wsa_nomination_id: nomineeData.nominationId,
      wsa_contact_tag: 'WSA 2026 Nominees',
      wsa_tags: 'WSA 2026 Nominees',
    };

    // Add type-specific fields
    if (nomineeData.type === 'person') {
      if (nomineeData.linkedin) {
        properties.linkedin = nomineeData.linkedin;
        properties.wsa_linkedin = nomineeData.linkedin;
      }
      
      if (nomineeData.jobtitle) {
        properties.jobtitle = nomineeData.jobtitle;
        properties.wsa_job_title = nomineeData.jobtitle;
      }
      
      if (nomineeData.company) {
        properties.company = nomineeData.company;
        properties.wsa_company = nomineeData.company;
      }
      
      if (nomineeData.phone) {
        properties.phone = nomineeData.phone;
        properties.wsa_phone = nomineeData.phone;
      }
      
      if (nomineeData.country) {
        properties.country = nomineeData.country;
        properties.wsa_country = nomineeData.country;
      }
    } else {
      // Company nominee
      properties.wsa_company_name = nomineeData.companyName;
      
      if (nomineeData.companyWebsite) {
        properties.website = nomineeData.companyWebsite;
        properties.wsa_website = nomineeData.companyWebsite;
      }
      
      if (nomineeData.companyLinkedin) {
        properties.wsa_linkedin = nomineeData.companyLinkedin;
      }
      
      if (nomineeData.companyPhone) {
        properties.phone = nomineeData.companyPhone;
        properties.wsa_phone = nomineeData.companyPhone;
      }
      
      if (nomineeData.companyCountry) {
        properties.country = nomineeData.companyCountry;
        properties.wsa_country = nomineeData.companyCountry;
      }
      
      if (nomineeData.companyIndustry) {
        properties.wsa_industry = nomineeData.companyIndustry;
      }
      
      if (nomineeData.companySize) {
        properties.wsa_company_size = nomineeData.companySize;
      }
    }

    if (contact) {
      // Update existing contact
      contact = await updateHubSpotContact(contact.id, properties);
      console.log(`   ✅ Updated existing contact: ${contact.id}`);
    } else {
      // Create new contact
      contact = await createHubSpotContact(properties);
      console.log(`   ✅ Created new contact: ${contact.id}`);
    }

    return { success: true, contactId: contact.id };
  } catch (error) {
    console.log(`   ❌ Failed to sync nominee: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function syncVoterToHubSpot(voterData) {
  try {
    console.log(`🔄 Syncing voter: ${voterData.email}`);

    // Check if contact exists
    let contact = await searchHubSpotContact(voterData.email);
    
    const properties = {
      email: voterData.email.toLowerCase(),
      firstname: voterData.firstname || '',
      lastname: voterData.lastname || '',
      lifecyclestage: 'lead',
      
      // WSA properties
      wsa_role: 'Voter',
      wsa_year: '2026',
      wsa_source: 'World Staffing Awards',
      wsa_voter_status: 'active',
      wsa_last_vote_date: new Date().toISOString(),
      wsa_voted_for: voterData.votedFor,
      wsa_vote_category: voterData.subcategoryId,
      wsa_contact_tag: 'WSA 2026 Voters',
      wsa_tags: 'WSA 2026 Voters',
    };

    // Add optional fields
    if (voterData.linkedin) {
      properties.linkedin = voterData.linkedin;
      properties.wsa_linkedin = voterData.linkedin;
    }
    
    if (voterData.company) {
      properties.company = voterData.company;
      properties.wsa_company = voterData.company;
    }
    
    if (voterData.jobTitle) {
      properties.jobtitle = voterData.jobTitle;
      properties.wsa_job_title = voterData.jobTitle;
    }
    
    if (voterData.country) {
      properties.country = voterData.country;
      properties.wsa_country = voterData.country;
    }

    if (contact) {
      // Update existing contact
      contact = await updateHubSpotContact(contact.id, properties);
      console.log(`   ✅ Updated existing contact: ${contact.id}`);
    } else {
      // Create new contact
      contact = await createHubSpotContact(properties);
      console.log(`   ✅ Created new contact: ${contact.id}`);
    }

    return { success: true, contactId: contact.id };
  } catch (error) {
    console.log(`   ❌ Failed to sync voter: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function manualHubSpotSyncFix() {
  console.log('🔧 Manual HubSpot Sync Fix...\n');

  try {
    // 1. Get unprocessed outbox entries
    console.log('1. Getting unprocessed outbox entries...');
    const { data: outboxEntries, error: outboxError } = await supabase
      .from('hubspot_outbox')
      .select('*')
      .neq('status', 'processed')
      .order('created_at', { ascending: true });

    if (outboxError) {
      throw new Error(`Outbox query error: ${outboxError.message}`);
    }

    console.log(`   📤 Found ${outboxEntries?.length || 0} unprocessed entries`);

    if (!outboxEntries || outboxEntries.length === 0) {
      console.log('   ✅ No entries to process');
      return;
    }

    // 2. Process each entry
    for (const entry of outboxEntries) {
      console.log(`\n2. Processing entry: ${entry.event_type} (${entry.id})`);
      
      try {
        let syncResult = { success: false, error: 'Unknown event type' };

        if (entry.event_type === 'nomination_submitted') {
          // Sync nominator
          const nominatorData = {
            firstname: entry.payload.nominator.firstname,
            lastname: entry.payload.nominator.lastname,
            email: entry.payload.nominator.email,
            linkedin: entry.payload.nominator.linkedin,
            company: entry.payload.nominator.company,
            jobTitle: entry.payload.nominator.jobTitle,
            phone: entry.payload.nominator.phone,
            country: entry.payload.nominator.country,
          };

          syncResult = await syncNominatorToHubSpot(nominatorData);
        } 
        else if (entry.event_type === 'vote_cast') {
          // Sync voter
          const voterData = {
            firstname: entry.payload.voter.firstname,
            lastname: entry.payload.voter.lastname,
            email: entry.payload.voter.email,
            linkedin: entry.payload.voter.linkedin,
            company: entry.payload.voter.company,
            jobTitle: entry.payload.voter.job_title,
            country: entry.payload.voter.country,
            votedFor: entry.payload.votedForDisplayName,
            subcategoryId: entry.payload.subcategoryId,
          };

          syncResult = await syncVoterToHubSpot(voterData);
        }
        else if (entry.event_type === 'nomination_approved') {
          // Sync nominee
          const nominee = entry.payload.nominee;
          const nomineeData = {
            type: entry.payload.type,
            subcategoryId: entry.payload.subcategoryId,
            nominationId: entry.payload.nominationId,
            // Person fields
            firstname: nominee.firstname,
            lastname: nominee.lastname,
            email: nominee.person_email,
            linkedin: nominee.person_linkedin,
            jobtitle: nominee.jobtitle,
            company: nominee.person_company,
            phone: nominee.person_phone,
            country: nominee.person_country,
            // Company fields
            companyName: nominee.company_name,
            companyWebsite: nominee.company_website,
            companyLinkedin: nominee.company_linkedin,
            companyEmail: nominee.company_email,
            companyPhone: nominee.company_phone,
            companyCountry: nominee.company_country,
            companyIndustry: nominee.company_industry,
            companySize: nominee.company_size,
          };

          syncResult = await syncNomineeToHubSpot(nomineeData);
        }

        // Update outbox entry
        const updateData = {
          updated_at: new Date().toISOString(),
        };

        if (syncResult.success) {
          updateData.status = 'processed';
          console.log(`   ✅ Sync successful: ${syncResult.contactId}`);
        } else {
          updateData.status = 'failed';
          updateData.last_error = syncResult.error;
          console.log(`   ❌ Sync failed: ${syncResult.error}`);
        }

        await supabase
          .from('hubspot_outbox')
          .update(updateData)
          .eq('id', entry.id);

      } catch (error) {
        console.log(`   ❌ Processing error: ${error.message}`);
        
        // Mark as failed with error
        await supabase
          .from('hubspot_outbox')
          .update({
            status: 'failed',
            last_error: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', entry.id);
      }
    }

    console.log('\n✅ Manual sync fix completed!');

  } catch (error) {
    console.error('❌ Manual sync fix failed:', error);
    process.exit(1);
  }
}

// Run the fix
manualHubSpotSyncFix();