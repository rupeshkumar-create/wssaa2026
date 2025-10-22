#!/usr/bin/env node

/**
 * Script to help set up Vercel environment variables
 */

console.log('🚀 Vercel Environment Variables Setup');
console.log('====================================');

console.log('\n📋 Required Environment Variables for Vercel:');
console.log('Copy and paste these into your Vercel Dashboard → Settings → Environment Variables\n');

const envVars = {
  // Essential for admin panel
  'ADMIN_EMAILS': 'admin@worldstaffingawards.com',
  'ADMIN_PASSWORD_HASHES': '"\\$2b\\$12\\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"',
  'SERVER_SESSION_SECRET': '05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca',
  
  // Security
  'CRON_SECRET': '966be53c4a0af438dfac5333a982d56f',
  'SYNC_SECRET': 'ad673d564afffa2a3ab7e81fb9c86ddd',
};

const optionalVars = {
  // Database (optional - leave empty for demo mode)
  'SUPABASE_URL': 'https://your-project-id.supabase.co',
  'SUPABASE_SERVICE_ROLE_KEY': 'your_service_role_key_here',
  'NEXT_PUBLIC_SUPABASE_URL': 'https://your-project-id.supabase.co',
  
  // Integrations (optional)
  'HUBSPOT_ACCESS_TOKEN': 'your_hubspot_token_here',
  'LOOPS_API_KEY': 'your_loops_api_key_here',
};

console.log('🔴 REQUIRED (Minimum for admin panel to work):');
console.log('=' .repeat(50));
Object.entries(envVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n🟡 OPTIONAL (For full functionality):');
console.log('=' .repeat(50));
Object.entries(optionalVars).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log('\n📝 Instructions:');
console.log('1. Go to https://vercel.com/dashboard');
console.log('2. Select your project');
console.log('3. Go to Settings → Environment Variables');
console.log('4. Add each variable above');
console.log('5. Set Environment: Production, Preview, Development');
console.log('6. Click "Save"');
console.log('7. Go to Deployments → Latest → "..." → "Redeploy"');

console.log('\n🔑 Admin Login Credentials:');
console.log('Email: admin@worldstaffingawards.com');
console.log('Password: WSA2026Admin!Secure');

console.log('\n⚠️  Important Notes:');
console.log('- The password hash MUST include escaped $ characters (\\$)');
console.log('- If you don\'t have Supabase, leave database variables empty');
console.log('- After adding variables, you MUST redeploy for changes to take effect');

console.log('\n🧪 Test Your Deployment:');
console.log('1. Visit: https://your-app.vercel.app');
console.log('2. Visit: https://your-app.vercel.app/admin');
console.log('3. Login with credentials above');
console.log('4. Check: https://your-app.vercel.app/api/test-env');

console.log('\n✅ Success Indicators:');
console.log('- Home page loads without errors');
console.log('- Admin login page shows login form');
console.log('- Can login with provided credentials');
console.log('- Admin panel shows dashboard');

console.log('\n🆘 If Still Having Issues:');
console.log('Run: node scripts/diagnose-vercel-admin-issues.js');
console.log('This will help identify specific problems with your deployment.');

console.log('\n🎉 Once working, your admin panel will be at:');
console.log('https://your-app.vercel.app/admin');