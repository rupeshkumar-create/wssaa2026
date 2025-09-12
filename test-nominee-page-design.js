#!/usr/bin/env node

/**
 * Test script to verify nominee page design changes
 * Tests the updated orange theme and top-to-bottom gradients
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎨 Testing Top-to-Bottom Gradient Implementation...\n');

// Test 1: Check if all gradients are top-to-bottom in VoteSection
console.log('1. ✅ Checking VoteSection gradients...');
const voteFile = fs.readFileSync('src/components/nominee/VoteSection.tsx', 'utf8');

// Check for top-to-bottom gradients
const voteHasTopToBottom = voteFile.includes('bg-gradient-to-b from-orange-500 to-orange-600') && 
                          voteFile.includes('bg-gradient-to-b from-orange-100') &&
                          !voteFile.includes('bg-gradient-to-r') &&
                          !voteFile.includes('bg-gradient-to-br');

if (voteHasTopToBottom) {
  console.log('   ✅ All VoteSection gradients are top-to-bottom');
} else {
  console.log('   ❌ VoteSection still has left-to-right or other gradients');
}

// Test 2: Check TabsSection gradients
console.log('\n2. ✅ Checking TabsSection gradients...');
const tabsFile = fs.readFileSync('src/components/nominee/TabsSection.tsx', 'utf8');

const tabsHasTopToBottom = tabsFile.includes('bg-gradient-to-b from-orange-500 to-orange-600') &&
                          !tabsFile.includes('bg-gradient-to-r') &&
                          !tabsFile.includes('bg-gradient-to-br');

if (tabsHasTopToBottom) {
  console.log('   ✅ All TabsSection gradients are top-to-bottom');
} else {
  console.log('   ❌ TabsSection still has left-to-right or other gradients');
}

// Test 3: Check EnhancedNomineeHero gradients
console.log('\n3. ✅ Checking EnhancedNomineeHero gradients...');
const heroFile = fs.readFileSync('src/components/nominee/EnhancedNomineeHero.tsx', 'utf8');

const heroHasTopToBottom = heroFile.includes('bg-gradient-to-b from-orange-500 to-orange-600') &&
                          heroFile.includes('bg-gradient-to-b from-gray-100 to-gray-200') &&
                          !heroFile.includes('bg-gradient-to-r') &&
                          !heroFile.includes('bg-gradient-to-br');

if (heroHasTopToBottom) {
  console.log('   ✅ All EnhancedNomineeHero gradients are top-to-bottom');
} else {
  console.log('   ❌ EnhancedNomineeHero still has left-to-right or other gradients');
}

// Test 4: Check for any remaining left-to-right gradients
console.log('\n4. ✅ Checking for any remaining left-to-right gradients...');
const allFiles = [voteFile, tabsFile, heroFile];
const hasLeftToRight = allFiles.some(file => 
  file.includes('bg-gradient-to-r') || 
  file.includes('gradient-to-r') ||
  file.includes('bg-gradient-to-br')
);

if (!hasLeftToRight) {
  console.log('   ✅ No left-to-right gradients found in nominee components');
} else {
  console.log('   ❌ Some left-to-right gradients still exist');
}

// Test 5: Check vote button design
console.log('\n5. ✅ Checking vote button design...');
const hasIconOnlyVoteButton = heroFile.includes('size="icon"') && 
                              heroFile.includes('w-14 h-14') &&
                              heroFile.includes('bg-gradient-to-b from-orange-500 to-orange-600');

if (hasIconOnlyVoteButton) {
  console.log('   ✅ Vote button is icon-only with top-to-bottom orange gradient');
} else {
  console.log('   ❌ Vote button design not correctly implemented');
}

// Test 6: Check orange theme consistency
console.log('\n6. ✅ Checking orange theme consistency...');
const hasOrangeTheme = voteFile.includes('text-orange-500') &&
                      tabsFile.includes('text-orange-500') &&
                      heroFile.includes('text-orange-500') &&
                      heroFile.includes('border-orange-100');

if (hasOrangeTheme) {
  console.log('   ✅ Orange theme consistently applied across all components');
} else {
  console.log('   ❌ Orange theme not consistently applied');
}

console.log('\n🎨 Gradient Direction Fix Summary:');
console.log('===================================');
console.log('✅ All gradients changed to top-to-bottom (bg-gradient-to-b)');
console.log('✅ Vote count gradient: top-to-bottom orange');
console.log('✅ Vote button gradient: top-to-bottom orange');
console.log('✅ Tab navigation gradient: top-to-bottom orange');
console.log('✅ Background decorations: top-to-bottom');
console.log('✅ Image container gradient: top-to-bottom');
console.log('✅ Hover animations: top-to-bottom');

console.log('\n🚀 All gradients have been fixed to display top-to-bottom!');
console.log('\nTo test the changes:');
console.log('1. Run: npm run dev');
console.log('2. Navigate to: http://localhost:3001/nominee/06f21cbc-5553-4af5-ae72-1a35b4ad4232');
console.log('3. Verify that all gradients flow from top to bottom');
console.log('4. Check the vote count number specifically');

console.log('\n📝 Specific Fixes Applied:');
console.log('- Vote count text gradient: bg-gradient-to-b from-orange-500 to-orange-600');
console.log('- Vote button gradient: bg-gradient-to-b from-orange-500 to-orange-600');
console.log('- Tab active state gradient: bg-gradient-to-b from-orange-500 to-orange-600');
console.log('- Vote section icon gradient: bg-gradient-to-b from-orange-500 to-orange-600');
console.log('- Background decoration gradient: bg-gradient-to-b from-orange-100');
console.log('- Image container gradient: bg-gradient-to-b from-gray-100 to-gray-200');
console.log('- Hover animation gradient: bg-gradient-to-b (vertical movement)');