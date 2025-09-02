#!/usr/bin/env node

/**
 * World Staffing Awards - Application Health Verification
 * This script verifies that the application is working properly
 */

const fs = require('fs');
const path = require('path');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

async function checkFileExists(filePath, description) {
  try {
    await fs.promises.access(filePath);
    success(`${description} exists`);
    return true;
  } catch {
    error(`${description} missing: ${filePath}`);
    return false;
  }
}

async function checkPackageJson() {
  info('Checking package.json...');
  
  try {
    const packageJson = JSON.parse(await fs.promises.readFile('package.json', 'utf8'));
    
    // Check essential fields
    const requiredFields = ['name', 'version', 'scripts', 'dependencies'];
    let allFieldsPresent = true;
    
    for (const field of requiredFields) {
      if (packageJson[field]) {
        success(`package.json has ${field}`);
      } else {
        error(`package.json missing ${field}`);
        allFieldsPresent = false;
      }
    }
    
    // Check essential scripts
    const requiredScripts = ['dev', 'build', 'start'];
    for (const script of requiredScripts) {
      if (packageJson.scripts && packageJson.scripts[script]) {
        success(`Script '${script}' configured`);
      } else {
        error(`Script '${script}' missing`);
        allFieldsPresent = false;
      }
    }
    
    // Check essential dependencies
    const requiredDeps = ['next', 'react', 'react-dom', '@supabase/supabase-js'];
    for (const dep of requiredDeps) {
      if (packageJson.dependencies && packageJson.dependencies[dep]) {
        success(`Dependency '${dep}' installed`);
      } else {
        error(`Dependency '${dep}' missing`);
        allFieldsPresent = false;
      }
    }
    
    return allFieldsPresent;
  } catch (err) {
    error(`Failed to read package.json: ${err.message}`);
    return false;
  }
}

async function checkProjectStructure() {
  info('Checking project structure...');
  
  const requiredFiles = [
    { path: 'src/app/page.tsx', desc: 'Homepage component' },
    { path: 'src/app/layout.tsx', desc: 'Root layout' },
    { path: 'src/app/nominate/page.tsx', desc: 'Nomination page' },
    { path: 'src/app/directory/page.tsx', desc: 'Directory page' },
    { path: 'src/app/admin/page.tsx', desc: 'Admin page' },
    { path: 'src/lib/constants.ts', desc: 'Constants file' },
    { path: 'tailwind.config.ts', desc: 'Tailwind config' },
    { path: 'next.config.ts', desc: 'Next.js config' },
    { path: 'tsconfig.json', desc: 'TypeScript config' }
  ];
  
  let allFilesPresent = true;
  
  for (const file of requiredFiles) {
    const exists = await checkFileExists(file.path, file.desc);
    if (!exists) allFilesPresent = false;
  }
  
  return allFilesPresent;
}

async function checkEnvironmentSetup() {
  info('Checking environment setup...');
  
  const envFiles = ['.env.local', '.env', '.env.example'];
  let hasEnvFile = false;
  
  for (const envFile of envFiles) {
    try {
      await fs.promises.access(envFile);
      success(`Environment file found: ${envFile}`);
      hasEnvFile = true;
      break;
    } catch {
      // File doesn't exist, continue checking
    }
  }
  
  if (!hasEnvFile) {
    warning('No environment file found (.env.local, .env, or .env.example)');
    info('You may need to create environment variables for production');
  }
  
  // Check for .env.example template
  try {
    await fs.promises.access('.env.example');
    success('Environment template (.env.example) exists');
  } catch {
    warning('No .env.example template found');
  }
  
  return true;
}

