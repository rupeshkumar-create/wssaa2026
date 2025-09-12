const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugNominationIssue() {
  console.log('🔍 Debugging nomination submission issue...');
  
  // Check if we can connect to Supabase
  try {
    const { data, error } = await supabase.from('nominees').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase connection error:', error);
      return;
    }
    console.log('✅ Supabase connection working');
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }
  
  // Check if the email already exists
  const testEmail = 'Rupesh.kumar@candidate.ly';
  console.log('🔍 Checking if email exists:', testEmail);
  
  const { data: existingNominees, error: searchError } = await supabase
    .from('nominees')
    .select('*')
    .or(`person_email.eq.${testEmail},company_email.eq.${testEmail}`);
    
  if (searchError) {
    console.error('❌ Search error:', searchError);
  } else {
    console.log('📧 Existing nominees with this email:', existingNominees?.length || 0);
    if (existingNominees?.length > 0) {
      console.log('Found nominees:', existingNominees.map(n => ({
        id: n.id,
        type: n.type,
        name: n.type === 'person' ? `${n.firstname} ${n.lastname}` : n.company_name,
        email: n.type === 'person' ? n.person_email : n.company_email
      })));
    }
  }
  
  // Check database constraints
  console.log('🔍 Checking database schema...');
  const { data: sampleNominee } = await supabase
    .from('nominees')
    .select('*')
    .limit(1)
    .single();
    
  if (sampleNominee) {
    console.log('📋 Available nominee fields:', Object.keys(sampleNominee));
  }
  
  // Test a simple nomination creation
  console.log('🧪 Testing nomination creation...');
  
  try {
    // First create a test nominator
    const { data: nominator, error: nominatorError } = await supabase
      .from('nominators')
      .upsert({
        email: 'test@admin.com',
        firstname: 'Test',
        lastname: 'Admin',
        company: 'Test Company'
      })
      .select()
      .single();
      
    if (nominatorError) {
      console.error('❌ Nominator creation failed:', nominatorError);
      return;
    }
    
    console.log('✅ Nominator created/found:', nominator.id);
    
    // Try to create a test nominee
    const testNomineeData = {
      type: 'person',
      firstname: 'Rupesh',
      lastname: 'Kumar',
      person_email: testEmail,
      jobtitle: 'Test Position',
      why_me: 'Test reason'
    };
    
    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(testNomineeData)
      .select()
      .single();
      
    if (nomineeError) {
      console.error('❌ Nominee creation failed:', nomineeError);
      console.error('Error details:', nomineeError.details);
      console.error('Error hint:', nomineeError.hint);
    } else {
      console.log('✅ Test nominee created:', nominee.id);
      
      // Clean up test data
      await supabase.from('nominees').delete().eq('id', nominee.id);
      console.log('🧹 Cleaned up test nominee');
    }
    
  } catch (err) {
    console.error('❌ Test failed:', err.message);
  }
}

debugNominationIssue().catch(console.error);