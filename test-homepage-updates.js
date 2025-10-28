#!/usr/bin/env node

/**
 * Test script to verify homepage updates:
 * 1. Submit Nomination button color is #F26B21
 * 2. Awards Timeline is smaller and visible in one page
 */

const puppeteer = require('puppeteer');

async function testHomepageUpdates() {
  console.log('🧪 Testing Homepage Updates...\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    
    console.log('📱 Navigating to homepage...');
    await page.goto('http://localhost:3000', { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });
    
    // Test 1: Check Submit Nomination button color in Awards Timeline
    console.log('\n🎨 Testing Submit Nomination button color...');
    
    const submitButtonColor = await page.evaluate(() => {
      const submitButton = document.querySelector('a[href="/nominate"]');
      if (submitButton) {
        const styles = window.getComputedStyle(submitButton);
        return {
          backgroundColor: styles.backgroundColor,
          color: styles.color,
          text: submitButton.textContent.trim()
        };
      }
      return null;
    });
    
    if (submitButtonColor) {
      console.log(`✅ Submit button found: "${submitButtonColor.text}"`);
      console.log(`   Background: ${submitButtonColor.backgroundColor}`);
      console.log(`   Text color: ${submitButtonColor.color}`);
      
      // Check if background color matches #F26B21 (rgb(242, 107, 33))
      const isCorrectColor = submitButtonColor.backgroundColor.includes('242, 107, 33') || 
                           submitButtonColor.backgroundColor.includes('#F26B21');
      
      if (isCorrectColor) {
        console.log('✅ Submit Nomination button has correct color #F26B21');
      } else {
        console.log('❌ Submit Nomination button color needs adjustment');
      }
    } else {
      console.log('❌ Submit Nomination button not found');
    }
    
    // Test 2: Check Awards Timeline size and visibility
    console.log('\n📏 Testing Awards Timeline size...');
    
    const timelineInfo = await page.evaluate(() => {
      const timelineSection = document.querySelector('section:has(h2:contains("Awards Timeline")), section h2');
      let timelineElement = null;
      
      // Find the timeline section by looking for the heading
      const headings = document.querySelectorAll('h2');
      for (const heading of headings) {
        if (heading.textContent.includes('Awards Timeline')) {
          timelineElement = heading.closest('section');
          break;
        }
      }
      
      if (timelineElement) {
        const rect = timelineElement.getBoundingClientRect();
        const styles = window.getComputedStyle(timelineElement);
        
        return {
          height: rect.height,
          padding: styles.padding,
          paddingTop: styles.paddingTop,
          paddingBottom: styles.paddingBottom,
          isVisible: rect.height > 0 && rect.width > 0
        };
      }
      return null;
    });
    
    if (timelineInfo) {
      console.log(`✅ Awards Timeline found`);
      console.log(`   Height: ${Math.round(timelineInfo.height)}px`);
      console.log(`   Padding: ${timelineInfo.padding}`);
      console.log(`   Visible: ${timelineInfo.isVisible}`);
      
      // Check if timeline is reasonably sized (not too tall)
      if (timelineInfo.height < 800) {
        console.log('✅ Awards Timeline is appropriately sized');
      } else {
        console.log('⚠️  Awards Timeline might be too tall');
      }
    } else {
      console.log('❌ Awards Timeline not found');
    }
    
    // Test 3: Check hero section buttons
    console.log('\n🦸 Testing Hero section buttons...');
    
    const heroButtons = await page.evaluate(() => {
      const buttons = [];
      const heroSection = document.querySelector('section:first-of-type');
      
      if (heroSection) {
        const buttonElements = heroSection.querySelectorAll('a[class*="bg-"], button[class*="bg-"]');
        
        buttonElements.forEach((btn, index) => {
          const styles = window.getComputedStyle(btn);
          buttons.push({
            index,
            text: btn.textContent.trim(),
            backgroundColor: styles.backgroundColor,
            href: btn.href || 'N/A'
          });
        });
      }
      
      return buttons;
    });
    
    if (heroButtons.length > 0) {
      console.log(`✅ Found ${heroButtons.length} hero button(s):`);
      heroButtons.forEach(btn => {
        console.log(`   "${btn.text}" - ${btn.backgroundColor} - ${btn.href}`);
        
        // Check if it's the nominate/vote button with correct color
        if ((btn.text.includes('Nominate') || btn.text.includes('Vote')) && 
            (btn.backgroundColor.includes('242, 107, 33') || btn.backgroundColor.includes('#F26B21'))) {
          console.log('   ✅ Hero button has correct #F26B21 color');
        }
      });
    } else {
      console.log('❌ No hero buttons found');
    }
    
    // Test 4: Overall page structure
    console.log('\n🏗️  Testing overall page structure...');
    
    const pageStructure = await page.evaluate(() => {
      const sections = document.querySelectorAll('section');
      return {
        totalSections: sections.length,
        hasHero: !!document.querySelector('section:first-of-type img[alt*="World Staffing Awards"]'),
        hasTimeline: !!document.querySelector('h2:contains("Awards Timeline"), h2[textContent*="Timeline"]'),
        pageHeight: document.body.scrollHeight
      };
    });
    
    console.log(`✅ Page structure:`);
    console.log(`   Total sections: ${pageStructure.totalSections}`);
    console.log(`   Has hero: ${pageStructure.hasHero}`);
    console.log(`   Page height: ${pageStructure.pageHeight}px`);
    
    console.log('\n🎉 Homepage update test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.message.includes('net::ERR_CONNECTION_REFUSED')) {
      console.log('\n💡 Make sure the development server is running:');
      console.log('   npm run dev');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testHomepageUpdates().catch(console.error);