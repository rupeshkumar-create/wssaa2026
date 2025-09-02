#!/usr/bin/env node

/**
 * Debug Specific HubSpot Sync Issue
 * 
 * This script investigates why specific contacts are not syncing to HubSpot
 * Nominator: lepsibidre@necub.com
 * Nominee: cihora9623@cavoyar.com
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

async function debugSpecificHubSpotSync() {
  console.log('🔍 Debugging Specific HubSpot Sync Issue...\n');

  const nominatorEmail = 'lepsibidre@necub.com';
  const nomineeEmail = 'cihora9623@cavoyar.com';

  try {
    // 1. Check if nominator exists in database
    console.log('1. Checking nominator in database...');
    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', nominatorEmail)
      .single();

    if (nominatorError) {
      console.log(`   ❌ Nominator not found: ${nominatorError.message}`);
    } else {
      console.log(`   ✅ Nominator found: ${nominator.id}`);
      console.log(`   📧 Email: ${nominator.email}`);
      console.log(`   👤 Name: ${nominator.firstname} ${nominator.lastname}`);
      console.log(`   🏢 Company: ${nominator.company || 'N/A'}`);
      console.log(`   📅 Created: ${nominator.created_at}`);
    }

    // 2. Check if nominee exists in database
    console.log('\n2. Checking nominee in database...');
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .select('*')
      .or(`person_email.eq.${nomineeEmail},company_email.eq.${nomineeEmail}`)
      .single();

    if (nomineeError) {
      console.log(`   ❌ Nominee not found: ${nomineeError.message}`);
    } else {
      console.log(`   ✅ Nominee found: ${nominee.id}`);
      console.log(`   📧 Email: ${nominee.person_email || nominee.company_email}`);
      console.log(`   👤 Type: ${nominee.type}`);
      if (nominee.type === 'person') {
        console.log(`   👤 Name: ${nominee.firstname} ${nominee.lastname}`);
      } else {
        console.log(`   🏢 Company: ${nominee.company_name}`);
      }
      console.log(`   📅 Created: ${nominee.created_at}`);
    }

    // 3. Check nominations linking them
    console.log('\n3. Checking nominations...');
    const { data: nominations, error: nominationsError } = await supabase
      .from('nominations')
      .select(`
        *,
        nominees!inner(*),
        nominators!inner(*)
      `)
      .or(`nominators.email.eq."${nominatorEmail}",nominees.person_email.eq."${nomineeEmail}",nominees.company_email.eq."${nomineeEmail}"`);

    if (nominationsError) {
      console.log(`   ❌ Nominations query error: ${nominationsError.message}`);
    } else {
      console.log(`   📋 Found ${nominations?.length || 0} nominations`);
      
      if (nominations && nominations.length > 0) {
        nominations.forEach((nom, index) => {
          console.log(`\n   Nomination ${index + 1}:`);
          console.log(`   - ID: ${nom.id}`);
          console.log(`   - State: ${nom.state}`);
          console.log(`   - Category: ${nom.subcategory_id}`);
          console.log(`   - Created: ${nom.created_at}`);
          console.log(`   - Approved: ${nom.approved_at || 'Not approved'}`);
          console.log(`   - Nominator: ${nom.nominators.email}`);
          console.log(`   - Nominee: ${nom.nominees.person_email || nom.nominees.company_email || 'No email'}`);
        });
      }
    }

    // 4. Check HubSpot outbox for sync attempts
    console.log('\n4. Checking HubSpot outbox...');
    const { data: outboxEntries, error: outboxError } = await supabase
      .from('hubspot_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (outboxError) {
      console.log(`   ❌ Outbox query error: ${outboxError.message}`);
    } else {
      console.log(`   📤 Found ${outboxEntries?.length || 0} recent outbox entries`);
      
      // Filter entries related to our contacts
      const relatedEntries = outboxEntries?.filter(entry => {
        const payload = entry.payload;
        return (
          payload?.nominator?.email === nominatorEmail ||
          payload?.nominee?.email === nomineeEmail ||
          payload?.nominee?.person_email === nomineeEmail ||
          payload?.nominee?.company_email === nomineeEmail ||
          JSON.stringify(payload).includes(nominatorEmail) ||
          JSON.stringify(payload).includes(nomineeEmail)
        );
      });

      if (relatedEntries && relatedEntries.length > 0) {
        console.log(`   🎯 Found ${relatedEntries.length} related outbox entries:`);
        relatedEntries.forEach((entry, index) => {
          console.log(`\n   Entry ${index + 1}:`);
          console.log(`   - Event: ${entry.event_type}`);
          console.log(`   - Created: ${entry.created_at}`);
          console.log(`   - Processed: ${entry.processed_at || 'Not processed'}`);
          console.log(`   - Error: ${entry.error_message || 'None'}`);
        });
      } else {
        console.log(`   ⚠️ No related outbox entries found`);
      }
    }

    // 5. Test HubSpot connection
    console.log('\n5. Testing HubSpot connection...');
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true';
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    console.log(`   🔧 HubSpot Sync Enabled: ${hubspotEnabled}`);
    console.log(`   🔑 HubSpot Token Present: ${hubspotToken ? 'Yes' : 'No'}`);
    
    if (hubspotEnabled && hubspotToken) {
      try {
        // Test HubSpot API connection
        const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
          headers: {
            'Authorization': `Bearer ${hubspotToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const accountInfo = await response.json();
          console.log(`   ✅ HubSpot API connection working`);
          console.log(`   🏢 Portal ID: ${accountInfo.portalId}`);
        } else {
          console.log(`   ❌ HubSpot API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.log(`   ❌ HubSpot connection error: ${error.message}`);
      }

      // 6. Test direct sync for nominator
      if (nominator) {
        console.log('\n6. Testing direct nominator sync...');
        try {
          const hubspotModule = await import('../src/server/hubspot/realtime-sync.ts');
          const { syncNominatorToHubSpot } = hubspotModule;
          
          const nominatorSyncData = {
            firstname: nominator.firstname,
            lastname: nominator.lastname,
            email: nominator.email,
            linkedin: nominator.linkedin,
            company: nominator.company,
            jobTitle: nominator.job_title,
            phone: nominator.phone,
            country: nominator.country,
          };

          console.log('   🔄 Attempting direct nominator sync...');
          const result = await syncNominatorToHubSpot(nominatorSyncData);
          
          if (result.success) {
            console.log(`   ✅ Direct nominator sync successful: ${result.contactId}`);
          } else {
            console.log(`   ❌ Direct nominator sync failed: ${result.error}`);
          }
        } catch (error) {
          console.log(`   ❌ Direct sync error: ${error.message}`);
        }
      }

      // 7. Test direct sync for nominee
      if (nominee && nominations && nominations.length > 0) {
        console.log('\n7. Testing direct nominee sync...');
        try {
          const hubspotModule = await import('../src/server/hubspot/realtime-sync.ts');
          const { syncNomineeToHubSpot } = hubspotModule;
          
          const nomination = nominations[0]; // Use first nomination
          
          const nomineeSyncData = {
            type: nominee.type,
            subcategoryId: nomination.subcategory_id,
            nominationId: nomination.id,
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

          console.log('   🔄 Attempting direct nominee sync...');
          const result = await syncNomineeToHubSpot(nomineeSyncData);
          
          if (result.success) {
            console.log(`   ✅ Direct nominee sync successful: ${result.contactId}`);
          } else {
            console.log(`   ❌ Direct nominee sync failed: ${result.error}`);
          }
        } catch (error) {
          console.log(`   ❌ Direct sync error: ${error.message}`);
        }
      }
    }

    // 8. Check server logs for sync attempts
    console.log('\n8. Recommendations...');
    console.log('   💡 To fix sync issues:');
    console.log('   1. Check if HubSpot custom properties exist');
    console.log('   2. Verify HubSpot token permissions');
    console.log('   3. Check server logs for sync errors');
    console.log('   4. Ensure real-time sync is enabled in APIs');
    console.log('   5. Process outbox entries manually if needed');

  } catch (error) {
    console.error('❌ Debug failed:', error);
    process.exit(1);
  }
}

// Run the debug
debugSpecificHubSpotSync();