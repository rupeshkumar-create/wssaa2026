#!/usr/bin/env node

/**
 * Test all podium categories to ensure they work correctly
 */

const https = require('https');
const { URL } = require('url');

// Configuration
const VERCEL_URL = process.env.VERCEL_URL || 'https://wssaa2026.vercel.app';

// All categories from constants
const ALL_CATEGORIES = [
  'top-recruiter',
  'top-executive-leader', 
  'rising-star-under-30',
  'top-staffing-influencer',
  'best-sourcer',
  'innovation-technology-leader',
  'diversity-inclusion-champion',
  'culture-impact-leader',
  'community-impact-leader',
  'growth-performance-leader',
  'client-success-champion',
  'regional-excellence-north-america',
  'regional-excellence-europe',
  'regional-excellence-asia-pacific',
  'regional-excellence-latin-america',
  'regional-excellence-middle-east-africa',
  'lifetime-achievement',
  'industry-game-changer',
  'thought-leadership'
];

console.log('🧪 Testing All Podium Categories');
console.log('================================');
console.log(`Target URL: ${VERCEL_URL}`);
console.log(`Testing ${ALL_CATEGORIES.length} categories`);
console.log('');

/**
 * Make HTTP request
 */
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'WSA-Podium-Test/1.0',
        ...options.headers
      }
    };

    const req = https.request(requestOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * Test a single category
 */
async function testCategory(category) {
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/podium?category=${category}`);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    if (response.status === 200) {
      const data = response.data;
      const itemCount = data.items ? data.items.length : 0;
      
      console.log(`✅ ${category.padEnd(35)} | ${responseTime}ms | ${itemCount} items`);
      
      return {
        category,
        success: true,
        responseTime,
        itemCount,
        items: data.items || []
      };
    } else {
      console.log(`❌ ${category.padEnd(35)} | ${responseTime}ms | Error ${response.status}`);
      
      return {
        category,
        success: false,
        responseTime,
        error: response.data.error || `HTTP ${response.status}`
      };
    }
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`❌ ${category.padEnd(35)} | ${responseTime}ms | ${error.message}`);
    
    return {
      category,
      success: false,
      responseTime,
      error: error.message
    };
  }
}

/**
 * Test all categories
 */
async function testAllCategories() {
  console.log('🚀 Starting category tests...\n');
  console.log('Category'.padEnd(37) + '| Response Time | Items');
  console.log('-'.repeat(60));
  
  const results = [];
  
  // Test categories in batches to avoid overwhelming the server
  const batchSize = 5;
  for (let i = 0; i < ALL_CATEGORIES.length; i += batchSize) {
    const batch = ALL_CATEGORIES.slice(i, i + batchSize);
    
    const batchPromises = batch.map(category => testCategory(category));
    const batchResults = await Promise.all(batchPromises);
    
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < ALL_CATEGORIES.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log('-'.repeat(60));
  
  // Summary
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  const avgResponseTime = successful.length > 0 
    ? Math.round(successful.reduce((sum, r) => sum + r.responseTime, 0) / successful.length)
    : 0;
  
  console.log('');
  console.log('📊 Test Summary');
  console.log('===============');
  console.log(`✅ Successful: ${successful.length}/${ALL_CATEGORIES.length}`);
  console.log(`❌ Failed: ${failed.length}/${ALL_CATEGORIES.length}`);
  console.log(`⚡ Average Response Time: ${avgResponseTime}ms`);
  
  if (failed.length > 0) {
    console.log('');
    console.log('❌ Failed Categories:');
    failed.forEach(result => {
      console.log(`   - ${result.category}: ${result.error}`);
    });
  }
  
  // Performance analysis
  const fastCategories = successful.filter(r => r.responseTime < 200);
  const slowCategories = successful.filter(r => r.responseTime > 1000);
  
  if (fastCategories.length > 0) {
    console.log('');
    console.log(`⚡ Fast Categories (< 200ms): ${fastCategories.length}`);
  }
  
  if (slowCategories.length > 0) {
    console.log('');
    console.log(`🐌 Slow Categories (> 1000ms): ${slowCategories.length}`);
    slowCategories.forEach(result => {
      console.log(`   - ${result.category}: ${result.responseTime}ms`);
    });
  }
  
  // Data analysis
  const categoriesWithData = successful.filter(r => r.itemCount > 0);
  const emptyCategories = successful.filter(r => r.itemCount === 0);
  
  console.log('');
  console.log('📈 Data Analysis');
  console.log('================');
  console.log(`📊 Categories with data: ${categoriesWithData.length}`);
  console.log(`📭 Empty categories: ${emptyCategories.length}`);
  
  if (categoriesWithData.length > 0) {
    const totalItems = categoriesWithData.reduce((sum, r) => sum + r.itemCount, 0);
    console.log(`🏆 Total podium items: ${totalItems}`);
  }
  
  console.log('');
  if (successful.length === ALL_CATEGORIES.length) {
    console.log('🎉 All categories are working correctly!');
    console.log('✅ Podium is ready for all category groups');
  } else {
    console.log('⚠️ Some categories need attention');
    console.log('🔧 Check the failed categories above');
  }
  
  return {
    total: ALL_CATEGORIES.length,
    successful: successful.length,
    failed: failed.length,
    avgResponseTime,
    results
  };
}

// Run tests if this script is executed directly
if (require.main === module) {
  testAllCategories().catch(console.error);
}

module.exports = { testAllCategories };