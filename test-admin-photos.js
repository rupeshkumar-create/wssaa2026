const puppeteer = require('puppeteer');

async function testAdminPhotos() {
  console.log('🔍 Testing admin panel photo display...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: { width: 1200, height: 800 }
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to admin login
    console.log('📱 Navigating to admin login...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
    
    // Login with admin credentials
    console.log('🔐 Logging in as admin...');
    await page.type('input[type="password"]', 'admin123');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    
    // Wait for nominations to load
    console.log('⏳ Waiting for nominations to load...');
    await page.waitForSelector('[data-testid="nominations-list"], .space-y-4', { timeout: 10000 });
    
    // Check for photos in nominations
    console.log('🖼️ Checking for photos in nominations...');
    
    // Look for images in the nominations list
    const images = await page.$$eval('img', imgs => 
      imgs.map(img => ({
        src: img.src,
        alt: img.alt,
        className: img.className,
        visible: img.offsetWidth > 0 && img.offsetHeight > 0
      }))
    );
    
    console.log('📸 Found images:', images.length);
    images.forEach((img, index) => {
      console.log(`  ${index + 1}. ${img.alt || 'No alt'} - ${img.visible ? 'Visible' : 'Hidden'}`);
      console.log(`     Source: ${img.src}`);
      console.log(`     Classes: ${img.className}`);
    });
    
    // Check for fallback icons
    const fallbackIcons = await page.$$eval('[class*="User"], [class*="Building2"]', icons => 
      icons.map(icon => ({
        className: icon.className,
        visible: icon.offsetWidth > 0 && icon.offsetHeight > 0
      }))
    );
    
    console.log('🎭 Found fallback icons:', fallbackIcons.length);
    
    // Take a screenshot
    await page.screenshot({ 
      path: 'admin-photos-test.png',
      fullPage: true
    });
    console.log('📷 Screenshot saved as admin-photos-test.png');
    
    // Check network requests for image loading
    console.log('🌐 Checking for failed image requests...');
    const failedRequests = [];
    
    page.on('response', response => {
      if (response.url().includes('.jpg') || response.url().includes('.png') || response.url().includes('.jpeg')) {
        if (!response.ok()) {
          failedRequests.push({
            url: response.url(),
            status: response.status()
          });
        }
      }
    });
    
    // Refresh to catch any image loading issues
    await page.reload({ waitUntil: 'networkidle0' });
    
    if (failedRequests.length > 0) {
      console.log('❌ Failed image requests:');
      failedRequests.forEach(req => {
        console.log(`  ${req.url} - Status: ${req.status}`);
      });
    } else {
      console.log('✅ No failed image requests detected');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await browser.close();
  }
}

testAdminPhotos().catch(console.error);