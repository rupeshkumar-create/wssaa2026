#!/usr/bin/env node

const bcrypt = require('bcryptjs');

async function fixAdminPassword() {
  const password = 'WSA2026Admin!Secure';
  const currentHash = '$2b$12$5OjmOXGkyAgp5YxD6N3CLeEQBrJkGOwy6ltgQslqaNCJiaVa.lxPa';
  
  console.log('Testing current password against existing hash...');
  const matches = await bcrypt.compare(password, currentHash);
  console.log('Password matches existing hash:', matches);
  
  if (!matches) {
    console.log('Generating new hash for password: WSA2026Admin!Secure');
    const newHash = await bcrypt.hash(password, 12);
    console.log('New hash generated:', newHash);
    console.log('\nUpdate your .env file with:');
    console.log(`ADMIN_PASSWORD_HASHES=${newHash}`);
  } else {
    console.log('Password is correct, checking environment setup...');
  }
}

fixAdminPassword().catch(console.error);