async function checkGitSetup() {
  info('Checking Git setup...');
  
  try {
    await fs.promises.access('.git');
    success('Git repository initialized');
    
    // Check .gitignore
    try {
      const gitignore = await fs.promises.readFile('.gitignore', 'utf8');
      if (gitignore.includes('.env')) {
        success('.gitignore properly excludes .env files');
      } else {
        warning('.gitignore should exclude .env files');
      }
      
      if (gitignore.includes('node_modules')) {
        success('.gitignore properly excludes node_modules');
      } else {
        error('.gitignore should exclude node_modules');
      }
    } catch {
      error('.gitignore file missing');
      return false;
    }
    
    return true;
  } catch {
    error('Git repository not initialized');
    return false;
  }
}

async function checkSecurityFiles() {
  info('Checking security configuration...');
  
  const securityFiles = [
    { path: 'SECURITY.md', desc: 'Security policy' },
    { path: 'LICENSE', desc: 'License file' },
    { path: '.github/workflows/ci.yml', desc: 'CI/CD workflow' }
  ];
  
  let allSecurityFilesPresent = true;
  
  for (const file of securityFiles) {
    const exists = await checkFileExists(file.path, file.desc);
    if (!exists) allSecurityFilesPresent = false;
  }
  
  return allSecurityFilesPresent;
}

async function checkBuildReadiness() {
  info('Checking build readiness...');
  
  try {
    // Check if node_modules exists
    await fs.promises.access('node_modules');
    success('Dependencies installed (node_modules exists)');
    
    // Check TypeScript configuration
    const tsConfig = JSON.parse(await fs.promises.readFile('tsconfig.json', 'utf8'));
    if (tsConfig.compilerOptions) {
      success('TypeScript configuration valid');
    } else {
      error('Invalid TypeScript configuration');
      return false;
    }
    
    return true;
  } catch (err) {
    error(`Build readiness check failed: ${err.message}`);
    return false;
  }
}

async function generateHealthReport() {
  log('\n🏥 World Staffing Awards - Application Health Check', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const checks = [
    { name: 'Package Configuration', fn: checkPackageJson },
    { name: 'Project Structure', fn: checkProjectStructure },
    { name: 'Environment Setup', fn: checkEnvironmentSetup },
    { name: 'Git Configuration', fn: checkGitSetup },
    { name: 'Security Files', fn: checkSecurityFiles },
    { name: 'Build Readiness', fn: checkBuildReadiness }
  ];
  
  const results = [];
  
  for (const check of checks) {
    log(`\n📋 ${check.name}`, 'magenta');
    log('-'.repeat(40), 'magenta');
    
    try {
      const result = await check.fn();
      results.push({ name: check.name, passed: result });
    } catch (err) {
      error(`Check failed: ${err.message}`);
      results.push({ name: check.name, passed: false });
    }
  }
  
  // Summary
  log('\n📊 Health Check Summary', 'cyan');
  log('=' .repeat(60), 'cyan');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    if (result.passed) {
      success(`${result.name}: PASSED`);
    } else {
      error(`${result.name}: FAILED`);
    }
  });
  
  log(`\n🎯 Overall Score: ${passed}/${total} checks passed`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    success('\n🎉 Application is healthy and ready for deployment!');
    
    log('\n📋 Next Steps:', 'blue');
    log('1. Run: npm run build (to verify build works)');
    log('2. Run: npm run dev (to test locally)');
    log('3. Create GitHub repository: ./create-new-github-repo.sh');
    log('4. Deploy to Vercel or your preferred platform');
    log('5. Configure environment variables in production');
  } else {
    warning('\n⚠️  Some checks failed. Please address the issues above before deployment.');
  }
  
  // Additional recommendations
  log('\n💡 Recommendations:', 'blue');
  log('- Regularly update dependencies: npm audit && npm update');
  log('- Test the application thoroughly before deployment');
  log('- Set up monitoring and error tracking in production');
  log('- Configure proper backup strategies for your database');
  log('- Review and update security settings regularly');
  
  return passed === total;
}

// Run the health check
if (require.main === module) {
  generateHealthReport()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      error(`Health check failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { generateHealthReport };