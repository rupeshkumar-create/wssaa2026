#!/usr/bin/env node

/**
 * Fix HubSpot sync issues in production
 * This script will diagnose and fix common HubSpot sync problems
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://wssaa2026.vercel.app';

console.log('🔧 Fixing HubSpot Sync Issues');
console.log('=============================');
console.log(`Target URL: ${VERCEL_URL}`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WSA-Fix-Script/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }

    req.end();
  });
}

/**
 * Check current environment configuration
 */
async function checkEnvironment() {
  console.log('1️⃣ Checking Environment Configuration...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/test-env`);
    
    if (response.status === 200) {
      console.log('✅ Environment API accessible');
      
      const env = response.data;
      console.log('📊 Current configuration:');
      console.log(`   - HubSpot Enabled: ${env.hubspot?.enabled || false}`);
      console.log(`   - HubSpot Token: ${env.hubspot?.hasToken ? 'Present' : 'Missing'}`);
      console.log(`   - Loops Enabled: ${env.loops?.enabled || false}`);
      console.log(`   - Loops Token: ${env.loops?.hasToken ? 'Present' : 'Missing'}`);
      
      return env;
    } else {
      console.log('❌ Environment API failed:', response.status);
      return null;
    }
  } catch (error) {
    console.log('❌ Environment check failed:', error.message);
    return null;
  }
}

/**
 * Setup HubSpot custom properties
 */
async function setupHubSpotProperties() {
  console.log('2️⃣ Setting up HubSpot Custom Properties...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/setup-properties`, {
      method: 'POST'
    });
    
    if (response.status === 200) {
      console.log('✅ HubSpot properties setup completed');
      console.log('📊 Setup result:', response.data);
      return true;
    } else {
      console.log('❌ HubSpot properties setup failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Properties setup failed:', error.message);
    return false;
  }
}

/**
 * Process pending HubSpot sync items
 */
async function processPendingSync() {
  console.log('3️⃣ Processing Pending HubSpot Sync Items...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/run`, {
      method: 'POST',
      body: { 
        force: true,
        processAll: true 
      }
    });
    
    if (response.status === 200) {
      console.log('✅ Pending sync processing completed');
      console.log('📊 Sync result:', response.data);
      return true;
    } else {
      console.log('❌ Pending sync processing failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ Pending sync processing failed:', error.message);
    return false;
  }
}

/**
 * Test HubSpot connection
 */
async function testHubSpotConnection() {
  console.log('4️⃣ Testing HubSpot Connection...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/sync/hubspot/test`, {
      method: 'GET'
    });
    
    if (response.status === 200) {
      console.log('✅ HubSpot connection test passed');
      console.log('📊 Connection info:', response.data);
      return true;
    } else {
      console.log('❌ HubSpot connection test failed:', response.status);
      console.log('📊 Error:', response.data);
      return false;
    }
  } catch (error) {
    console.log('❌ HubSpot connection test failed:', error.message);
    return false;
  }
}

/**
 * Verify sync functionality with test data
 */
async function verifySync() {
  console.log('5️⃣ Verifying Sync Functionality...');
  
  const testData = {
    type: 'person',
    categoryGroupId: '1',
    subcategoryId: '1',
    nominator: {
      firstname: 'Sync',
      lastname: 'Test',
      email: 'sync-test@worldstaffingawards.com',
      company: 'Test Sync Company',
      jobTitle: 'Sync Manager',
      linkedin: 'https://linkedin.com/in/sync-test',
      phone: '+1234567890',
      country: 'United States'
    },
    nominee: {
      firstname: 'Nominee',
      lastname: 'Test',
      email: 'nominee-test@worldstaffingawards.com',
      company: 'Nominee Test Company',
      jobtitle: 'Test Developer',
      linkedin: 'https://linkedin.com/in/nominee-test',
      phone: '+0987654321',
      country: 'Canada',
      headshotUrl: 'https://example.com/test-headshot.jpg',
      whyMe: 'Test sync verification',
      bio: 'Test sync bio',
      achievements: 'Test sync achievements'
    }
  };

  try {
    const response = await makeRequest(`${VERCEL_URL}/api/nomination/submit`, {
      method: 'POST',
      body: testData
    });
    
    if (response.status === 201) {
      console.log('✅ Test nomination submitted successfully');
      
      const result = response.data;
      let syncIssues = [];
      
      // Check nominator sync
      if (result.hubspotSync?.nominatorSynced) {
        console.log('✅ Nominator synced to HubSpot');
      } else {
        console.log('❌ Nominator NOT synced to HubSpot');
        syncIssues.push('nominator');
      }
      
      // Check nominee sync
      if (result.hubspotSync?.nomineeSynced) {
        console.log('✅ Nominee synced to HubSpot');
      } else {
        console.log('❌ Nominee NOT synced to HubSpot');
        syncIssues.push('nominee');
      }
      
      // Check outbox
      if (result.hubspotSync?.outboxCreated) {
        console.log('✅ HubSpot outbox entry created');
      } else {
        console.log('❌ HubSpot outbox entry NOT created');
        syncIssues.push('outbox');
      }
      
      return {
        success: syncIssues.length === 0,
        issues: syncIssues,
        nominationId: result.nominationId
      };
    } else {
      console.log('❌ Test nomination failed:', response.status);
      console.log('📊 Error:', response.data);
      return { success: false, issues: ['submission'], nominationId: null };
    }
  } catch (error) {
    console.log('❌ Sync verification failed:', error.message);
    return { success: false, issues: ['error'], nominationId: null };
  }
}

