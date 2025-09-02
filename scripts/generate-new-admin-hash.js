#!/usr/bin/env node

const bcrypt = require('bcryptjs');

async function generateNewHash() {
  const password = 'WSA2026Admin!Secure';
  console.log('Generating new hash for password:', password);
  
  const hash = await bcrypt.hash(password, 12);
  console.log('New hash generated:', hash);
  
  // Test the new hash
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification test:', isValid ? '✅ Valid' : '❌ Invalid');
  
  console.log('\nUpdate your .env file with:');
  console.log(`ADMIN_PASSWORD_HASHES=${hash}`);
}

generateNewHash().catch(console.error);