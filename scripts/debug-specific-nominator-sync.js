#!/usr/bin/env node

async function debugSpecificNominator() {
  console.log('🔍 Debugging specific nominator sync: 0n7v2@powerscrews.com\n');
  
  const targetEmail = '0n7v2@powerscrews.com';
  
  try {
    // Check if nominator exists in database
    console.log('1️⃣ Checking database for nominator...');
    const response = await fetch('http://localhost:3000/api/admin/nominations');
    const data = await response.json();
    
    if (response.ok && data.nominations) {
      const nominatorNominations = data.nominations.filter(nom => 
        nom.nominator?.email?.toLowerCase() === targetEmail.toLowerCase()
      );
      
      if (nominatorNominations.length > 0) {
        console.log(`✅ Found ${nominatorNominations.length} nominations from this nominator:`);
        nominatorNominations.forEach((nom, index) => {
          console.log(`   ${index + 1}. Nomination ID: ${nom.id}`);
          console.log(`      Nominee: ${nom.nominee?.display_name || 'Unknown'}`);
          console.log(`      Category: ${nom.subcategory_id}`);
          console.log(`      State: ${nom.state}`);
          console.log(`      Created: ${nom.created_at}`);
          console.log(`      Nominator: ${nom.nominator?.firstname} ${nom.nominator?.lastname} (${nom.nominator?.email})`);
          console.log('');
        });
      } else {
        console.log('❌ No nominations found from this nominator');
        return;
      }
    } else {
      console.log('❌ Failed to fetch nominations from database');
      return;
    }
    
    // Test HubSpot sync manually
    console.log('2️⃣ Testing manual HubSpot sync...');
    
    const testSyncData = {
      firstname: 'Test',
      lastname: 'Nominator',
      email: targetEmail,
      company: 'PowerScrews Inc',
      jobTitle: 'Test Role',
      country: 'United States'
    };
    
    // Test the sync function directly
    const testResponse = await fetch('http://localhost:3000/api/sync/hubspot/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'nominator',
        data: testSyncData
      })
    });
    
    const testResult = await testResponse.json();
    
    if (testResponse.ok) {
      console.log('✅ Manual HubSpot sync test successful:');
      console.log(`   Contact ID: ${testResult.contactId}`);
      console.log(`   Success: ${testResult.success}`);
    } else {
      console.log('❌ Manual HubSpot sync test failed:');
      console.log(`   Error: ${testResult.error}`);
    }
    
    // Check HubSpot outbox for pending syncs
    console.log('\n3️⃣ Checking HubSpot outbox for pending syncs...');
    
    // This would require a database query - let's create a simple API endpoint
    const outboxResponse = await fetch('http://localhost:3000/api/sync/hubspot/outbox-status');
    
    if (outboxResponse.ok) {
      const outboxData = await outboxResponse.json();
      console.log(`📦 Outbox status: ${outboxData.pending} pending, ${outboxData.processed} processed`);
    } else {
      console.log('⚠️ Could not check outbox status');
    }
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
  }
}

debugSpecificNominator().catch(console.error);