#!/usr/bin/env node

const bcrypt = require('bcryptjs');
require('dotenv').config();

async function debugAdminAuth() {
  console.log('=== Admin Authentication Debug ===\n');
  
  // Check environment variables
  console.log('Environment Variables:');
  console.log('ADMIN_EMAILS:', process.env.ADMIN_EMAILS);
  console.log('ADMIN_PASSWORD_HASHES:', process.env.ADMIN_PASSWORD_HASHES ? 'Set (hidden)' : 'Not set');
  console.log('SERVER_SESSION_SECRET:', process.env.SERVER_SESSION_SECRET ? 'Set (hidden)' : 'Not set');
  console.log();
  
  // Test credentials
  const testEmail = 'admin@worldstaffingawards.com';
  const testPassword = 'WSA2026Admin!Secure';
  
  console.log('Testing credentials:');
  console.log('Email:', testEmail);
  console.log('Password:', '***hidden***');
  console.log();
  
  // Simulate the validation logic
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
  const adminHashes = process.env.ADMIN_PASSWORD_HASHES?.split(',') || [];
  
  console.log('Parsed admin emails:', adminEmails);
  console.log('Number of password hashes:', adminHashes.length);
  console.log();
  
  const emailIndex = adminEmails.findIndex(adminEmail => adminEmail.trim() === testEmail);
  console.log('Email index found:', emailIndex);
  
  if (emailIndex === -1) {
    console.log('❌ Email not found in admin emails list');
    return;
  }
  
  const hash = adminHashes[emailIndex];
  console.log('Hash found:', hash ? 'Yes' : 'No');
  
  if (!hash) {
    console.log('❌ No password hash found for this email');
    return;
  }
  
  console.log('Testing password against hash...');
  const isValid = await bcrypt.compare(testPassword, hash.trim());
  console.log('Password validation result:', isValid);
  
  if (isValid) {
    console.log('✅ Credentials are valid!');
  } else {
    console.log('❌ Password does not match hash');
  }
}

debugAdminAuth().catch(console.error);