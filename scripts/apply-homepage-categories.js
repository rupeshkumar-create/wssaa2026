const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function applyHomepageCategories() {
  console.log('🔄 Applying homepage categories to database...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // 1. Clear existing categories
    console.log('1️⃣ Clearing existing categories...');
    
    const { error: deleteSubError } = await supabase
      .from('subcategories')
      .delete()
      .neq('id', 'non-existent'); // Delete all
      
    if (deleteSubError) {
      console.warn('⚠️ Warning clearing subcategories:', deleteSubError.message);
    } else {
      console.log('✅ Subcategories cleared');
    }
    
    const { error: deleteGroupError } = await supabase
      .from('category_groups')
      .delete()
      .neq('id', 'non-existent'); // Delete all
      
    if (deleteGroupError) {
      console.warn('⚠️ Warning clearing category groups:', deleteGroupError.message);
    } else {
      console.log('✅ Category groups cleared');
    }
    
    // 2. Insert category groups
    console.log('2️⃣ Inserting category groups...');
    
    const categoryGroups = [
      {
        id: 'role-specific-excellence',
        name: 'Role-Specific Excellence',
        description: 'Recognizing outstanding individual contributors'
      },
      {
        id: 'innovation-technology',
        name: 'Innovation & Technology',
        description: 'Leading the future of staffing technology'
      },
      {
        id: 'culture-impact',
        name: 'Culture & Impact',
        description: 'Making a positive difference in the industry'
      },
      {
        id: 'growth-performance',
        name: 'Growth & Performance',
        description: 'Excellence in operations and thought leadership'
      },
      {
        id: 'geographic-excellence',
        name: 'Geographic Excellence',
        description: 'Regional and global recognition'
      },
      {
        id: 'special-recognition',
        name: 'Special Recognition',
        description: 'Unique contributions to the industry'
      }
    ];
    
    const { error: groupsError } = await supabase
      .from('category_groups')
      .insert(categoryGroups);
      
    if (groupsError) {
      console.error('❌ Failed to insert category groups:', groupsError);
      return;
    }
    
    console.log('✅ Category groups inserted:', categoryGroups.length);
    
    // 3. Insert subcategories
    console.log('3️⃣ Inserting subcategories...');
    
    const subcategories = [
      // Role-Specific Excellence
      { id: 'top-recruiter', name: 'Top Recruiter', description: 'Outstanding individual recruiter performance', category_group_id: 'role-specific-excellence', nomination_type: 'person' },
      { id: 'top-executive-leader', name: 'Top Executive Leader', description: 'Exceptional leadership in staffing industry', category_group_id: 'role-specific-excellence', nomination_type: 'person' },
      { id: 'rising-star-under-30', name: 'Rising Star (Under 30)', description: 'Emerging talent under 30 years old', category_group_id: 'role-specific-excellence', nomination_type: 'person' },
      { id: 'top-staffing-influencer', name: 'Top Staffing Influencer', description: 'Leading voice and influence in staffing', category_group_id: 'role-specific-excellence', nomination_type: 'person' },
      { id: 'best-sourcer', name: 'Best Sourcer', description: 'Excellence in talent sourcing', category_group_id: 'role-specific-excellence', nomination_type: 'person' },
      
      // Innovation & Technology
      { id: 'top-ai-driven-staffing-platform', name: 'Top AI-Driven Staffing Platform', description: 'Leading AI technology in staffing', category_group_id: 'innovation-technology', nomination_type: 'company' },
      { id: 'top-digital-experience-for-clients', name: 'Top Digital Experience for Clients', description: 'Best client digital experience', category_group_id: 'innovation-technology', nomination_type: 'company' },
      
      // Culture & Impact
      { id: 'top-women-led-staffing-firm', name: 'Top Women-Led Staffing Firm', description: 'Excellence in women-led organizations', category_group_id: 'culture-impact', nomination_type: 'company' },
      { id: 'fastest-growing-staffing-firm', name: 'Fastest Growing Staffing Firm', description: 'Rapid growth and expansion', category_group_id: 'culture-impact', nomination_type: 'company' },
      { id: 'best-diversity-inclusion-initiative', name: 'Best Diversity & Inclusion Initiative', description: 'Outstanding D&I programs', category_group_id: 'culture-impact', nomination_type: 'company' },
      { id: 'best-candidate-experience', name: 'Best Candidate Experience', description: 'Exceptional candidate journey', category_group_id: 'culture-impact', nomination_type: 'company' },
      
      // Growth & Performance
      { id: 'best-staffing-process-at-scale', name: 'Best Staffing Process at Scale', description: 'Scalable staffing operations', category_group_id: 'growth-performance', nomination_type: 'company' },
      { id: 'thought-leadership-influence', name: 'Thought Leadership & Influence', description: 'Industry thought leadership', category_group_id: 'growth-performance', nomination_type: 'person' },
      { id: 'best-recruitment-agency', name: 'Best Recruitment Agency', description: 'Top performing recruitment agency', category_group_id: 'growth-performance', nomination_type: 'company' },
      { id: 'best-in-house-recruitment-team', name: 'Best In-House Recruitment Team', description: 'Excellence in internal recruiting', category_group_id: 'growth-performance', nomination_type: 'company' },
      
      // Geographic Excellence
      { id: 'top-staffing-company-usa', name: 'Top Staffing Company - USA', description: 'Leading staffing company in USA', category_group_id: 'geographic-excellence', nomination_type: 'company' },
      { id: 'top-staffing-company-europe', name: 'Top Staffing Company - Europe', description: 'Leading staffing company in Europe', category_group_id: 'geographic-excellence', nomination_type: 'company' },
      { id: 'top-global-recruiter', name: 'Top Global Recruiter', description: 'Excellence in global recruiting', category_group_id: 'geographic-excellence', nomination_type: 'person' },
      
      // Special Recognition
      { id: 'special-recognition', name: 'Special Recognition', description: 'Unique contributions to the industry', category_group_id: 'special-recognition', nomination_type: 'both' }
    ];
    
    const { error: subcategoriesError } = await supabase
      .from('subcategories')
      .insert(subcategories);
      
    if (subcategoriesError) {
      console.error('❌ Failed to insert subcategories:', subcategoriesError);
      return;
    }
    
    console.log('✅ Subcategories inserted:', subcategories.length);
    
    // 4. Verify the setup
    console.log('4️⃣ Verifying setup...');
    
    const { data: verifyGroups } = await supabase
      .from('category_groups')
      .select('*')
      .order('name');
      
    const { data: verifySubs } = await supabase
      .from('subcategories')
      .select('*, category_groups(name)')
      .order('category_group_id, name');
    
    console.log('\n📋 SETUP COMPLETE:');
    console.log('='.repeat(50));
    console.log(`✅ ${verifyGroups?.length || 0} category groups created`);
    console.log(`✅ ${verifySubs?.length || 0} subcategories created`);
    
    if (verifySubs) {
      const groupedCategories = {};
      verifySubs.forEach(sub => {
        const groupName = sub.category_groups?.name || 'Unknown';
        if (!groupedCategories[groupName]) {
          groupedCategories[groupName] = [];
        }
        groupedCategories[groupName].push(sub);
      });
      
      console.log('\n📊 Categories by Group:');
      Object.entries(groupedCategories).forEach(([groupName, subs]) => {
        console.log(`\n  📁 ${groupName} (${subs.length} categories):`);
        subs.forEach(sub => {
          console.log(`    🏆 ${sub.name} (${sub.nomination_type})`);
        });
      });
    }
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Test admin nomination form: http://localhost:3000/admin');
    console.log('2. Run test script: node scripts/test-homepage-categories-admin.js');
    console.log('3. Verify categories match homepage exactly');
    
  } catch (error) {
    console.error('❌ Failed to apply homepage categories:', error.message);
  }
}

applyHomepageCategories().catch(console.error);