#!/usr/bin/env node

/**
 * Clean Admin Panel - Remove vote counts and old data
 */

const fs = require('fs');
const path = require('path');

const adminPagePath = path.join(__dirname, '../src/app/admin/page.tsx');

console.log('🧹 Cleaning admin panel...');

try {
  let content = fs.readFileSync(adminPagePath, 'utf8');
  
  // Remove fetchEnhancedStats calls
  content = content.replace(/await fetchEnhancedStats\(\);\s*/g, '');
  content = content.replace(/fetchEnhancedStats\(\);\s*/g, '');
  
  // Remove checkConnectionStatus calls
  content = content.replace(/checkConnectionStatus\(\);\s*/g, '');
  
  // Remove enhancedStats references
  content = content.replace(/enhancedStats\?\./g, 'stats.');
  content = content.replace(/enhancedStats\|\|/g, '');
  
  // Remove vote-related displays in admin
  content = content.replace(/Total Votes:.*?\n/g, '');
  content = content.replace(/totalVotes.*?\n/g, '');
  
  // Clean up any remaining vote references
  content = content.replace(/votes.*?total/g, 'nominees');
  content = content.replace(/real \+ .*? additional/g, 'live nominees');
  
  fs.writeFileSync(adminPagePath, content);
  
  console.log('✅ Admin panel cleaned successfully!');
  console.log('📋 Changes made:');
  console.log('  - Removed vote count displays');
  console.log('  - Removed enhanced stats calls');
  console.log('  - Cleaned up old data references');
  console.log('  - Simplified admin interface');
  
} catch (error) {
  console.error('❌ Error cleaning admin panel:', error.message);
  process.exit(1);
}