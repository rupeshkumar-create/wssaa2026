#!/usr/bin/env node

/**
 * Test script to verify local setup is working
 */

const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description}: OK`);
          resolve({ success: true, data });
        } else {
          console.log(`❌ ${description}: Failed (${res.statusCode})`);
          resolve({ success: false, status: res.statusCode });
        }
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ${description}: Error - ${err.message}`);
      resolve({ success: false, error: err.message });
    });

    req.setTimeout(5000, () => {
      console.log(`❌ ${description}: Timeout`);
      req.destroy();
      resolve({ success: false, error: 'timeout' });
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 Testing World Staffing Awards Local Setup...\n');

  const tests = [
    { path: '/', description: 'Homepage' },
    { path: '/api/test-env', description: 'Environment API' },
    { path: '/api/settings', description: 'Settings API' },
    { path: '/api/nominees', description: 'Nominees API' },
    { path: '/api/podium?category=Top%20Recruiter', description: 'Podium API' },
    { path: '/nominate', description: 'Nomination Form' },
    { path: '/directory', description: 'Directory Page' },
    { path: '/admin', description: 'Admin Panel' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.description);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(`\n📊 Test Results:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

  if (failed === 0) {
    console.log('\n🎉 All tests passed! Your local setup is working correctly.');
    console.log('\n🚀 You can now:');
    console.log('   • Visit http://localhost:3000 to see the homepage');
    console.log('   • Go to http://localhost:3000/nominate to submit nominations');
    console.log('   • Check http://localhost:3000/directory to browse nominees');
    console.log('   • Access http://localhost:3000/admin for admin features');
  } else {
    console.log('\n⚠️  Some tests failed. Check the server logs for more details.');
  }
}

runTests().catch(console.error);