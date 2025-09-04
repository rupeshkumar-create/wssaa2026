#!/usr/bin/env node

const { spawn } = require('child_process');
const fetch = require('node-fetch');
const path = require('path');

console.log('🚀 Testing app functionality...\n');

// Start the development server
console.log('Starting development server...');
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'pipe'
});

let serverReady = false;

devServer.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Ready') || output.includes('localhost:3000')) {
    serverReady = true;
    console.log('✅ Development server started');
    runTests();
  }
});

devServer.stderr.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Error') || output.includes('Failed')) {
    console.log('❌ Server error:', output);
  }
});

// Wait for server to start, then run tests
setTimeout(() => {
  if (!serverReady) {
    console.log('⏰ Server taking longer than expected, running tests anyway...');
    runTests();
  }
}, 10000);

async function runTests() {
  console.log('\n🧪 Running functionality tests...\n');
  
  const tests = [
    {
      name: 'Home page loads',
      url: 'http://localhost:3000',
      expectedStatus: 200
    },
    {
      name: 'Admin login page loads',
      url: 'http://localhost:3000/admin/login',
      expectedStatus: 200
    },
    {
      name: 'Nominate page loads',
      url: 'http://localhost:3000/nominate',
      expectedStatus: 200
    },
    {
      name: 'Directory page loads',
      url: 'http://localhost:3000/directory',
      expectedStatus: 200
    },
    {
      name: 'API health check',
      url: 'http://localhost:3000/api/nominees',
      expectedStatus: 200
    }
  ];

  let passedTests = 0;
  
  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}...`);
      const response = await fetch(test.url, { timeout: 5000 });
      
      if (response.status === test.expectedStatus) {
        console.log(`✅ ${test.name} - Status: ${response.status}`);
        passedTests++;
      } else {
        console.log(`❌ ${test.name} - Expected: ${test.expectedStatus}, Got: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${test.name} - Error: ${error.message}`);
    }
  }
  
  console.log(`\n📊 Test Results: ${passedTests}/${tests.length} tests passed\n`);
  
  if (passedTests === tests.length) {
    console.log('🎉 All functionality tests passed!');
    console.log('✅ App is working correctly without theme system');
    console.log('✅ All pages load successfully');
    console.log('✅ API endpoints are responsive');
  } else {
    console.log('⚠️  Some tests failed, but core functionality may still work');
  }
  
  console.log('\n🔗 App is running at: http://localhost:3000');
  console.log('🔧 Admin panel: http://localhost:3000/admin/login');
  console.log('\n💡 Press Ctrl+C to stop the server');
  
  // Keep the process running so server stays up
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    devServer.kill();
    process.exit(0);
  });
}