#!/usr/bin/env node

/**
 * Test script to verify search functionality doesn't cause page refreshes
 */

const puppeteer = require('puppeteer');

async function testSearchNoRefresh() {
  console.log('🔍 Testing search functionality without page refresh...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for CI
      defaultViewport: { width: 1280, height: 720 }
    });
    
    const page = await browser.newPage();
    
    // Track page navigation events
    let navigationCount = 0;
    page.on('framenavigated', () => {
      navigationCount++;
      console.log(`📄 Page navigation detected (count: ${navigationCount})`);
    });
    
    // Go to nominees page
    console.log('📍 Navigating to nominees page...');
    await page.goto('http://localhost:3000/nominees', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Wait for search bar to be visible
    console.log('⏳ Waiting for search bar...');
    await page.waitForSelector('input[placeholder*="Search"]', { timeout: 10000 });
    
    // Get initial navigation count (should be 1 from initial load)
    const initialNavigationCount = navigationCount;
    console.log(`📊 Initial navigation count: ${initialNavigationCount}`);
    
    // Type in search bar character by character
    const searchTerm = "John";
    console.log(`⌨️  Typing "${searchTerm}" character by character...`);
    
    const searchInput = await page.$('input[placeholder*="Search"]');
    
    for (let i = 0; i < searchTerm.length; i++) {
      const char = searchTerm[i];
      console.log(`   Typing: "${char}"`);
      
      await searchInput.type(char);
      
      // Wait a bit to simulate real typing
      await page.waitForTimeout(200);
      
      // Check if navigation occurred
      if (navigationCount > initialNavigationCount) {
        console.log('❌ FAIL: Page navigation detected during typing!');
        console.log(`   Navigation count increased from ${initialNavigationCount} to ${navigationCount}`);
        return false;
      }
    }
    
    // Wait for debounced search to complete
    console.log('⏳ Waiting for search results...');
    await page.waitForTimeout(1000);
    
    // Check final navigation count
    const finalNavigationCount = navigationCount;
    console.log(`📊 Final navigation count: ${finalNavigationCount}`);
    
    if (finalNavigationCount === initialNavigationCount) {
      console.log('✅ SUCCESS: No page refresh detected during search!');
      
      // Check if search results are displayed
      try {
        await page.waitForSelector('[data-testid="nominee-card"], .text-center', { timeout: 5000 });
        console.log('✅ Search results displayed successfully');
        return true;
      } catch (error) {
        console.log('⚠️  Warning: Could not verify search results, but no refresh occurred');
        return true;
      }
    } else {
      console.log('❌ FAIL: Page refresh detected!');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    return false;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
if (require.main === module) {
  testSearchNoRefresh()
    .then(success => {
      if (success) {
        console.log('\n🎉 Test completed successfully!');
        process.exit(0);
      } else {
        console.log('\n💥 Test failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n💥 Test crashed:', error);
      process.exit(1);
    });
}

module.exports = { testSearchNoRefresh };