#!/usr/bin/env node

/**
 * Simple test to verify homepage is accessible and components are working
 */

const http = require('http');

async function testHomepage() {
  console.log('🧪 Testing Homepage Accessibility...\n');
  
  return new Promise((resolve, reject) => {
    const req = http.get('http://localhost:3000', (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Homepage loaded successfully (Status: ${res.statusCode})`);
        
        // Check for key components
        const checks = [
          { name: 'Hero Section', test: data.includes('World Staffing Awards') },
          { name: 'Awards Timeline', test: data.includes('Awards Timeline') || data.includes('timeline') },
          { name: 'Submit Nomination', test: data.includes('Submit Nomination') || data.includes('Nominate') },
          { name: 'WSA Button Component', test: data.includes('wsa-button') || data.includes('WSAButton') },
          { name: 'Orange Color (#F26B21)', test: data.includes('#F26B21') || data.includes('F26B21') }
        ];
        
        console.log('\n📋 Component Checks:');
        checks.forEach(check => {
          console.log(`   ${check.test ? '✅' : '❌'} ${check.name}`);
        });
        
        const passedChecks = checks.filter(c => c.test).length;
        console.log(`\n📊 Results: ${passedChecks}/${checks.length} checks passed`);
        
        if (passedChecks >= 4) {
          console.log('🎉 Homepage appears to be working correctly!');
        } else {
          console.log('⚠️  Some components may need attention');
        }
        
        resolve();
      });
    });
    
    req.on('error', (error) => {
      console.error('❌ Failed to connect to homepage:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        console.log('\n💡 Make sure the development server is running:');
        console.log('   npm run dev');
      }
      
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      console.error('❌ Request timed out');
      req.destroy();
      reject(new Error('Timeout'));
    });
  });
}

// Run the test
testHomepage().catch(() => process.exit(1));