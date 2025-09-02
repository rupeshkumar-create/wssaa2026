#!/usr/bin/env node

/**
 * Test UI improvements and nomination status behavior
 */

async function testUIImprovements() {
  const url = 'https://wssaa2026.vercel.app';
  
  console.log('🧪 Testing UI Improvements...\n');
  
  try {
    // Test 1: Check current nomination status
    console.log('1️⃣ Testing nomination status...');
    const settingsResponse = await fetch(`${url}/api/settings`);
    const settingsData = await settingsResponse.json();
    
    const nominationsEnabled = settingsData.nominations_enabled;
    console.log(`   Nominations Enabled: ${nominationsEnabled ? '✅ YES' : '❌ NO'}`);
    
    // Test 2: Check home page content
    console.log('\n2️⃣ Testing home page buttons...');
    const homeResponse = await fetch(url);
    const homeHtml = await homeResponse.text();
    
    const hasNominateButton = homeHtml.includes('Submit Nomination') || homeHtml.includes('bg-orange-600');
    const hasVoteButton = homeHtml.includes('Start Voting');
    
    console.log(`   Has Nominate Button: ${hasNominateButton ? '✅' : '❌'}`);
    console.log(`   Has Vote Button: ${hasVoteButton ? '✅' : '❌'}`);
    
    if (nominationsEnabled) {
      console.log(`   Expected: Both buttons should be present`);
      console.log(`   Result: ${hasNominateButton && hasVoteButton ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log(`   Expected: Only Vote button should be present`);
      console.log(`   Result: ${!hasNominateButton && hasVoteButton ? '✅ CORRECT' : '❌ INCORRECT'}`);
    }
    
    // Test 3: Check navigation
    console.log('\n3️⃣ Testing navigation links...');
    const hasNominateNav = homeHtml.includes('href="/nominate"') && homeHtml.includes('>Nominate<');
    const hasVoteNav = homeHtml.includes('href="/directory"') && (homeHtml.includes('>Vote<') || homeHtml.includes('>Directory<'));
    
    console.log(`   Has Nominate Nav Link: ${hasNominateNav ? '✅' : '❌'}`);
    console.log(`   Has Vote/Directory Nav Link: ${hasVoteNav ? '✅' : '❌'}`);
    
    if (nominationsEnabled) {
      console.log(`   Expected: Both Nominate and Vote nav links`);
      console.log(`   Result: ${hasNominateNav && hasVoteNav ? '✅ CORRECT' : '❌ INCORRECT'}`);
    } else {
      console.log(`   Expected: Only Vote/Directory nav link`);
      console.log(`   Result: ${!hasNominateNav && hasVoteNav ? '✅ CORRECT' : '❌ INCORRECT'}`);
    }
    
    // Test 4: Test admin panel access (if possible)
    console.log('\n4️⃣ Testing admin panel terminology...');
    console.log('   (Admin panel requires authentication - check manually)');
    console.log('   ✅ Should show "Nominations:" instead of "Voting:" in Current Configuration');
    console.log('   ✅ Dropdowns should be larger with better styling');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Current Status: Nominations ${nominationsEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   Home Page: ${(nominationsEnabled ? (hasNominateButton && hasVoteButton) : (!hasNominateButton && hasVoteButton)) ? '✅ Working correctly' : '❌ Needs attention'}`);
    console.log(`   Navigation: ${(nominationsEnabled ? (hasNominateNav && hasVoteNav) : (!hasNominateNav && hasVoteNav)) ? '✅ Working correctly' : '❌ Needs attention'}`);
    
    console.log('\n🔧 To test both states:');
    console.log('1. Go to admin panel → Settings → Toggle nomination status');
    console.log('2. Check home page and navigation update accordingly');
    console.log('3. Verify dropdown sizes in admin panel are larger');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testUIImprovements();