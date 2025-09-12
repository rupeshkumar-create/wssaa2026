async function testTitleDisplay() {
  console.log('🔍 Testing title display for Vineet Bikram...');
  
  try {
    const response = await fetch('http://localhost:3000/nominee/06f21cbc-5553-4af5-ae72-1a35b4ad4232');
    const html = await response.text();
    
    // Check for title/job title
    const hasCEO = html.includes('CEO');
    const hasProfessional = html.includes('Professional');
    const hasUserIcon = html.includes('lucide-user');
    const hasVineetName = html.includes('Vineet Bikram');
    
    console.log('📊 Title Display Check:');
    console.log('- Contains "CEO":', hasCEO ? '✅' : '❌');
    console.log('- Contains "Professional":', hasProfessional ? '✅' : '❌');
    console.log('- Has User icon:', hasUserIcon ? '✅' : '❌');
    console.log('- Contains "Vineet Bikram":', hasVineetName ? '✅' : '❌');
    
    // Look for the specific pattern
    const titlePattern = /<span[^>]*>CEO<\/span>/i;
    const titleMatch = html.match(titlePattern);
    
    if (titleMatch) {
      console.log('✅ Found CEO title in HTML:', titleMatch[0]);
    } else {
      console.log('❌ CEO title not found in expected format');
    }
    
    // Check for alignment improvements
    const hasOrderClasses = html.includes('order-1') && html.includes('order-2');
    console.log('- Has responsive ordering:', hasOrderClasses ? '✅' : '❌');
    
    if (hasCEO && hasVineetName) {
      console.log('\n🎉 SUCCESS: Title is now displaying correctly!');
    } else {
      console.log('\n⚠️ Title may still need adjustment');
    }
    
  } catch (error) {
    console.error('❌ Error testing title display:', error.message);
  }
}

testTitleDisplay();