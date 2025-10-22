#!/usr/bin/env node

/**
 * Debug Vercel Admin Authentication
 * Tests admin login functionality on production
 */

const bcrypt = require('bcryptjs');

async function testAdminAuth() {
  console.log('🔍 Debugging Vercel Admin Authentication...\n');
  
  // Test password: "admin123" (default from template)
  const testPassword = 'admin123';
  const testEmail = 'admin@worldstaffingawards.com';
  
  // Expected hash from template (with proper escaping)
  const expectedHash = '$2b$12$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti';
  
  console.log('📋 Test Configuration:');
  console.log(`Email: ${testEmail}`);
  console.log(`Password: ${testPassword}`);
  console.log(`Expected Hash: ${expectedHash}\n`);
  
  // Test bcrypt comparison locally
  console.log('🧪 Testing bcrypt comparison locally...');
  try {
    const isValid = await bcrypt.compare(testPassword, expectedHash);
    console.log(`✅ Local bcrypt test: ${isValid ? 'PASS' : 'FAIL'}\n`);
  } catch (error) {
    console.log(`❌ Local bcrypt test failed: ${error.message}\n`);
  }
  
  // Test production API
  console.log('🌐 Testing production API...');
  const productionUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://world-staffing-awards.vercel.app';
  
  try {
    const response = await fetch(`${productionUrl}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    const result = await response.json();
    
    console.log(`Status: ${response.status}`);
    console.log(`Response:`, result);
    
    if (response.ok && result.success) {
      console.log('✅ Production login: SUCCESS');
    } else {
      console.log('❌ Production login: FAILED');
      
      // Additional debugging
      console.log('\n🔧 Debugging suggestions:');
      console.log('1. Check ADMIN_EMAILS environment variable in Vercel');
      console.log('2. Check ADMIN_PASSWORD_HASHES environment variable in Vercel');
      console.log('3. Ensure hash is not double-escaped (should start with $2b$12$)');
      console.log('4. Check SERVER_SESSION_SECRET is set');
    }
    
  } catch (error) {
    console.log(`❌ Production API test failed: ${error.message}`);
  }
  
  // Generate new hash for debugging
  console.log('\n🔑 Generating fresh hash for comparison...');
  const newHash = await bcrypt.hash(testPassword, 12);
  console.log(`Fresh hash: ${newHash}`);
  
  // Test with fresh hash
  const freshTest = await bcrypt.compare(testPassword, newHash);
  console.log(`Fresh hash test: ${freshTest ? 'PASS' : 'FAIL'}`);
}

// Test environment variable parsing
function testEnvParsing() {
  console.log('\n📊 Environment Variable Parsing Test:');
  
  // Simulate different hash formats
  const formats = [
    '$2b$12$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti',
    '\\$2b\\$12\\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti',
    '\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti'
  ];
  
  formats.forEach((format, index) => {
    console.log(`Format ${index + 1}: ${format}`);
    console.log(`Length: ${format.length}`);
    console.log(`Starts with $2b: ${format.startsWith('$2b')}`);
    console.log('---');
  });
}

async function main() {
  await testAdminAuth();
  testEnvParsing();
  
  console.log('\n💡 Quick Fix Instructions:');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Find ADMIN_PASSWORD_HASHES');
  console.log('3. Ensure the value is: $2b$12$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti');
  console.log('4. No quotes, no escaping - just the raw hash');
  console.log('5. Redeploy your application');
}

main().catch(console.error);