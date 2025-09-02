#!/usr/bin/env node

/**
 * Comprehensive HubSpot Sync Test
 * 
 * This script tests the complete HubSpot sync workflow:
 * 1. Nominator sync on submission (pending approval)
 * 2. Nominee sync on admin approval 
 * 3. Voter sync on vote cast
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

async function testComprehensiveHubSpotSync() {
  console.log('🔄 Testing Comprehensive HubSpot Sync Workflow...\n');

  try {
    // 1. Test HubSpot connection and setup
    console.log('1. Testing HubSpot connection...');
    
    const hubspotEnabled = process.env.HUBSPOT_SYNC_ENABLED === 'true';
    const hubspotToken = process.env.HUBSPOT_ACCESS_TOKEN || process.env.HUBSPOT_TOKEN;
    
    console.log(`   🔧 HubSpot Sync Enabled: ${hubspotEnabled}`);
    console.log(`   🔑 HubSpot Token Present: ${hubspotToken ? 'Yes' : 'No'}`);
    
    if (!hubspotEnabled || !hubspotToken) {
      console.log('   ⚠️ HubSpot sync not configured. Skipping sync tests.');
      return;
    }

    // Test connection
    try {
      const hubspotModule = await import('../src/server/hubspot/realtime-sync.js');
      const testResult = await hubspotModule.testHubSpotRealTimeSync();
      
      console.log(`   ✅ HubSpot Connection: ${testResult.success ? 'Working' : 'Failed'}`);
      if (!testResult.success) {
        console.log(`   ❌ HubSpot Error: ${testResult.error}`);
        return;
      }
      
      if (testResult.accountInfo) {
        console.log(`   🏢 HubSpot Account: ${testResult.accountInfo.portalId}`);
      }
    } catch (error) {
      console.log(`   ❌ HubSpot Module Error: ${error.message}`);
      return;
    }

    // 2. Test nomination submission sync (nominator)
    console.log('\n2. Testing nomination submission sync (nominator)...');
    
    const testNominationData = {
      type: 'person',
      categoryGroupId: 'staffing',
      subcategoryId: 'best-staffing-firm',
      nominator: {
        firstname: 'Test',
        lastname: 'Nominator',
        email: 'test.nominator@example.com',
        linkedin: 'https://linkedin.com/in/test-nominator',
        company: 'Test Staffing Co',
        jobTitle: 'CEO',
        phone: '+1-555-0123',
        country: 'United States'
      },
      nominee: {
        firstname: 'Test',
        lastname: 'Nominee',
        email: 'test.nominee@example.com',
        linkedin: 'https://linkedin.com/in/test-nominee',
        jobtitle: 'Senior Recruiter',
        company: 'Amazing Staffing Inc',
        phone: '+1-555-0124',
        country: 'United States',
        headshotUrl: 'https://example.com/headshot.jpg',
        whyMe: 'I am an exceptional recruiter with 10+ years of experience.',
        liveUrl: 'https://example.com/nominee',
        bio: 'Experienced staffing professional',
        achievements: 'Top performer for 3 consecutive years'
      }
    };

    try {
      const submitResponse = await fetch('http://localhost:3000/api/nomination/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNominationData),
      });

      if (submitResponse.ok) {
        const submitResult = await submitResponse.json();
        console.log(`   ✅ Nomination submitted: ${submitResult.nominationId}`);
        console.log(`   🔄 Nominator HubSpot sync: ${submitResult.hubspotSync?.nominatorSynced ? 'Success' : 'Failed'}`);
        console.log(`   🔄 Nominee HubSpot sync: ${submitResult.hubspotSync?.nomineeSynced ? 'Success' : 'Failed'}`);
        
        // Store nomination ID for approval test
        global.testNominationId = submitResult.nominationId;
      } else {
        const error = await submitResponse.text();
        console.log(`   ❌ Nomination submission failed: ${error}`);
      }
    } catch (error) {
      console.log(`   ❌ Nomination submission error: ${error.message}`);
    }

    // 3. Test nomination approval sync (nominee)
    console.log('\n3. Testing nomination approval sync (nominee)...');
    
    if (global.testNominationId) {
      const approvalData = {
        nominationId: global.testNominationId,
        action: 'approve',
        liveUrl: 'https://example.com/approved-nominee',
        adminNotes: 'Test approval for sync verification'
      };

      try {
        const approveResponse = await fetch('http://localhost:3000/api/nomination/approve', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ADMIN_PASSWORD || 'admin123'}`,
          },
          body: JSON.stringify(approvalData),
        });

        if (approveResponse.ok) {
          const approveResult = await approveResponse.json();
          console.log(`   ✅ Nomination approved: ${approveResult.nominationId}`);
          console.log(`   🔗 Live URL: ${approveResult.liveUrl}`);
          console.log(`   👤 Display Name: ${approveResult.displayName}`);
          
          // Store for vote test
          global.testNomineeDisplayName = approveResult.displayName;
        } else {
          const error = await approveResponse.text();
          console.log(`   ❌ Nomination approval failed: ${error}`);
        }
      } catch (error) {
        console.log(`   ❌ Nomination approval error: ${error.message}`);
      }
    } else {
      console.log('   ⚠️ No nomination ID available for approval test');
    }

    // 4. Test vote cast sync (voter)
    console.log('\n4. Testing vote cast sync (voter)...');
    
    if (global.testNomineeDisplayName) {
      const voteData = {
        subcategoryId: 'best-staffing-firm',
        firstname: 'Test',
        lastname: 'Voter',
        email: 'test.voter@example.com',
        linkedin: 'https://linkedin.com/in/test-voter',
        company: 'Voter Company Inc',
        jobTitle: 'HR Director',
        country: 'United States',
        votedForDisplayName: global.testNomineeDisplayName
      };

      try {
        const voteResponse = await fetch('http://localhost:3000/api/vote', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(voteData),
        });

        if (voteResponse.ok) {
          const voteResult = await voteResponse.json();
          console.log(`   ✅ Vote cast: ${voteResult.voteId}`);
          console.log(`   📊 New vote count: ${voteResult.newVoteCount}`);
        } else {
          const error = await voteResponse.text();
          console.log(`   ❌ Vote casting failed: ${error}`);
        }
      } catch (error) {
        console.log(`   ❌ Vote casting error: ${error.message}`);
      }
    } else {
      console.log('   ⚠️ No nominee display name available for vote test');
    }

    // 5. Check HubSpot outbox for sync tracking
    console.log('\n5. Checking HubSpot sync outbox...');
    
    const { data: outboxEntries, error: outboxError } = await supabase
      .from('hubspot_outbox')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (outboxError) {
      console.log(`   ❌ Outbox query error: ${outboxError.message}`);
    } else {
      console.log(`   📤 Recent outbox entries: ${outboxEntries?.length || 0}`);
      
      if (outboxEntries && outboxEntries.length > 0) {
        outboxEntries.forEach((entry, index) => {
          console.log(`   ${index + 1}. ${entry.event_type} - ${entry.created_at}`);
          if (entry.processed_at) {
            console.log(`      ✅ Processed: ${entry.processed_at}`);
          } else {
            console.log(`      ⏳ Pending processing`);
          }
        });
      }
    }

    // 6. Test direct HubSpot sync functions
    console.log('\n6. Testing direct HubSpot sync functions...');
    
    try {
      const hubspotModule = await import('../src/server/hubspot/realtime-sync.js');
      
      // Test nominator sync
      console.log('   Testing nominator sync...');
      const nominatorResult = await hubspotModule.syncNominatorToHubSpot({
        firstname: 'Direct',
        lastname: 'Nominator',
        email: 'direct.nominator@example.com',
        company: 'Direct Test Co',
        jobTitle: 'Test Manager'
      });
      
      console.log(`   🔄 Direct nominator sync: ${nominatorResult.success ? 'Success' : 'Failed'}`);
      if (nominatorResult.contactId) {
        console.log(`   👤 HubSpot Contact ID: ${nominatorResult.contactId}`);
      }
      if (nominatorResult.error) {
        console.log(`   ❌ Error: ${nominatorResult.error}`);
      }

      // Test nominee sync
      console.log('   Testing nominee sync...');
      const nomineeResult = await hubspotModule.syncNomineeToHubSpot({
        type: 'person',
        subcategoryId: 'best-staffing-firm',
        nominationId: 'test-nomination-123',
        firstname: 'Direct',
        lastname: 'Nominee',
        email: 'direct.nominee@example.com',
        jobtitle: 'Senior Consultant',
        company: 'Direct Nominee Co'
      });
      
      console.log(`   🔄 Direct nominee sync: ${nomineeResult.success ? 'Success' : 'Failed'}`);
      if (nomineeResult.contactId) {
        console.log(`   👤 HubSpot Contact ID: ${nomineeResult.contactId}`);
      }
      if (nomineeResult.error) {
        console.log(`   ❌ Error: ${nomineeResult.error}`);
      }

      // Test voter sync
      console.log('   Testing voter sync...');
      const voterResult = await hubspotModule.syncVoterToHubSpot({
        firstname: 'Direct',
        lastname: 'Voter',
        email: 'direct.voter@example.com',
        company: 'Direct Voter Co',
        jobTitle: 'HR Manager',
        votedFor: 'Test Nominee',
        subcategoryId: 'best-staffing-firm'
      });
      
      console.log(`   🔄 Direct voter sync: ${voterResult.success ? 'Success' : 'Failed'}`);
      if (voterResult.contactId) {
        console.log(`   👤 HubSpot Contact ID: ${voterResult.contactId}`);
      }
      if (voterResult.error) {
        console.log(`   ❌ Error: ${voterResult.error}`);
      }

    } catch (error) {
      console.log(`   ❌ Direct sync test error: ${error.message}`);
    }

    console.log('\n✅ Comprehensive HubSpot sync test completed!');
    
    // Summary
    console.log('\n📋 SYNC WORKFLOW SUMMARY:');
    console.log('1. 📝 Nomination Submission → Nominator synced to HubSpot with "WSA 2026 Nominator" tag');
    console.log('2. ✅ Admin Approval → Nominee synced to HubSpot with "WSA 2026 Nominees" tag');
    console.log('3. 🗳️ Vote Cast → Voter synced to HubSpot with "WSA 2026 Voters" tag');
    console.log('4. 📤 All events tracked in hubspot_outbox for backup processing');
    console.log('5. 🏷️ Proper tagging ensures segmentation in HubSpot for marketing campaigns');

  } catch (error) {
    console.error('❌ Comprehensive sync test failed:', error);
    process.exit(1);
  }
}

// Run the test
testComprehensiveHubSpotSync();