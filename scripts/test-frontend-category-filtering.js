#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testFrontendFiltering() {
  console.log('🔍 Testing frontend category filtering...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false, // Set to true for headless mode
      defaultViewport: { width: 1200, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Enable console logging
    page.on('console', msg => {
      if (msg.text().includes('🔍 Nominees')) {
        console.log('Browser Console:', msg.text());
      }
    });
    
    console.log('📱 Opening nominees page...');
    await page.goto('http://localhost:3000/nominees', { waitUntil: 'networkidle0' });
    
    // Wait for the page to load
    await page.waitForSelector('.container', { timeout: 10000 });
    
    console.log('📊 Checking initial state...');
    const initialNominees = await page.$$eval('[data-testid="nominee-card"], .grid > div', cards => cards.length);
    console.log(`   Found ${initialNominees} nominee cards initially`);
    
    // Look for popular categories
    console.log('🏷️ Looking for category buttons...');
    const categoryButtons = await page.$$eval('button, .cursor-pointer', buttons => {
      return buttons
        .map(btn => btn.textContent?.trim())
        .filter(text => text && (text.includes('Top Recruiter') || text.includes('Recruiter')))
        .slice(0, 3);
    });
    
    console.log('   Found category buttons:', categoryButtons);
    
    if (categoryButtons.length > 0) {
      console.log('🖱️ Clicking on Top Recruiters category...');
      
      // Try to click on a category button
      const clicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, .cursor-pointer'));
        const recruiterButton = buttons.find(btn => 
          btn.textContent?.includes('Top Recruiter') || 
          btn.textContent?.includes('Recruiter')
        );
        
        if (recruiterButton) {
          recruiterButton.click();
          return true;
        }
        return false;
      });
      
      if (clicked) {
        console.log('   Category button clicked, waiting for results...');
        
        // Wait for the URL to change or for new content to load
        await page.waitForTimeout(2000);
        
        // Check the URL
        const currentUrl = page.url();
        console.log('   Current URL:', currentUrl);
        
        // Count nominees after filtering
        const filteredNominees = await page.$$eval('[data-testid="nominee-card"], .grid > div', cards => cards.length);
        console.log(`   Found ${filteredNominees} nominee cards after filtering`);
        
        if (filteredNominees < initialNominees) {
          console.log('✅ Category filtering appears to be working!');
        } else {
          console.log('⚠️ Category filtering may not be working properly');
        }
      } else {
        console.log('❌ Could not find or click category button');
      }
    } else {
      console.log('❌ No category buttons found');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Check if puppeteer is available
try {
  require('puppeteer');
  testFrontendFiltering();
} catch (error) {
  console.log('❌ Puppeteer not available. Install with: npm install puppeteer');
  console.log('💡 Alternatively, test manually by visiting http://localhost:3000/nominees');
}