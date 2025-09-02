#!/usr/bin/env node

/**
 * Deploy and Verify Script
 * Deploys to Vercel and runs health checks
 */

const { execSync } = require('child_process');
const { healthCheck } = require('./health-check.js');

async function deployAndVerify() {
  console.log('🚀 Starting deployment and verification process...\n');
  
  try {
    // Step 1: Build locally first
    console.log('📦 Building locally...');
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Local build successful\n');
    
    // Step 2: Deploy to Vercel
    console.log('🚀 Deploying to Vercel...');
    execSync('vercel --prod', { stdio: 'inherit' });
    console.log('✅ Deployment successful\n');
    
    // Step 3: Wait a moment for deployment to be ready
    console.log('⏳ Waiting for deployment to be ready...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Step 4: Run health check on production
    console.log('🏥 Running production health check...');
    const isHealthy = await healthCheck('https://wass-steel.vercel.app', 'Production');
    
    if (isHealthy) {
      console.log('\n🎉 Deployment completed successfully!');
      console.log('🌐 Your app is live at: https://wass-steel.vercel.app');
      console.log('🔧 Admin panel: https://wass-steel.vercel.app/admin');
    } else {
      console.log('\n⚠️  Deployment completed but some health checks failed');
      console.log('Please check the logs above for details');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  deployAndVerify();
}

module.exports = { deployAndVerify };