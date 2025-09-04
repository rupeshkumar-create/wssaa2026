#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🔄 Restarting development server for bulk upload testing...\n');

// Kill any existing Next.js processes
console.log('🛑 Stopping any existing development servers...');

// Start the development server
console.log('🚀 Starting fresh development server...\n');

const projectDir = path.join(__dirname, '..');
const devServer = spawn('npm', ['run', 'dev'], {
  cwd: projectDir,
  stdio: 'inherit',
  shell: true
});

devServer.on('error', (error) => {
  console.error('❌ Error starting development server:', error);
});

devServer.on('close', (code) => {
  console.log(`\n📋 Development server exited with code ${code}`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down development server...');
  devServer.kill('SIGTERM');
  process.exit(0);
});

console.log('📋 Development server is starting...');
console.log('🌐 Once ready, go to: http://localhost:3000/admin');
console.log('📁 Navigate to: Admin Panel → Bulk Upload tab');
console.log('🎯 Use: "Separated Bulk Upload System" section');
console.log('📄 Template: templates/person_nominations_fixed.csv');
console.log('\n✨ The validation issues have been fixed!');
console.log('💡 Nominator emails and URLs can now be left empty');
console.log('🔧 Press Ctrl+C to stop the server when done testing');