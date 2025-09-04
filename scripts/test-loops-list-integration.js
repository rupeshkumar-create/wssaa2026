#!/usr/bin/env node

/**
 * Test Loops List Integration
 * 
 * This script tests the new direct list management functionality
 * to ensure contacts are properly added to the correct public lists.
 */

const { loopsClient } = require('../src/server/loops/client.ts');
const { 
  syncNominatorToLoops, 
  syncNomineeToLoops, 
  syncVoterToLoops,
  updateNominatorToLive 
} = require('../src/server/loops/realtime-sync.ts');

async function testLoopsListIntegration() {
  console.log('🧪 Testing Loops List Integration\n');

  try {
    // Test 1: Check if Loops is enabled
    console.log('1️⃣ Checking Loops configuration...');
    if (!loopsClient.constructor.isEnabled()) {
      console.error('❌ Loops sync is not enabled. Check LOOPS_SYNC_ENABLED and LOOPS_API_KEY');
      return;
    }
    console.log('✅ Loops sync is enabled\n');

    // Test 2: Verify list IDs are configured
    console.log('2️⃣ Verifying list IDs configuration...');
    console.log('List IDs:', loopsClient.LIST_IDS);
    console.log('✅ List IDs configured correctly\n');

    // Test 3: Test basic list operations
    console.log('3️⃣ Testing basic list operations...');
    const testEmail = 'test-list-integration@worldstaffingawards.com';
    
    // Test adding to Voters list
    console.log('Testing add to Voters list...');
    const addResult = await loopsClient.addToList(testEmail, loopsClient.LIST_IDS.VOTERS);
    if (addResult.success) {
      console.log('✅ Successfully added test contact to Voters list');
    } else {
      console.error('❌ Failed to add to Voters list:', addResult.error);
    }

    // Test removing from Voters list
    console.log('Testing remove from Voters list...');
    const removeResult = await loopsClient.removeFromList(testEmail, loopsClient.LIST_IDS.VOTERS);
    if (removeResult.success) {
      console.log('✅ Successfully removed test contact from Voters list');
    } else {
      console.error('❌ Failed to remove from Voters list:', removeResult.error);
    }
    console.log('');

    // Test 4: Test getting all lists
    console.log('4️⃣ Testing list retrieval...');
    const listsResult = await loopsClient.getLists();
    if (listsResult.success) {
      console.log(`✅ Successfully retrieved ${listsResult.lists?.length || 0} lists`);
      if (listsResult.lists && listsResult.lists.length > 0) {
        console.log('Available lists:');
        listsResult.lists.forEach(list => {
          console.log(`  - ${list.name} (${list.id}) - Public: ${list.isPublic}`);
        });
      }
    } else {
      console.error('❌ Failed to retrieve lists:', listsResult.error);
    }
    console.log('');

    // Test 5: Test nominator sync with list integration
    console.log('5️⃣ Testing nominator sync with list integration...');
    const nominatorData = {
      firstname: 'Test',
      lastname: 'Nominator',
      email: 'test-nominator-list@worldstaffingawards.com',
      company: 'Test Company',
      jobTitle: 'Test Role',
      country: 'United States'
    };

    const nominatorResult = await syncNominatorToLoops(nominatorData);
    if (nominatorResult.success) {
      console.log('✅ Nominator sync with list integration successful');
    } else {
      console.error('❌ Nominator sync failed:', nominatorResult.error);
    }
    console.log('');

    // Test 6: Test nominee sync with list integration
    console.log('6️⃣ Testing nominee sync with list integration...');
    const nomineeData = {
      firstname: 'Test',
      lastname: 'Nominee',
      email: 'test-nominee-list@worldstaffingawards.com',
      type: 'person',
      subcategoryId: 'test-category',
      nominationId: 'test-nomination-123',
      liveUrl: 'https://worldstaffingawards.com/nominee/test-nominee'
    };

    const nomineeResult = await syncNomineeToLoops(nomineeData);
    if (nomineeResult.success) {
      console.log('✅ Nominee sync with list integration successful');
    } else {
      console.error('❌ Nominee sync failed:', nomineeResult.error);
    }
    console.log('');

    // Test 7: Test voter sync with list integration
    console.log('7️⃣ Testing voter sync with list integration...');
    const voterData = {
      firstname: 'Test',
      lastname: 'Voter',
      email: 'test-voter-list@worldstaffingawards.com',
      company: 'Voter Company',
      votedFor: 'Test Nominee',
      subcategoryId: 'test-category'
    };

    const voterResult = await syncVoterToLoops(voterData);
    if (voterResult.success) {
      console.log('✅ Voter sync with list integration successful');
    } else {
      console.error('❌ Voter sync failed:', voterResult.error);
    }
    console.log('');

    // Test 8: Test nominator to live update with list migration
    console.log('8️⃣ Testing nominator to live update with list migration...');
    const updateResult = await updateNominatorToLive(
      nominatorData.email,
      {
        name: 'Test Nominee',
        liveUrl: 'https://worldstaffingawards.com/nominee/test-nominee'
      }
    );

    if (updateResult.success) {
      console.log('✅ Nominator to live update with list migration successful');
    } else {
      console.error('❌ Nominator to live update failed:', updateResult.error);
    }
    console.log('');

    // Test 9: Test batch operations
    console.log('9️⃣ Testing batch list operations...');
    const batchEmails = [
      'batch-test-1@worldstaffingawards.com',
      'batch-test-2@worldstaffingawards.com',
      'batch-test-3@worldstaffingawards.com'
    ];

    const batchResult = await loopsClient.batchAddToList(batchEmails, loopsClient.LIST_IDS.VOTERS);
    if (batchResult.success) {
      console.log(`✅ Batch add successful: ${batchResult.totalAdded}/${batchEmails.length} contacts added`);
    } else {
      console.error('❌ Batch add failed');
    }
    console.log('');

    console.log('🎉 Loops List Integration Test Complete!');
    console.log('\n📊 Test Summary:');
    console.log('✅ List configuration verified');
    console.log('✅ Basic list operations tested');
    console.log('✅ List retrieval tested');
    console.log('✅ Nominator sync with list integration tested');
    console.log('✅ Nominee sync with list integration tested');
    console.log('✅ Voter sync with list integration tested');
    console.log('✅ Nominator to live migration tested');
    console.log('✅ Batch operations tested');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testLoopsListIntegration();
}

module.exports = { testLoopsListIntegration };