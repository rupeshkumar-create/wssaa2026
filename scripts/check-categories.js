const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkCategories() {
  console.log('🔍 Checking available categories...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Check category_groups
    const { data: categoryGroups, error: groupsError } = await supabase
      .from('category_groups')
      .select('*');
      
    console.log('📋 Category Groups:', categoryGroups?.length || 0);
    if (categoryGroups) {
      categoryGroups.forEach(group => {
        console.log(`  - ${group.id}: ${group.name}`);
      });
    }
    
    // Check subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('subcategories')
      .select('*, category_groups(*)');
      
    console.log('📋 Subcategories:', subcategories?.length || 0);
    if (subcategories) {
      subcategories.forEach(sub => {
        console.log(`  - ${sub.id}: ${sub.name} (Group: ${sub.category_groups?.name})`);
      });
    }
    
    // If no categories exist, create some basic ones
    if (!categoryGroups || categoryGroups.length === 0) {
      console.log('🔧 Creating basic categories...');
      
      // Create category group
      const { data: newGroup, error: groupError } = await supabase
        .from('category_groups')
        .insert({
          id: 'staffing',
          name: 'Staffing & Recruiting',
          description: 'Awards for staffing and recruiting professionals'
        })
        .select()
        .single();
        
      if (groupError) {
        console.error('❌ Failed to create category group:', groupError);
        return;
      }
      
      console.log('✅ Created category group:', newGroup.name);
      
      // Create subcategory
      const { data: newSubcategory, error: subError } = await supabase
        .from('subcategories')
        .insert({
          id: 'best-staffing-firm',
          name: 'Best Staffing Firm',
          description: 'Outstanding staffing and recruiting companies',
          category_group_id: newGroup.id,
          nomination_type: 'both'
        })
        .select()
        .single();
        
      if (subError) {
        console.error('❌ Failed to create subcategory:', subError);
        return;
      }
      
      console.log('✅ Created subcategory:', newSubcategory.name);
    }
    
  } catch (error) {
    console.error('❌ Check failed:', error.message);
  }
}

checkCategories().catch(console.error);