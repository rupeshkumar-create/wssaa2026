#!/usr/bin/env node

/**
 * Health Check Script
 * Verifies that the application is running correctly both locally and in production
 */

const https = require('https');
const http = require('http');

const ENDPOINTS = [
  '/api/test-env',
  '/api/stats',
  '/api/nominees',
  '/api/settings'
];

async function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          data: data,
          headers: res.headers
        });
      });
    }).on('error', reject);
  });
}

async function checkEndpoint(baseUrl, endpoint) {
  const url = `${baseUrl}${endpoint}`;
  console.log(`🔍 Checking ${endpoint}...`);
  
  try {
    const response = await makeRequest(url);
    
    if (response.status === 200) {
      console.log(`✅ ${endpoint} - OK (${response.status})`);
      return true;
    } else {
      console.log(`⚠️  ${endpoint} - Warning (${response.status})`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${endpoint} - Error: ${error.message}`);
    return false;
  }
}

async function healthCheck(baseUrl, environment) {
  console.log(`\n🏥 Health Check - ${environment}`);
  console.log(`🌐 Base URL: ${baseUrl}`);
  console.log('=' .repeat(50));
  
  let passCount = 0;
  let totalCount = ENDPOINTS.length;
  
  for (const endpoint of ENDPOINTS) {
    const success = await checkEndpoint(baseUrl, endpoint);
    if (success) passCount++;
  }
  
  console.log('=' .repeat(50));
  console.log(`📊 Results: ${passCount}/${totalCount} endpoints healthy`);
  
  if (passCount === totalCount) {
    console.log(`🎉 ${environment} is fully operational!`);
    return true;
  } else {
    console.log(`⚠️  ${environment} has some issues`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const environment = args[0] || 'both';
  
  console.log('🏥 World Staffing Awards - Health Check');
  
  let allHealthy = true;
  
  if (environment === 'local' || environment === 'both') {
    const localHealthy = await healthCheck('http://localhost:3000', 'Local Development');
    allHealthy = allHealthy && localHealthy;
  }
  
  if (environment === 'production' || environment === 'both') {
    const prodHealthy = await healthCheck('https://wass-steel.vercel.app', 'Production');
    allHealthy = allHealthy && prodHealthy;
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (allHealthy) {
    console.log('🎉 All systems operational!');
    process.exit(0);
  } else {
    console.log('⚠️  Some systems need attention');
    process.exit(1);
  }
}

// Handle command line usage
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Health check failed:', error.message);
    process.exit(1);
  });
}

module.exports = { healthCheck, checkEndpoint };