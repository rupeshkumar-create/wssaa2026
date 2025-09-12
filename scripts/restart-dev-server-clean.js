const { spawn, exec } = require('child_process');

async function killExistingServer() {
  return new Promise((resolve) => {
    console.log('🔄 Killing existing dev server...');
    
    // Kill any existing Next.js dev server processes
    exec('pkill -f "next dev"', (error) => {
      if (error) {
        console.log('ℹ️ No existing dev server found');
      } else {
        console.log('✅ Existing dev server killed');
      }
      
      // Also try to kill any node processes running on port 3000
      exec('lsof -ti:3000 | xargs kill -9', (portError) => {
        if (portError) {
          console.log('ℹ️ Port 3000 is free');
        } else {
          console.log('✅ Freed up port 3000');
        }
        
        // Wait a moment for cleanup
        setTimeout(resolve, 2000);
      });
    });
  });
}

async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('🚀 Starting fresh dev server...');
    
    const devServer = spawn('npm', ['run', 'dev'], {
      cwd: process.cwd(),
      stdio: 'inherit' // This will show all output directly in the terminal
    });

    devServer.on('error', (error) => {
      console.error('❌ Failed to start dev server:', error);
      reject(error);
    });

    // Give it a moment to start
    setTimeout(() => {
      console.log('✅ Dev server started! Check the output above for the URL.');
      resolve(devServer);
    }, 3000);
  });
}

async function main() {
  console.log('🔄 Restarting dev server with clean slate...\n');
  
  try {
    // Step 1: Kill existing server
    await killExistingServer();
    
    // Step 2: Start fresh server
    const devServer = await startDevServer();
    
    console.log('\n🎯 Dev server restarted successfully!');
    console.log('📍 Visit: http://localhost:3000');
    console.log('🔧 Admin panel: http://localhost:3000/admin');
    console.log('\n💡 To test all fixes, run: node scripts/test-corrected-fixes.js');
    console.log('💡 To test Rupesh Kumar nomination, run: node scripts/test-direct-admin-nomination.js');
    
    // Keep the process alive so server stays running
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down dev server...');
      devServer.kill();
      process.exit(0);
    });
    
    // Keep the process running
    await new Promise(() => {});
    
  } catch (error) {
    console.error('❌ Failed to restart dev server:', error);
    process.exit(1);
  }
}

main().catch(console.error);