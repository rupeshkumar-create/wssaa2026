const puppeteer = require('puppeteer');

async function testFrontendPage() {
  console.log('🔍 Testing Vineet Bikram frontend page...');
  
  let browser;
  try {
    browser = await puppeteer.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Navigate to the page
    const url = 'http://localhost:3000/nominee/06f21cbc-5553-4af5-ae72-1a35b4ad4232';
    console.log('📡 Navigating to:', url);
    
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    // Wait for the page to load
    await page.waitForTimeout(3000);
    
    // Check if the page loaded successfully
    const title = await page.title();
    console.log('📄 Page title:', title);
    
    // Look for vote count elements
    const voteElements = await page.$$eval('[class*="vote"], [class*="Vote"], [data-testid*="vote"]', elements => {
      return elements.map(el => ({
        text: el.textContent?.trim(),
        className: el.className,
        tagName: el.tagName
      }));
    });
    
    console.log('🗳️ Found vote-related elements:', voteElements);
    
    // Look for any numbers that might be vote counts
    const numbers = await page.$$eval('*', elements => {
      const results = [];
      elements.forEach(el => {
        const text = el.textContent?.trim();
        if (text && /^\d+$/.test(text)) {
          const num = parseInt(text);
          if (num >= 40 && num <= 50) { // Looking for numbers around 47
            results.push({
              number: num,
              element: el.tagName,
              className: el.className,
              parent: el.parentElement?.tagName
            });
          }
        }
      });
      return results;
    });
    
    console.log('🔢 Found relevant numbers (40-50):', numbers);
    
    // Check for any error messages
    const errors = await page.$$eval('[class*="error"], [class*="Error"]', elements => {
      return elements.map(el => el.textContent?.trim()).filter(Boolean);
    });
    
    if (errors.length > 0) {
      console.log('❌ Found errors:', errors);
    }
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'vineet-page-test.png', fullPage: true });
    console.log('📸 Screenshot saved as vineet-page-test.png');
    
  } catch (error) {
    console.error('❌ Error testing page:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

testFrontendPage();