#!/usr/bin/env node

/**
 * Debug HubSpot and Loops Sync Issue for login@danb.art
 * 
 * This script tests the sync functionality for the specific nominator email
 * that your boss tested with to identify why it's not syncing properly.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: ['.env.local', '.env'] });

console.log('🔍 Debugging HubSpot and Loops Sync for login@danb.art');
console.log('======================================================');

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugSyncIssue() {
  const testEmail = 'login@danb.art';
  
  try {
    // 1. Check if nominator exists in database
    console.log('\n1. Checking nominator in database...');
    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .select('*')
      .eq('email', testEmail.toLowerCase())
      .single();

    if (nominatorError) {
      console.log('❌ Nominator not found in database:', nominatorError.message);
      return;
    }

    console.log('✅ Nominator found:', {
      id: nominator.id,
      email: nominator.email,
      firstname: nominator.firstname,
      lastname: nominator.lastname,
      company: nominator.company,
      created_at: nominator.created_at
    });

    // 2. Check nominations by this nominator
    console.log('\n2. Checking nominations by this nominator...');
    const { data: nominations, error: nominationsError } = await supabase
      .from('nominations')
      .select(`
        id,
        state,
        subcategory_id,
        created_at,
        nominees (
          id,
          type,
          firstname,
          lastname,
          company_name
        )
      `)
      .eq('nominator_id', nominator.id)
      .order('created_at', { ascending: false });

    if (nominationsError) {
      console.log('❌ Error fetching nominations:', nominationsError.message);
    } else {
      console.log(`✅ Found ${nominations.length} nominations:`);
      nominations.forEach((nom, index) => {
        console.log(`  ${index + 1}. ID: ${nom.id}, State: ${nom.state}, Category: ${nom.subcategory_id}`);
        console.log(`     Nominee: ${nom.nominees.firstname || nom.nominees.company_name} (${nom.nominees.type})`);
        console.log(`     Created: ${nom.created_at}`);
      });
    }

    // 3. Check HubSpot outbox entries
    console.log('\n3. Checking HubSpot outbox entries...');
    const { data: hubspotOutbox, error: hubspotOutboxError } = await supabase
      .from('hubspot_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (hubspotOutboxError) {
      console.log('❌ Error fetching HubSpot outbox:', hubspotOutboxError.message);
    } else {
      console.log(`✅ Found ${hubspotOutbox.length} HubSpot outbox entries (recent 10):`);
      hubspotOutbox.forEach((entry, index) => {
        const payload = entry.payload || {};
        const nominatorEmail = payload.nominator?.email || 'unknown';
        console.log(`  ${index + 1}. Event: ${entry.event_type}, Status: ${entry.status || 'pending'}`);
        console.log(`     Nominator: ${nominatorEmail}, Created: ${entry.created_at}`);
        if (nominatorEmail === testEmail) {
          console.log(`     🎯 MATCH FOUND for ${testEmail}!`);
        }
      });
    }

    // 4. Check Loops outbox entries
    console.log('\n4. Checking Loops outbox entries...');
    const { data: loopsOutbox, error: loopsOutboxError } = await supabase
      .from('loops_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (loopsOutboxError) {
      console.log('❌ Error fetching Loops outbox (table might not exist):', loopsOutboxError.message);
    } else {
      console.log(`✅ Found ${loopsOutbox.length} Loops outbox entries (recent 10):`);
      loopsOutbox.forEach((entry, index) => {
        const payload = entry.payload || {};
        const nominatorEmail = payload.nominator?.email || 'unknown';
        console.log(`  ${index + 1}. Event: ${entry.event_type}, Status: ${entry.status || 'pending'}`);
        console.log(`     Nominator: ${nominatorEmail}, Created: ${entry.created_at}`);
        if (nominatorEmail === testEmail) {
          console.log(`     🎯 MATCH FOUND for ${testEmail}!`);
        }
      });
    }

    // 5. Check environment variables
    console.log('\n5. Checking sync configuration...');
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true';
    const hubspotToken = !!(process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN);
    const loopsEnabled = process.env.LOOPS_SYNC_ENABLED === 'true';
    const loopsToken = !!process.env.LOOPS_API_KEY;

    console.log(`HubSpot sync enabled: ${hubspotEnabled}`);
    console.log(`HubSpot token configured: ${hubspotToken}`);
    console.log(`Loops sync enabled: ${loopsEnabled}`);
    console.log(`Loops token configured: ${loopsToken}`);

    // 6. Test HubSpot sync function directly
    if (hubspotEnabled && hubspotToken) {
      console.log('\n6. Testing HubSpot sync function...');
      try {
        // Dynamic import to test the sync function
        const hubspotModule = await import('../src/server/hubspot/realtime-sync.js').catch(importError => {
          console.warn('Failed to import HubSpot sync module:', importError.message);
          return null;
        });

        if (hubspotModule) {
          const { syncNominatorToHubSpot } = hubspotModule;
          
          const testNominatorData = {
            firstname: nominator.firstname,
            lastname: nominator.lastname,
            email: nominator.email,
            linkedin: nominator.linkedin,
            company: nominator.company,
            jobTitle: nominator.job_title,
            phone: nominator.phone,
            country: nominator.country,
          };

          console.log('🔄 Testing HubSpot sync with data:', testNominatorData);
          const syncResult = await syncNominatorToHubSpot(testNominatorData).catch(syncError => {
            console.error('HubSpot sync test failed:', syncError.message);
            return { success: false, error: syncError.message };
          });

          if (syncResult.success) {
            console.log(`✅ HubSpot sync test successful: ${syncResult.contactId}`);
          } else {
            console.log(`❌ HubSpot sync test failed: ${syncResult.error}`);
          }
        } else {
          console.log('❌ HubSpot sync module not available');
        }
      } catch (error) {
        console.error('❌ Error testing HubSpot sync:', error.message);
      }
    } else {
      console.log('⚠️ HubSpot sync not enabled or configured');
    }

    // 7. Test Loops sync function directly
    if (loopsEnabled && loopsToken) {
      console.log('\n7. Testing Loops sync function...');
      try {
        // Dynamic import to test the sync function
        const loopsModule = await import('../src/server/loops/realtime-sync.js').catch(importError => {
          console.warn('Failed to import Loops sync module:', importError.message);
          return null;
        });

        if (loopsModule) {
          const { syncNominatorToLoops } = loopsModule;
          
          const testNominatorData = {
            firstname: nominator.firstname,
            lastname: nominator.lastname,
            email: nominator.email,
            linkedin: nominator.linkedin,
            company: nominator.company,
            jobTitle: nominator.job_title,
            phone: nominator.phone,
            country: nominator.country,
          };

          console.log('🔄 Testing Loops sync with data:', testNominatorData);
          const syncResult = await syncNominatorToLoops(testNominatorData).catch(syncError => {
            console.error('Loops sync test failed:', syncError.message);
            return { success: false, error: syncError.message };
          });

          if (syncResult.success) {
            console.log(`✅ Loops sync test successful: ${syncResult.contactId}`);
          } else {
            console.log(`❌ Loops sync test failed: ${syncResult.error}`);
          }
        } else {
          console.log('❌ Loops sync module not available');
        }
      } catch (error) {
        console.error('❌ Error testing Loops sync:', error.message);
      }
    } else {
      console.log('⚠️ Loops sync not enabled or configured');
    }

  } catch (error) {
    console.error('❌ Debug script error:', error.message);
  }
}

// 8. Check recent API logs
console.log('\n8. Recommendations for debugging:');
console.log('================================');
console.log('1. Check the dev server console logs when a nomination is submitted');
console.log('2. Look for HubSpot and Loops sync success/failure messages');
console.log('3. Verify API keys are correctly set in .env file');
console.log('4. Check if the sync functions are being called during nomination submission');
console.log('5. Test the nomination submission API directly');

console.log('\n🔧 Quick fixes to try:');
console.log('======================');
console.log('1. Restart the dev server to reload environment variables');
console.log('2. Check .env file for HUBSPOT_SYNC_ENABLED=true and LOOPS_SYNC_ENABLED=true');
console.log('3. Verify HUBSPOT_ACCESS_TOKEN and LOOPS_API_KEY are set');
console.log('4. Test with a fresh nomination submission');

// Run the debug
debugSyncIssue();