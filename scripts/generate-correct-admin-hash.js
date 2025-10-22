#!/usr/bin/env node

/**
 * Generate Correct Admin Password Hash
 * Creates a proper bcrypt hash for the admin password
 */

const bcrypt = require('bcryptjs');

async function generateAdminHash() {
  console.log('🔑 Generating Admin Password Hash...\n');
  
  const password = 'admin123'; // Default admin password
  const email = 'admin@worldstaffingawards.com';
  
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
  
  // Generate hash with salt rounds 12
  const hash = await bcrypt.hash(password, 12);
  console.log(`\n✅ Generated Hash: ${hash}`);
  
  // Verify the hash works
  const isValid = await bcrypt.compare(password, hash);
  console.log(`✅ Hash Verification: ${isValid ? 'PASS' : 'FAIL'}`);
  
  console.log('\n📋 Vercel Environment Variables:');
  console.log('ADMIN_EMAILS=' + email);
  console.log('ADMIN_PASSWORD_HASHES=' + hash);
  
  console.log('\n🚀 Instructions:');
  console.log('1. Copy the hash above');
  console.log('2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('3. Update ADMIN_PASSWORD_HASHES with the new hash (no quotes, no escaping)');
  console.log('4. Redeploy your application');
  
  return hash;
}

generateAdminHash().catch(console.error);