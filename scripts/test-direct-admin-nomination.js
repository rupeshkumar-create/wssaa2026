const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testDirectAdminNomination() {
  console.log('🧪 Testing direct admin nomination creation...');
  
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
  
  try {
    // Get a valid category
    const { data: categories } = await supabase
      .from('subcategories')
      .select('id, name, category_groups(id, name)')
      .limit(1)
      .single();
      
    if (!categories) {
      console.error('❌ No categories found');
      return;
    }
    
    console.log('📋 Using category:', {
      subcategoryId: categories.id,
      categoryGroupId: categories.category_groups.id,
      name: categories.name
    });

    // 1. Create admin nominator
    const nominatorData = {
      email: 'admin@worldstaffingawards.com',
      firstname: 'Admin',
      lastname: 'User',
      linkedin: 'https://linkedin.com/company/world-staffing-awards',
      company: 'World Staffing Awards',
      job_title: 'Administrator',
      country: 'Global'
    };

    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .upsert(nominatorData)
      .select()
      .single();

    if (nominatorError) {
      console.error('❌ Nominator creation failed:', nominatorError);
      return;
    }
    
    console.log('✅ Nominator created:', nominator.id);

    // 2. Create nominee
    const nomineeData = {
      type: 'person',
      firstname: 'Rupesh',
      lastname: 'Kumar',
      person_email: 'Rupesh.kumar@candidate.ly',
      jobtitle: 'Test Position',
      why_me: 'Test reason for nomination',
      bio: 'Test bio',
      achievements: 'Test achievements'
    };

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) {
      console.error('❌ Nominee creation failed:', nomineeError);
      return;
    }
    
    console.log('✅ Nominee created:', nominee.id);

    // 3. Create nomination
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: categories.category_groups.id,
      subcategory_id: categories.id,
      state: 'approved', // Admin nominations are auto-approved
      admin_notes: 'Created via admin panel test',
      approved_at: new Date().toISOString(),
      approved_by: 'admin',
      votes: 0,
      additional_votes: 0
    };

    const { data: nomination, error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData)
      .select()
      .single();

    if (nominationError) {
      console.error('❌ Nomination creation failed:', nominationError);
      console.error('Error details:', nominationError.details);
      console.error('Error hint:', nominationError.hint);
      return;
    }
    
    console.log('✅ Nomination created successfully:', nomination.id);
    console.log('🎉 Admin nomination for Rupesh Kumar completed!');
    
    // Verify the nomination appears in the nominees API
    const { data: nominees } = await supabase
      .from('nominations')
      .select(`
        *,
        nominees!inner(*),
        nominators!inner(*)
      `)
      .eq('id', nomination.id)
      .single();
      
    if (nominees) {
      console.log('✅ Nomination verified in database');
      console.log('📋 Nominee details:', {
        name: `${nominees.nominees.firstname} ${nominees.nominees.lastname}`,
        email: nominees.nominees.person_email,
        category: nominees.subcategory_id,
        state: nominees.state
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDirectAdminNomination().catch(console.error);