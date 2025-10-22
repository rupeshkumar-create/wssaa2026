#!/usr/bin/env node

/**
 * Diagnostic script for Vercel admin panel issues
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function diagnoseVercelIssues() {
  console.log('🔍 Vercel Admin Panel Diagnostic Tool');
  console.log('====================================');
  
  try {
    // Get Vercel URL
    const vercelUrl = await askQuestion('Enter your Vercel app URL (e.g., https://your-app.vercel.app): ');
    
    if (!vercelUrl) {
      console.log('❌ Please provide your Vercel URL to continue.');
      process.exit(1);
    }
    
    const baseUrl = vercelUrl.replace(/\/$/, ''); // Remove trailing slash
    
    console.log(`\n🧪 Testing: ${baseUrl}`);
    console.log('=' .repeat(50));
    
    // Test 1: Basic connectivity
    console.log('\n1. 🌐 Testing Basic Connectivity');
    console.log('--------------------------------');
    
    try {
      const homeResponse = await fetch(baseUrl);
      if (homeResponse.ok) {
        console.log('✅ Home page loads successfully');
        console.log(`   Status: ${homeResponse.status}`);
      } else {
        console.log(`❌ Home page failed: ${homeResponse.status} ${homeResponse.statusText}`);
      }
    } catch (error) {
      console.log(`❌ Cannot reach ${baseUrl}: ${error.message}`);
      console.log('   Check if the URL is correct and the site is deployed');
    }
    
    // Test 2: Environment variables
    console.log('\n2. 🔧 Testing Environment Variables');
    console.log('-----------------------------------');
    
    try {
      const envResponse = await fetch(`${baseUrl}/api/test-env`);
      if (envResponse.ok) {
        const envData = await envResponse.json();
        console.log('✅ Environment test endpoint accessible');
        
        // Check critical variables
        const criticalVars = [
          'ADMIN_EMAILS',
          'ADMIN_PASSWORD_HASHES', 
          'SERVER_SESSION_SECRET'
        ];
        
        criticalVars.forEach(varName => {
          if (envData[varName]) {
            console.log(`   ✅ ${varName}: Set`);
          } else {
            console.log(`   ❌ ${varName}: Missing`);
          }
        });
        
        // Check database variables
        if (envData.SUPABASE_URL) {
          console.log('   ✅ SUPABASE_URL: Set (Database mode)');
        } else {
          console.log('   ⚠️  SUPABASE_URL: Not set (Demo mode)');
        }
        
      } else {
        console.log(`❌ Environment test failed: ${envResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Environment test error: ${error.message}`);
    }
    
    // Test 3: Admin login page
    console.log('\n3. 🔐 Testing Admin Login Page');
    console.log('------------------------------');
    
    try {
      const adminResponse = await fetch(`${baseUrl}/admin`);
      if (adminResponse.ok) {
        console.log('✅ Admin login page loads');
        console.log(`   Status: ${adminResponse.status}`);
      } else {
        console.log(`❌ Admin login page failed: ${adminResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Admin login page error: ${error.message}`);
    }
    
    // Test 4: Admin API endpoint
    console.log('\n4. 🔑 Testing Admin API');
    console.log('-----------------------');
    
    try {
      const loginResponse = await fetch(`${baseUrl}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@worldstaffingawards.com',
          password: 'WSA2026Admin!Secure'
        })
      });
      
      if (loginResponse.ok) {
        console.log('✅ Admin login API works');
        console.log('   Credentials are correctly configured');
      } else {
        const errorText = await loginResponse.text();
        console.log(`❌ Admin login failed: ${loginResponse.status}`);
        console.log(`   Error: ${errorText}`);
        
        if (loginResponse.status === 401) {
          console.log('   🔧 Fix: Check ADMIN_PASSWORD_HASHES environment variable');
          console.log('   Make sure it includes escaped $ characters: \\$2b\\$12\\$...');
        }
      }
    } catch (error) {
      console.log(`❌ Admin login API error: ${error.message}`);
    }
    
    // Test 5: Database connectivity
    console.log('\n5. 🗄️  Testing Database Connectivity');
    console.log('------------------------------------');
    
    try {
      const nomineesResponse = await fetch(`${baseUrl}/api/nominees`);
      if (nomineesResponse.ok) {
        const nomineesData = await nomineesResponse.json();
        console.log('✅ Database/API connection works');
        console.log(`   Found ${nomineesData.data?.length || 0} nominees`);
        
        if (nomineesData.message?.includes('Demo data')) {
          console.log('   ℹ️  Running in demo mode (no database)');
        }
      } else {
        console.log(`❌ Database connection failed: ${nomineesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Database test error: ${error.message}`);
    }
    
    // Summary and recommendations
    console.log('\n📋 Diagnostic Summary');
    console.log('=====================');
    
    console.log('\n🔧 Common Fixes:');
    console.log('1. Environment Variables Missing:');
    console.log('   → Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('   → Add: ADMIN_EMAILS, ADMIN_PASSWORD_HASHES, SERVER_SESSION_SECRET');
    
    console.log('\n2. Password Hash Issues:');
    console.log('   → Ensure ADMIN_PASSWORD_HASHES uses escaped $ characters:');
    console.log('   → "\\$2b\\$12\\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"');
    
    console.log('\n3. After Adding Variables:');
    console.log('   → Go to Deployments tab in Vercel');
    console.log('   → Click "..." on latest deployment → "Redeploy"');
    
    console.log('\n4. Admin Login Credentials:');
    console.log('   → Email: admin@worldstaffingawards.com');
    console.log('   → Password: WSA2026Admin!Secure');
    
    console.log('\n📞 Need More Help?');
    console.log('- Check Vercel build logs for specific errors');
    console.log('- Verify environment variables are set for Production environment');
    console.log('- Test locally first with same environment variables');
    
    console.log('\n✅ Next Steps:');
    console.log('1. Fix any issues identified above');
    console.log('2. Redeploy your Vercel app');
    console.log('3. Test admin login again');
    console.log(`4. Visit: ${baseUrl}/admin`);
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error.message);
  } finally {
    rl.close();
  }
}

// Run the diagnostic
diagnoseVercelIssues();