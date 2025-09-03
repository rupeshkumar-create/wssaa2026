#!/usr/bin/env node

async function testSpecificNominatorSync() {
  console.log('🔍 Testing specific nominator sync: 0n7v2@powerscrews.com\n');
  
  const targetEmail = '0n7v2@powerscrews.com';
  
  try {
    const response = await fetch('http://localhost:3000/api/sync/hubspot/debug-nominator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: targetEmail })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.log('❌ API Error:', data.error);
      return;
    }
    
    if (!data.found) {
      console.log('❌ Nominator not found in database');
      return;
    }
    
    console.log('✅ Nominator found in database:');
    console.log(`   Name: ${data.nominator.firstname} ${data.nominator.lastname}`);
    console.log(`   Email: ${data.nominator.email}`);
    console.log(`   Company: ${data.nominator.company || 'Not provided'}`);
    console.log(`   Created: ${data.nominator.created_at}`);
    
    console.log(`\n📊 Nominations by this nominator: ${data.nominations.length}`);
    data.nominations.forEach((nom, index) => {
      const nomineeName = nom.nominees?.firstname 
        ? `${nom.nominees.firstname} ${nom.nominees.lastname}`
        : nom.nominees?.company_name || 'Unknown';
      
      console.log(`   ${index + 1}. ${nomineeName} (${nom.subcategory_id}) - ${nom.state}`);
    });
    
    console.log('\n🔧 HubSpot Configuration:');
    console.log(`   Enabled: ${data.hubspotEnabled}`);
    console.log(`   Configured: ${data.hubspotConfigured}`);
    
    console.log('\n🔄 HubSpot Sync Test Result:');
    if (data.syncResult) {
      if (data.syncResult.success) {
        console.log(`   ✅ Success! Contact ID: ${data.syncResult.contactId}`);
      } else {
        console.log(`   ❌ Failed: ${data.syncResult.error}`);
      }
    } else {
      console.log('   ⚠️ No sync result available');
    }
    
    console.log(`\n📦 HubSpot Outbox Entries: ${data.outboxEntries.length}`);
    data.outboxEntries.forEach((entry, index) => {
      console.log(`   ${index + 1}. ${entry.event_type} - ${entry.processed ? 'Processed' : 'Pending'} (${entry.created_at})`);
    });
    
    // Test real-time sync by triggering a manual sync
    console.log('\n🚀 Testing manual real-time sync...');
    
    const manualSyncResponse = await fetch('http://localhost:3000/api/sync/hubspot/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'manual',
        email: targetEmail
      })
    });
    
    if (manualSyncResponse.ok) {
      const manualSyncData = await manualSyncResponse.json();
      console.log('✅ Manual sync completed:', manualSyncData);
    } else {
      const manualSyncError = await manualSyncResponse.json();
      console.log('❌ Manual sync failed:', manualSyncError);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testSpecificNominatorSync().catch(console.error);