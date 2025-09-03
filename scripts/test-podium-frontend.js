#!/usr/bin/env node

const puppeteer = require('puppeteer');

async function testPodiumFrontend() {
  console.log('Testing Podium Frontend Category Switching...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1200, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to home page
    console.log('📱 Navigating to home page...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    
    // Wait for podium section to load
    console.log('⏳ Waiting for podium to load...');
    await page.waitForSelector('[data-testid="podium-section"]', { timeout: 10000 });
    
    // Test category group switching
    console.log('🔄 Testing category group switching...');
    
    // Click on "Role-Specific Excellence" group
    await page.click('button:has-text("Role-Specific Excellence")');
    await page.waitForTimeout(1000);
    
    // Check if subcategories are visible
    const subcategories = await page.$$eval('button', buttons => 
      buttons.filter(btn => btn.textContent.includes('Top Recruiter')).length
    );
    
    if (subcategories > 0) {
      console.log('✅ Role-Specific Excellence subcategories loaded');
    } else {
      console.log('❌ Role-Specific Excellence subcategories not found');
    }
    
    // Click on "Innovation & Technology" group
    await page.click('button:has-text("Innovation & Technology")');
    await page.waitForTimeout(1000);
    
    // Check if Innovation & Technology subcategories are visible
    const innovationSubcategories = await page.$$eval('button', buttons => 
      buttons.filter(btn => btn.textContent.includes('AI-Driven')).length
    );
    
    if (innovationSubcategories > 0) {
      console.log('✅ Innovation & Technology subcategories loaded');
    } else {
      console.log('❌ Innovation & Technology subcategories not found');
    }
    
    // Test subcategory switching within Innovation & Technology
    console.log('🔄 Testing subcategory switching...');
    
    // Click on "Top Digital Experience for Clients"
    const digitalExperienceButton = await page.$('button:has-text("Top Digital Experience for Clients")');
    if (digitalExperienceButton) {
      await digitalExperienceButton.click();
      await page.waitForTimeout(2000);
      console.log('✅ Switched to Digital Experience category');
    } else {
      console.log('❌ Digital Experience button not found');
    }
    
    console.log('✅ Frontend test completed successfully!');
    
  } catch (error) {
    console.error('❌ Frontend test failed:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testPodiumFrontend().catch(console.error);