#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function testAdminWithoutVotingControl() {
  console.log('🧪 Testing Admin Panel without VotingDateControl...');
  console.log('');
  
  const results = [];
  
  // Test 1: Check if VotingDateControl import is removed
  try {
    const adminPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
    const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
    const hasVotingDateControlImport = adminPageContent.includes('import { VotingDateControl }');
    
    results.push({
      test: 'VotingDateControl Import Removed',
      status: !hasVotingDateControlImport ? 'PASS' : 'FAIL',
      details: !hasVotingDateControlImport ? 'Import successfully removed' : 'Import still exists'
    });
  } catch (error) {
    results.push({
      test: 'VotingDateControl Import Removed',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 2: Check if VotingDateControl usage is removed
  try {
    const adminPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
    const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
    const hasVotingDateControlUsage = adminPageContent.includes('<VotingDateControl');
    
    results.push({
      test: 'VotingDateControl Usage Removed',
      status: !hasVotingDateControlUsage ? 'PASS' : 'FAIL',
      details: !hasVotingDateControlUsage ? 'Component usage successfully removed' : 'Component still being used'
    });
  } catch (error) {
    results.push({
      test: 'VotingDateControl Usage Removed',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 3: Check if admin page still has other essential components
  try {
    const adminPagePath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
    const adminPageContent = fs.readFileSync(adminPagePath, 'utf8');
    const hasAdminNominationForm = adminPageContent.includes('AdminNominationForm');
    const hasNominationToggle = adminPageContent.includes('NominationToggle');
    const hasManualVoteUpdate = adminPageContent.includes('ManualVoteUpdate');
    
    const allEssentialComponents = hasAdminNominationForm && hasNominationToggle && hasManualVoteUpdate;
    
    results.push({
      test: 'Essential Admin Components Present',
      status: allEssentialComponents ? 'PASS' : 'FAIL',
      details: allEssentialComponents ? 'All essential components are present' : 'Some essential components are missing'
    });
  } catch (error) {
    results.push({
      test: 'Essential Admin Components Present',
      status: 'FAIL',
      details: error.message
    });
  }
  
  // Test 4: Check if voting status hooks still work
  try {
    const votingStatusPath = path.join(__dirname, '..', 'src', 'hooks', 'useVotingStatus.ts');
    const votingStatusExists = fs.existsSync(votingStatusPath);
    const votingStatusContent = votingStatusExists ? fs.readFileSync(votingStatusPath, 'utf8') : '';
    const hasVotingLogic = votingStatusContent.includes('isVotingOpen') && votingStatusContent.includes('isNominationOpen');
    
    result