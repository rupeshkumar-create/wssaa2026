#!/usr/bin/env node

/**
 * Setup HubSpot sync environment variables in Vercel
 */

const { execSync } = require('child_process');

console.log('🔧 Setting up HubSpot Sync in Vercel');
console.log('====================================');
console.log('');

/**
 * Check if Vercel CLI is installed
 */
function checkVercelCLI() {
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI is installed');
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI is not installed');
    console.log('');
    console.log('To install Vercel CLI:');
    console.log('  npm i -g vercel');
    console.log('');
    return false;
  }
}

/**
 * Check if user is logged in to Vercel
 */
function checkVercelAuth() {
  try {
    execSync('vercel whoami', { stdio: 'pipe' });
    console.log('✅ Logged in to Vercel');
    return true;
  } catch (error) {
    console.log('❌ Not logged in to Vercel');
    console.log('');
    console.log('To login:');
    console.log('  vercel login');
    console.log('');
    return false;
  }
}

/**
 * Set environment variable
 */
function setEnvironmentVariable(name, value, environment = 'production') {
  try {
    console.log(`Setting ${name}=${value} for ${environment}...`);
    
    // Use vercel env add command
    const command = `echo "${value}" | vercel env add ${name} ${environment}`;
    execSync(command, { stdio: 'inherit' });
    
    console.log(`✅ Set ${name} for ${environment}`);
    return true;
  } catch (error) {
    console.log(`❌ Failed to set ${name}:`, error.message);
    return false;
  }
}

/**
 * Main setup function
 */
function setupHubSpotSync() {
  console.log('1️⃣ Checking prerequisites...');
  
  if (!checkVercelCLI()) {
    return false;
  }
  
  if (!checkVercelAuth()) {
    return false;
  }
  
  console.log('');
  console.log('2️⃣ Setting up HubSpot environment variables...');
  
  // Set the critical environment variable
  const success = setEnvironmentVariable('HUBSPOT_SYNC_ENABLED', 'true', 'production');
  
  if (success) {
    console.log('');
    console.log('3️⃣ Redeploying application...');
    
    try {
      execSync('vercel --prod', { stdio: 'inherit' });
      console.log('✅ Application redeployed successfully');
      
      console.log('');
      console.log('🎉 HubSpot sync setup completed!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Wait for deployment to complete');
      console.log('2. Test the environment: curl https://wssaa2026.vercel.app/api/test-env');
      console.log('3. Test HubSpot sync: node scripts/test-production-hubspot-sync.js');
      console.log('4. Submit a test nomination to verify sync is working');
      
      return true;
    } catch (error) {
      console.log('❌ Deployment failed:', error.message);
      console.log('');
      console.log('You can manually redeploy by running:');
      console.log('  vercel --prod');
      return false;
    }
  }
  
  return false;
}

/**
 * Manual setup guide
 */
function showManualSetup() {
  console.log('📋 Manual Setup Guide');
  console.log('====================');
  console.log('');
  console.log('If the automatic setup failed, you can set up manually:');
  console.log('');
  console.log('1. Go to https://vercel.com/dashboard');
  console.log('2. Select your wssaa2026 project');
  console.log('3. Go to Settings → Environment Variables');
  console.log('4. Add this variable:');
  console.log('   Name: HUBSPOT_SYNC_ENABLED');
  console.log('   Value: true');
  console.log('   Environment: Production');
  console.log('5. Click Save');
  console.log('6. Redeploy your application');
  console.log('');
  console.log('Required environment variables for full functionality:');
  console.log('- HUBSPOT_SYNC_ENABLED=true');
  console.log('- HUBSPOT_ACCESS_TOKEN=your_token');
  console.log('- SUPABASE_URL=your_supabase_url');
  console.log('- SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('- SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key');
  console.log('- ADMIN_PASSWORD_HASH=your_admin_hash');
}

// Run setup
console.log('Starting HubSpot sync setup...');
console.log('');

const success = setupHubSpotSync();

if (!success) {
  console.log('');
  showManualSetup();
}

console.log('');
console.log('For more details, see: HUBSPOT_SYNC_VERCEL_FIX.md');