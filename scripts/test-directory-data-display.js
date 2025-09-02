#!/usr/bin/env node

/**
 * Test Directory Data Display
 * 
 * This script tests that the directory is showing all nominees correctly
 * and verifies the HubSpot sync functionality for nominees, nominators, and voters.
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

async function testDirectoryDataDisplay() {
  console.log('🔍 Testing Directory Data Display...\n');

  try {
    // 1. Test the nominees API endpoint directly
    console.log('1. Testing /api/nominees endpoint...');
    
    const response = await fetch('http://localhost:3000/api/nominees', {
      headers: {
        'Cache-Control': 'no-cache',
      },
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const apiResult = await response.json();
    console.log(`   ✅ API Response: ${apiResult.success ? 'Success' : 'Failed'}`);
    console.log(`   📊 Data count: ${apiResult.data?.length || 0} nominees`);
    console.log(`   💬 Message: ${apiResult.message || 'No message'}`);
    
    if (apiResult.data && apiResult.data.length > 0) {
      console.log('\n   📋 Sample nominee data:');
      const sample = apiResult.data[0];
      console.log(`   - ID: ${sample.id}`);
      console.log(`   - Name: ${sample.name || sample.displayName}`);
      console.log(`   - Category: ${sample.category}`);
      console.log(`   - Type: ${sample.type}`);
      console.log(`   - Votes: ${sample.votes}`);
      console.log(`   - Status: ${sample.status}`);
      console.log(`   - Image URL: ${sample.imageUrl || 'None'}`);
      console.log(`   - Live URL: ${sample.liveUrl || 'None'}`);
    }

    // 2. Test database query directly
    console.log('\n2. Testing direct database query...');
    
    const { data: dbNominees, error: dbError } = await supabase
      .from('nominations')
      .select('*')
      .eq('state', 'approved')  // Use 'state' instead of 'status'
      .order('additional_votes', { ascending: false })
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error(`   ❌ Database error: ${dbError.message}`);
    } else {
      console.log(`   ✅ Database query successful`);
      console.log(`   📊 Database count: ${dbNominees?.length || 0} approved nominations`);
      
      if (dbNominees && dbNominees.length > 0) {
        console.log('\n   📋 Sample database record:');
        const sample = dbNominees[0];
        console.log(`   - ID: ${sample.id}`);
        console.log(`   - Category: ${sample.category}`);
        console.log(`   - Type: ${sample.type}`);
        console.log(`   - Status: ${sample.status}`);
        console.log(`   - Votes: ${sample.votes || 0}`);
        console.log(`   - Additional Votes: ${sample.additional_votes || 0}`);
        console.log(`   - Total Votes: ${(sample.votes || 0) + (sample.additional_votes || 0)}`);
        console.log(`   - Created: ${sample.created_at}`);
        console.log(`   - Approved: ${sample.moderated_at || sample.approved_at || 'Not set'}`);
        console.log(`   - Live URL: ${sample.live_url || 'None'}`);
        console.log(`   - Image URL: ${sample.image_url || 'None'}`);
        
        // Show nominee data structure
        if (sample.nominee_data) {
          console.log(`   - Nominee Data Keys: ${Object.keys(sample.nominee_data).join(', ')}`);
          const nomineeData = sample.nominee_data;
          const displayName = nomineeData.name || nomineeData.displayName || 
                             (nomineeData.firstName && nomineeData.lastName ? 
                              `${nomineeData.firstName} ${nomineeData.lastName}` : '') || 
                             'Unknown';
          console.log(`   - Display Name: ${displayName}`);
        }
      }
    }

    // 3. Test categories breakdown
    console.log('\n3. Testing category breakdown...');
    
    const { data: categoryBreakdown, error: categoryError } = await supabase
      .from('nominations')
      .select('subcategory_id, state')  // Use correct column names
      .eq('state', 'approved');

    if (categoryError) {
      console.error(`   ❌ Category query error: ${categoryError.message}`);
    } else {
      const categoryStats = {};
      categoryBreakdown?.forEach(nom => {
        if (!categoryStats[nom.category]) {
          categoryStats[nom.category] = 0;
        }
        categoryStats[nom.category]++;
      });
      
      console.log('   📊 Approved nominees by category:');
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`   - ${category}: ${count} nominees`);
      });
    }

    // 4. Test HubSpot sync status
    console.log('\n4. Testing HubSpot sync configuration...');
    
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true';
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    console.log(`   🔧 HubSpot Sync Enabled: ${hubspotEnabled}`);
    console.log(`   🔑 HubSpot Token Present: ${hubspotToken ? 'Yes' : 'No'}`);
    
    if (hubspotEnabled && hubspotToken) {
      try {
        // Test HubSpot connection
        const hubspotModule = await import('../src/server/hubspot/realtime-sync.js');
        const testResult = await hubspotModule.testHubSpotRealTimeSync();
        
        console.log(`   ✅ HubSpot Connection: ${testResult.success ? 'Working' : 'Failed'}`);
        if (!testResult.success) {
          console.log(`   ❌ HubSpot Error: ${testResult.error}`);
        }
      } catch (error) {
        console.log(`   ⚠️ HubSpot Module Error: ${error.message}`);
      }
    }

    // 5. Test Loops sync status
    console.log('\n5. Testing Loops sync configuration...');
    
    const loopsEnabled = process.env.LOOPS_SYNC_ENABLED === 'true';
    const loopsApiKey = process.env.LOOPS_API_KEY;
    
    console.log(`   🔧 Loops Sync Enabled: ${loopsEnabled}`);
    console.log(`   🔑 Loops API Key Present: ${loopsApiKey ? 'Yes' : 'No'}`);

    // 6. Test outbox tables for sync tracking
    console.log('\n6. Testing sync outbox tables...');
    
    const { data: hubspotOutbox, error: hubspotOutboxError } = await supabase
      .from('hubspot_outbox')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (hubspotOutboxError) {
      console.log(`   ⚠️ HubSpot outbox not available: ${hubspotOutboxError.message}`);
    } else {
      console.log(`   📤 HubSpot outbox entries: ${hubspotOutbox?.length || 0}`);
      if (hubspotOutbox && hubspotOutbox.length > 0) {
        hubspotOutbox.forEach(entry => {
          console.log(`   - ${entry.event_type} at ${entry.created_at}`);
        });
      }
    }

    const { data: loopsOutbox, error: loopsOutboxError } = await supabase
      .from('loops_outbox')
      .select('event_type, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (loopsOutboxError) {
      console.log(`   ⚠️ Loops outbox not available: ${loopsOutboxError.message}`);
    } else {
      console.log(`   📤 Loops outbox entries: ${loopsOutbox?.length || 0}`);
      if (loopsOutbox && loopsOutbox.length > 0) {
        loopsOutbox.forEach(entry => {
          console.log(`   - ${entry.event_type} at ${entry.created_at}`);
        });
      }
    }

    console.log('\n✅ Directory data display test completed!');
    
    // Summary and recommendations
    console.log('\n📋 SUMMARY:');
    console.log(`- API Endpoint: ${apiResult.success ? '✅ Working' : '❌ Failed'}`);
    console.log(`- Database Query: ${dbError ? '❌ Failed' : '✅ Working'}`);
    console.log(`- Approved Nominees: ${dbNominees?.length || 0}`);
    console.log(`- HubSpot Sync: ${hubspotEnabled && hubspotToken ? '✅ Configured' : '⚠️ Not configured'}`);
    console.log(`- Loops Sync: ${loopsEnabled && loopsApiKey ? '✅ Configured' : '⚠️ Not configured'}`);
    
    if (apiResult.data && apiResult.data.length === 0) {
      console.log('\n⚠️ ISSUE DETECTED: No nominees showing in directory');
      console.log('💡 RECOMMENDATIONS:');
      console.log('1. Check if there are approved nominations in the database');
      console.log('2. Verify the API transformation logic is working correctly');
      console.log('3. Check for any filtering issues in the directory page');
      console.log('4. Ensure the database schema matches the API expectations');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the test
testDirectoryDataDisplay();