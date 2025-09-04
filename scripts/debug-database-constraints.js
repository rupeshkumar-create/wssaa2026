const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugConstraints() {
  try {
    console.log('🔍 Debugging database constraints...\n');
    
    // Try to create a simple nominee to see what fails
    const testNomineeData = {
      type: 'person',
      firstname: 'John',
      lastname: 'Smith',
      person_email: 'john.smith@test.com',
      jobtitle: 'Senior Recruiter',
      person_country: 'United States'
    };

    console.log('Testing nominee creation with minimal data...');
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(testNomineeData)
      .select()
      .single();

    if (nomineeError) {
      console.log('❌ Nominee creation failed:', nomineeError);
    } else {
      console.log('✅ Nominee created successfully:', nominee.id);
      
      // Clean up
      await supabase.from('nominees').delete().eq('id', nominee.id);
    }

    // Test with longer data like in the CSV
    const testLongNomineeData = {
      type: 'person',
      firstname: 'John',
      lastname: 'Smith',
      person_email: 'john.smith@techtalent.com',
      person_linkedin: 'https://linkedin.com/in/johnsmith',
      person_phone: '+1-555-123-4567',
      jobtitle: 'Senior Recruitment Consultant',
      person_company: 'TechTalent Solutions',
      person_country: 'United States',
      headshot_url: 'https://example.com/headshots/john-smith.jpg',
      why_me: 'Outstanding performance in tech recruitment with exceptional client satisfaction and candidate experience',
      bio: 'Experienced recruiter with 10+ years in technology recruitment, specializing in AI and machine learning roles.',
      achievements: 'Placed 500+ candidates in 2024, 95% retention rate, $50M+ in placements'
    };

    console.log('\nTesting nominee creation with full data...');
    const { data: longNominee, error: longNomineeError } = await supabase
      .from('nominees')
      .insert(testLongNomineeData)
      .select()
      .single();

    if (longNomineeError) {
      console.log('❌ Long nominee creation failed:', longNomineeError);
      console.log('Data that failed:', testLongNomineeData);
    } else {
      console.log('✅ Long nominee created successfully:', longNominee.id);
      
      // Clean up
      await supabase.from('nominees').delete().eq('id', longNominee.id);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  }
}

debugConstraints();