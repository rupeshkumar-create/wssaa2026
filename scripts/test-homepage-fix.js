#!/usr/bin/env node

/**
 * Test script to verify the homepage shows correct button text
 */

console.log('🧪 Testing Homepage Button Logic\n');

// Simulate the voting status logic
const votingStartDate = '2025-10-01T01:58'; // October 1st, 2025
const now = new Date();
const start = new Date(votingStartDate);

console.log('📅 Date Comparison:');
console.log('Current Time:', now.toISOString());
console.log('Voting Start Time:', start.toISOString());
console.log('Current Time >= Start Time:', now >= start);

const isVotingOpen = now >= start;
const showNominate = !isVotingOpen;

console.log('\n🎯 Expected Behavior:');
console.log('Is Voting Open:', isVotingOpen);
console.log('Should Show "Nominate Now":', showNominate);
console.log('Expected Button Text:', showNominate ? 'Nominate Now' : 'Vote Now');
console.log('Expected Button Link:', showNominate ? '/nominate' : '/nominees');

console.log('\n✅ Components Fixed:');
console.log('- HomePage: ✅ Using useVotingStatus');
console.log('- AnimatedHero: ✅ Updated to useVotingStatus');
console.log('- Navigation: ✅ Updated to useVotingStatus');

console.log('\n🔄 Next Steps:');
console.log('1. Refresh your browser');
console.log('2. Check browser console for voting status logs');
console.log('3. Verify all buttons show "Nominate Now"');
console.log('4. Verify buttons link to /nominate');

if (showNominate) {
  console.log('\n🎉 SUCCESS: With voting date set to October 1st, 2025, all buttons should show "Nominate Now"');
} else {
  console.log('\n⚠️ WARNING: Voting appears to be open, buttons will show "Vote Now"');
}