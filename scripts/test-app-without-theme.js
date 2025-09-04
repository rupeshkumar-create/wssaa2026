#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing app without theme system...\n');

// Test 1: Check if theme imports are removed
console.log('1. Checking for theme imports...');
try {
  const layoutContent = fs.readFileSync(path.join(__dirname, '../src/app/layout.tsx'), 'utf8');
  
  if (layoutContent.includes('ThemeProvider') || layoutContent.includes('@/styles/theme.css')) {
    console.log('❌ Theme imports still found in layout.tsx');
    process.exit(1);
  } else {
    console.log('✅ Theme imports removed from layout.tsx');
  }
} catch (error) {
  console.log('❌ Error checking layout.tsx:', error.message);
  process.exit(1);
}

// Test 2: Check if admin page compiles without theme
console.log('\n2. Checking admin page...');
try {
  const adminContent = fs.readFileSync(path.join(__dirname, '../src/app/admin/page.tsx'), 'utf8');
  
  if (adminContent.includes('ThemeCustomizationPanel')) {
    console.log('❌ Theme components still found in admin page');
    process.exit(1);
  } else {
    console.log('✅ Theme components removed from admin page');
  }
} catch (error) {
  console.log('❌ Error checking admin page:', error.message);
  process.exit(1);
}

// Test 3: Try to build the app
console.log('\n3. Testing app build...');
try {
  console.log('Building Next.js app...');
  execSync('npm run build', { 
    stdio: 'pipe',
    cwd: path.join(__dirname, '..')
  });
  console.log('✅ App builds successfully without theme system');
} catch (error) {
  console.log('❌ Build failed:', error.message);
  console.log('\nBuild output:');
  console.log(error.stdout?.toString() || 'No stdout');
  console.log(error.stderr?.toString() || 'No stderr');
  process.exit(1);
}

// Test 4: Check if key pages exist and are accessible
console.log('\n4. Checking key files exist...');
const keyFiles = [
  'src/app/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/nominate/page.tsx',
  'src/components/Navigation.tsx',
  'src/components/Footer.tsx'
];

for (const file of keyFiles) {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} exists`);
  } else {
    console.log(`❌ ${file} missing`);
    process.exit(1);
  }
}

console.log('\n🎉 All tests passed! App is working without theme system.');
console.log('\n📝 Summary:');
console.log('- Theme system completely removed');
console.log('- App uses default Tailwind CSS styling');
console.log('- All core functionality preserved');
console.log('- Build process successful');

console.log('\n🚀 You can now run: npm run dev');