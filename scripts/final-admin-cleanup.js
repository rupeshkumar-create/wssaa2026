#!/usr/bin/env node

/**
 * Final Admin Panel Cleanup - Remove all vote references
 */

const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(__dirname, '../src/app/admin/page.tsx');

console.log('🧹 Final admin panel cleanup...');

try {
  let content = fs.readFileSync(adminPagePath, 'utf8');
  
  // Remove vote-related interface fields
  content = content.replace(/votes\?\: number;?\s*/g, '');
  content = content.replace(/additionalVotes\?\: number;?\s*/g, '');
  content = content.replace(/totalVotes\: number;?\s*/g, '');
  content = content.replace(/totalVoters\: number;?\s*/g, '');
  content = content.replace(/averageVotesPerNominee\: number;?\s*/g, '');
  
  // Remove vote calculations and displays
  content = content.replace(/\{.*?votes.*?\}/g, '{0}');
  content = content.replace(/\(n\.votes \|\| 0\).*?\+ \(n\.additionalVotes \|\| 0\)/g, '1');
  content = content.replace(/nomination\.votes.*?\+ \(nomination\.additionalVotes.*?\)/g, '0');
  content = content.replace(/n\.votes.*?\+ \(n\.additionalVotes.*?\)/g, '1');
  
  // Replace vote-related text
  content = content.replace(/Total Votes:/g, 'Total Nominees:');
  content = content.replace(/Real Votes:/g, 'Live Nominees:');
  content = content.replace(/Avg Votes:/g, 'Status:');
  content = content.replace(/votes/g, 'nominees');
  content = content.replace(/Active:/g, 'Live:');
  
  // Clean up vote-related calculations in analytics
  content = content.replace(/votes: 0/g, '');
  content = content.replace(/\{stats\.nominees\}/g, '{stats.approved}');
  
  // Remove vote-related imports and components
  content = content.replace(/import.*ManualVoteUpdate.*\n/g, '');
  
  // Clean up any remaining vote references in strings
  content = content.replace(/".*votes.*"/g, '"nominees"');
  content = content.replace(/'.*votes.*'/g, "'nominees'");
  
  fs.writeFileSync(adminPagePath, content);
  
  console.log('✅ Final admin cleanup completed!');
  console.log('📋 Removed:');
  console.log('  - All vote count references');
  console.log('  - Vote calculation logic');
  console.log('  - Vote-related interface fields');
  console.log('  - Manual vote components');
  
} catch (error) {
  console.error('❌ Error in final cleanup:', error.message);
  process.exit(1);
}