const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugNominationCreation() {
  try {
    console.log('🔍 Debugging nomination creation...\n');
    
    // Create test nominator
    const nominatorData = {
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User'
    };

    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .insert(nominatorData)
      .select()
      .single();

    if (nominatorError) {
      console.log('❌ Nominator creation failed:', nominatorError);
      return;
    }

    console.log('✅ Nominator created:', nominator.id);

    // Create test nominee
    const nomineeData = {
      type: 'person',
      firstname: 'John',
      lastname: 'Smith',
      person_email: 'john.smith@test.com',
      jobtitle: 'Senior Recruiter',
      person_country: 'United States'
    };

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select()
      .single();

    if (nomineeError) {
      console.log('❌ Nominee creation failed:', nomineeError);
      return;
    }

    console.log('✅ Nominee created:', nominee.id);

    // Now try to create nomination
    const nominationData = {
      nominator_id: nominator.id,
      nominee_id: nominee.id,
      category_group_id: 'role-specific',
      subcategory_id: 'top-recruiter',
      state: 'submitted',
      votes: 0
    };

    console.log('Creating nomination with data:', nominationData);

    const { data: nomination, error: nominationError } = await supabase
      .from('nominations')
      .insert(nominationData)
      .select()
      .single();

    if (nominationError) {
      console.log('❌ Nomination creation failed:', nominationError);
    } else {
      console.log('✅ Nomination created successfully:', nomination.id);
      
      // Clean up
      await supabase.from('nominations').delete().eq('id', nomination.id);
    }

    // Clean up
    await supabase.from('nominees').delete().eq('id', nominee.id);
    await supabase.from('nominators').delete().eq('id', nominator.id);

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugNominationCreation();