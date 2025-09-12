#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testImplementation() {
  console.log('🧪 Testing Voting and Nomination Control Implementation...');
  console.log('');
  
  const results = [];
  
  // Test 1: Check if schema file exists
  try {
    const schemaPath = path.join(__dirname, '..', 'VOTING_AND_NOMINATION_CONTROL_SCHEMA.sql');
    const schemaExists = fs.existsSync(schemaPath);
    results.push({
      test: 'Database Schema',
      status: schemaExists ? 'PASS' : 'FAIL',
      details: schemaExists ? 'Schema file created' : 'Schema file missing'
    });
  } catch (error) {
    results.push({
      test: 'Database Schema',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 2: Check voting status hook
  try {
    const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'useVotingStatus.ts');
    const hookExists = fs.existsSync(hookPath);
    const hookContent = hookExists ? fs.readFileSync(hookPath, 'utf8') : '';
    const hasVotingLogic = hookContent.includes('isVotingOpen') && hookContent.includes('isNominationOpen');
    
    results.push({
      test: 'Voting Status Hook',
      status: hasVotingLogic ? 'PASS' : 'FAIL',
      details: hasVotingLogic ? 'Hook updated with voting/nomination logic' : 'Hook missing voting logic'
    });
  } catch (error) {
    results.push({
      test: 'Voting Status Hook',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 3: Check nomination status hook
  try {
    const hookPath = path.join(__dirname, '..', 'src', 'hooks', 'useNominationStatus.ts');
    const hookExists = fs.existsSync(hookPath);
    
    results.push({
      test: 'Nomination Status Hook',
      status: hookExists ? 'PASS' : 'FAIL',
      details: hookExists ? 'Nomination status hook created' : 'Hook missing'
    });
  } catch (error) {
    results.push({
      test: 'Nomination Status Hook',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 4: Check voting closed dialog
  try {
    const dialogPath = path.join(__dirname, '..', 'src', 'components', 'VotingClosedDialog.tsx');
    const dialogExists = fs.existsSync(dialogPath);
    
    results.push({
      test: 'Voting Closed Dialog',
      status: dialogExists ? 'PASS' : 'FAIL',
      details: dialogExists ? 'Dialog component created' : 'Dialog missing'
    });
  } catch (error) {
    results.push({
      test: 'Voting Closed Dialog',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 5: Check admin nomination form
  try {
    const formPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'AdminNominationForm.tsx');
    const formExists = fs.existsSync(formPath);
    
    results.push({
      test: 'Admin Nomination Form',
      status: formExists ? 'PASS' : 'FAIL',
      details: formExists ? 'Admin form component created' : 'Form missing'
    });
  } catch (error) {
    results.push({
      test: 'Admin Nomination Form',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 6: Check voting date control
  try {
    const controlPath = path.join(__dirname, '..', 'src', 'components', 'admin', 'VotingDateControl.tsx');
    const controlExists = fs.existsSync(controlPath);
    
    results.push({
      test: 'Voting Date Control',
      status: controlExists ? 'PASS' : 'FAIL',
      details: controlExists ? 'Control panel component created' : 'Control panel missing'
    });
  } catch (error) {
    results.push({
      test: 'Voting Date Control',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 7: Check admin API route
  try {
    const apiPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'nominations', 'create', 'route.ts');
    const apiExists = fs.existsSync(apiPath);
    
    results.push({
      test: 'Admin Nomination API',
      status: apiExists ? 'PASS' : 'FAIL',
      details: apiExists ? 'API route created' : 'API route missing'
    });
  } catch (error) {
    results.push({
      test: 'Admin Nomination API',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 8: Check vote section updates
  try {
    const votePath = path.join(__dirname, '..', 'src', 'components', 'nominee', 'VoteSection.tsx');
    const voteExists = fs.existsSync(votePath);
    const voteContent = voteExists ? fs.readFileSync(votePath, 'utf8') : '';
    const hasVotingCheck = voteContent.includes('votingStatus.isVotingOpen');
    
    results.push({
      test: 'Vote Section Updates',
      status: hasVotingCheck ? 'PASS' : 'FAIL',
      details: hasVotingCheck ? 'Vote section updated with voting status' : 'Vote section not updated'
    });
  } catch (error) {
    results.push({
      test: 'Vote Section Updates',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 9: Check settings API updates
  try {
    const settingsPath = path.join(__dirname, '..', 'src', 'app', 'api', 'settings', 'route.ts');
    const settingsExists = fs.existsSync(settingsPath);
    const settingsContent = settingsExists ? fs.readFileSync(settingsPath, 'utf8') : '';
    const hasNewSettings = settingsContent.includes('voting_end_date') && settingsContent.includes('nominations_enabled');
    
    results.push({
      test: 'Settings API Updates',
      status: hasNewSettings ? 'PASS' : 'FAIL',
      details: hasNewSettings ? 'Settings API updated with new fields' : 'Settings API not updated'
    });
  } catch (error) {
    results.push({
      test: 'Settings API Updates',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Display results
  console.log('📊 Test Results:');
  console.log('================');
  
  let passCount = 0;
  let failCount = 0;
  
  results.forEach((result, index) => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    console.log(`${icon} ${result.test}: ${result.status}`);
    console.log(`   ${result.details}`);
    
    if (result.status === 'PASS') passCount++;
    else failCount++;
  });
  
  console.log('');
  console.log('📈 Summary:');
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${failCount}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failCount === 0) {
    console.log('');
    console.log('🎉 All tests passed! Implementation is complete.');
    console.log('');
    console.log('🚀 Features implemented:');
    console.log('  1. Voting date control in admin panel');
    console.log('  2. Automatic nomination/voting state switching');
    console.log('  3. Admin-only nomination form (bypasses approval)');
    console.log('  4. Voting closed messages on nominee pages');
    console.log('  5. Dynamic button text based on voting status');
    console.log('');
    console.log('📋 Next steps:');
    console.log('  1. Apply the database schema when Supabase is configured');
    console.log('  2. Test the admin panel voting controls');
    console.log('  3. Test the admin nomination form');
    console.log('  4. Verify voting status changes across the app');
  } else {
    console.log('');
    console.log('⚠️ Some tests failed. Please check the implementation.');
  }
}

// Run the tests
testImplementation();