#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const path = require('path');

async function restartDevServer() {
  console.log('🔄 Restarting Development Server...\n');

  // Kill any existing Next.js processes
  console.log('1. Killing existing Next.js processes...');
  try {
    await new Promise((resolve, reject) => {
      exec('pkill -f "next dev" || pkill -f "npm run dev" || pkill -f "node.*next" || true', (error, stdout, stderr) => {
        if (error && !error.message.includes('No matching processes')) {
          console.log('   ⚠️  Error killing processes (this is usually fine):', error.message);
        } else {
          console.log('   ✅ Existing processes killed');
        }
        resolve();
      });
    });
  } catch (error) {
    console.log('   ⚠️  Could not kill existing processes (this is usually fine)');
  }

  // Wait a moment for processes to fully terminate
  console.log('2. Waiting for processes to terminate...');
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Clear Next.js cache
  console.log('3. Clearing Next.js cache...');
  try {
    await new Promise((resolve, reject) => {
      exec('rm -rf .next', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
        if (error) {
          console.log('   ⚠️  Could not clear .next cache:', error.message);
        } else {
          console.log('   ✅ .next cache cleared');
        }
        resolve();
      });
    });
  } catch (error) {
    console.log('   ⚠️  Could not clear cache (this is usually fine)');
  }

  // Start fresh development server
  console.log('4. Starting fresh development server...');
  console.log('   🚀 Running: npm run dev');
  console.log('   📍 Server will be available at: http://localhost:3000');
  console.log('   🔧 Form submission fixes are now active!');
  console.log('\n' + '='.repeat(60));
  console.log('🎯 READY TO TEST:');
  console.log('   • Navigate to: http://localhost:3000/nominate');
  console.log('   • Fill out the nomination form');
  console.log('   • Submit and verify it works without 500 errors');
  console.log('   • Check browser console for success messages');
  console.log('='.repeat(60) + '\n');

  // Start the dev server
  const devServer = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    shell: true
  });

  // Handle server exit
  devServer.on('close', (code) => {
    console.log(`\n🛑 Development server exited with code ${code}`);
  });

  // Handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    devServer.kill('SIGINT');
    process.exit(0);
  });
}

// Run the restart
restartDevServer().catch(console.error);