/**
 * Generate environment configuration guide
 */
function generateConfigGuide(env) {
  console.log('📋 Environment Configuration Guide');
  console.log('=================================');
  
  if (!env?.hubspot?.enabled) {
    console.log('');
    console.log('❌ HubSpot sync is disabled. To enable:');
    console.log('   1. Set HUBSPOT_SYNC_ENABLED=true in Vercel environment variables');
    console.log('   2. Set HUBSPOT_ACCESS_TOKEN=your_token in Vercel environment variables');
    console.log('   3. Redeploy the application');
    console.log('');
  }
  
  if (!env?.hubspot?.hasToken) {
    console.log('❌ HubSpot token is missing. To fix:');
    console.log('   1. Go to HubSpot Developer Account');
    console.log('   2. Create a private app with required scopes:');
    console.log('      - crm.objects.contacts.read');
    console.log('      - crm.objects.contacts.write');
    console.log('      - crm.objects.companies.read');
    console.log('      - crm.objects.companies.write');
    console.log('      - crm.schemas.contacts.read');
    console.log('      - crm.schemas.contacts.write');
    console.log('      - crm.schemas.companies.read');
    console.log('      - crm.schemas.companies.write');
    console.log('   3. Copy the access token');
    console.log('   4. Set HUBSPOT_ACCESS_TOKEN in Vercel environment variables');
    console.log('   5. Redeploy the application');
    console.log('');
  }
  
  console.log('✅ Required Vercel Environment Variables:');
  console.log('   - HUBSPOT_SYNC_ENABLED=true');
  console.log('   - HUBSPOT_ACCESS_TOKEN=your_hubspot_token');
  console.log('   - SUPABASE_URL=your_supabase_url');
  console.log('   - SUPABASE_ANON_KEY=your_supabase_anon_key');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key');
  console.log('');
}

/**
 * Main fix function
 */
async function runFixes() {
  console.log('🚀 Starting HubSpot Sync Fixes...\n');
  
  const results = {
    environment: null,
    properties: false,
    pendingSync: false,
    connection: false,
    verification: null
  };
  
  // Step 1: Check environment
  results.environment = await checkEnvironment();
  console.log('');
  
  if (!results.environment) {
    console.log('❌ Cannot proceed without environment access.');
    generateConfigGuide(null);
    return results;
  }
  
  generateConfigGuide(results.environment);
  
  if (!results.environment.hubspot?.enabled || !results.environment.hubspot?.hasToken) {
    console.log('❌ HubSpot is not properly configured. Please fix environment variables first.');
    return results;
  }
  
  // Step 2: Setup properties
  results.properties = await setupHubSpotProperties();
  console.log('');
  
  // Step 3: Process pending sync
  results.pendingSync = await processPendingSync();
  console.log('');
  
  // Step 4: Test connection
  results.connection = await testHubSpotConnection();
  console.log('');
  
  // Step 5: Verify sync
  results.verification = await verifySync();
  console.log('');
  
  // Summary
  console.log('📋 Fix Results Summary');
  console.log('=====================');
  console.log(`Environment: ${results.environment ? '✅' : '❌'}`);
  console.log(`Properties Setup: ${results.properties ? '✅' : '❌'}`);
  console.log(`Pending Sync: ${results.pendingSync ? '✅' : '❌'}`);
  console.log(`Connection Test: ${results.connection ? '✅' : '❌'}`);
  console.log(`Sync Verification: ${results.verification?.success ? '✅' : '❌'}`);
  
  if (results.verification?.issues?.length > 0) {
    console.log(`   Issues found: ${results.verification.issues.join(', ')}`);
  }
  
  const allGood = results.properties && results.pendingSync && results.connection && results.verification?.success;
  
  console.log('');
  if (allGood) {
    console.log('🎉 All fixes applied successfully! HubSpot sync should now work correctly.');
    console.log('');
    console.log('✅ Next steps:');
    console.log('   1. Test form submission on your live site');
    console.log('   2. Check HubSpot for new contacts with WSA tags');
    console.log('   3. Monitor the admin panel for sync status');
  } else {
    console.log('⚠️ Some issues remain. Please check the logs and configuration.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify all environment variables are set correctly');
    console.log('   2. Check HubSpot token permissions');
    console.log('   3. Ensure Supabase connection is working');
    console.log('   4. Review application logs in Vercel');
  }
  
  return results;
}

// Run fixes if this script is executed directly
if (require.main === module) {
  runFixes().catch(console.error);
}

module.exports = { runFixes };