#!/usr/bin/env node

/**
 * CSV Data Processor for Admin Nominations
 * 
 * This script processes CSV data provided by the admin and saves it directly to Supabase
 * as approved nominations. Use this when you have CSV data to upload.
 * 
 * Usage:
 * 1. Place your CSV data in the csvData variable below
 * 2. Run: node scripts/process-csv-data.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Categories mapping - you can add more as needed
const CATEGORIES = {
  'top-recruiter': { group: 'individual-awards' },
  'rising-star-under-30': { group: 'individual-awards' },
  'top-executive-leader': { group: 'individual-awards' },
  'top-staffing-influencer': { group: 'individual-awards' },
  'top-staffing-educator': { group: 'individual-awards' },
  'top-global-recruiter': { group: 'individual-awards' },
  'top-thought-leader': { group: 'individual-awards' },
  'top-recruiting-leader-usa': { group: 'individual-awards' },
  'top-recruiting-leader-europe': { group: 'individual-awards' },
  'top-recruiter-usa': { group: 'individual-awards' },
  'top-recruiter-europe': { group: 'individual-awards' },
  'top-global-staffing-leader': { group: 'individual-awards' },
  'top-staffing-company-usa': { group: 'company-awards' },
  'top-staffing-company-europe': { group: 'company-awards' },
  'top-ai-driven-staffing-platform': { group: 'company-awards' },
  'top-women-led-staffing-firm': { group: 'company-awards' },
  'fastest-growing-staffing-firm': { group: 'company-awards' },
  'top-digital-experience-for-clients': { group: 'company-awards' },
  'best-staffing-podcast-or-show': { group: 'company-awards' },
  'top-global-staffing-company': { group: 'company-awards' },
  'top-ai-driven-platform-europe': { group: 'company-awards' },
  'top-ai-driven-platform-usa': { group: 'company-awards' }
};

// CSV Data - Replace this with your actual CSV data
const csvData = `
type,category,name,email,company,country,nominator_name,nominator_email
person,top-recruiter,John Smith,john.smith@example.com,TechTalent Solutions,United States,Admin User,admin@worldstaffingawards.com
person,rising-star-under-30,Emma Wilson,emma.wilson@example.com,NextGen Talent,Australia,Admin User,admin@worldstaffingawards.com
company,top-staffing-company-usa,TechTalent AI Solutions,info@techtalentai.com,,United States,Admin User,admin@worldstaffingawards.com
`;

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const row = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

function validateRow(row, rowNumber) {
  const errors = [];

  if (!row.type || !['person', 'company'].includes(row.type)) {
    errors.push(`Row ${rowNumber}: Type must be "person" or "company"`);
  }

  if (!row.category) {
    errors.push(`Row ${rowNumber}: Category is required`);
  } else if (!CATEGORIES[row.category]) {
    errors.push(`Row ${rowNumber}: Invalid category "${row.category}"`);
  }

  if (!row.name) {
    errors.push(`Row ${rowNumber}: Name is required`);
  }

  if (!row.email) {
    errors.push(`Row ${rowNumber}: Email is required`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push(`Row ${rowNumber}: Invalid email format`);
  }

  if (!row.nominator_name) {
    errors.push(`Row ${rowNumber}: Nominator name is required`);
  }

  if (!row.nominator_email) {
    errors.push(`Row ${rowNumber}: Nominator email is required`);
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.nominator_email)) {
    errors.push(`Row ${rowNumber}: Invalid nominator email format`);
  }

  return errors;
}

async function createNomination(row) {
  try {
    console.log(`Processing: ${row.name} (${row.type}) for ${row.category}`);

    // 1. Create or get nominator (Admin User)
    let { data: nominator } = await supabase
      .from('nominators')
      .select('id')
      .eq('email', row.nominator_email.toLowerCase())
      .single();

    if (!nominator) {
      const nameParts = row.nominator_name.split(' ');
      const { data: newNominator, error: nominatorError } = await supabase
        .from('nominators')
        .insert({
          email: row.nominator_email.toLowerCase(),
          firstname: nameParts[0] || '',
          lastname: nameParts.slice(1).join(' ') || '',
          company: 'World Staffing Awards',
          country: 'Global'
        })
        .select('id')
        .single();

      if (nominatorError) throw nominatorError;
      nominator = newNominator;
    }

    // 2. Create nominee
    const nomineeData = {
      type: row.type
    };

    if (row.type === 'person') {
      const nameParts = row.name.split(' ');
      nomineeData.firstname = nameParts[0] || '';
      nomineeData.lastname = nameParts.slice(1).join(' ') || '';
      nomineeData.person_email = row.email;
      nomineeData.person_company = row.company || null;
      nomineeData.person_country = row.country || null;
    } else {
      nomineeData.company_name = row.name;
      nomineeData.company_email = row.email;
      nomineeData.company_country = row.country || null;
    }

    const { data: nominee, error: nomineeError } = await supabase
      .from('nominees')
      .insert(nomineeData)
      .select('id')
      .single();

    if (nomineeError) throw nomineeError;

    // 3. Create nomination (directly approved by admin)
    const categoryGroupId = CATEGORIES[row.category]?.group || 'unknown';

    const { error: nominationError } = await supabase
      .from('nominations')
      .insert({
        nominator_id: nominator.id,
        nominee_id: nominee.id,
        category_group_id: categoryGroupId,
        subcategory_id: row.category,
        state: 'approved', // Directly approved by admin
        votes: 0
      });

    if (nominationError) throw nominationError;

    console.log(`✅ Successfully created nomination for ${row.name}`);
    return { success: true };

  } catch (error) {
    console.error(`❌ Error creating nomination for ${row.name}:`, error.message);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

async function processCSVData() {
  console.log('🚀 Processing CSV Data for Admin Nominations');
  console.log('=============================================');

  try {
    // Parse CSV data
    const rows = parseCSV(csvData);
    console.log(`📊 Found ${rows.length} rows to process`);

    // Validate all rows first
    const allErrors = [];
    for (let i = 0; i < rows.length; i++) {
      const rowErrors = validateRow(rows[i], i + 2);
      allErrors.push(...rowErrors);
    }

    if (allErrors.length > 0) {
      console.log('❌ Validation errors found:');
      allErrors.forEach(error => console.log(`  - ${error}`));
      return;
    }

    console.log('✅ All rows validated successfully');

    // Process each row
    let successful = 0;
    let failed = 0;

    for (const row of rows) {
      const result = await createNomination(row);
      if (result.success) {
        successful++;
      } else {
        failed++;
      }
    }

    console.log('\n📈 Processing Summary:');
    console.log(`  Total: ${rows.length}`);
    console.log(`  Successful: ${successful}`);
    console.log(`  Failed: ${failed}`);

    if (successful > 0) {
      console.log('\n🎉 Nominations have been created and approved!');
      console.log('You can now view them in the admin panel.');
    }

  } catch (error) {
    console.error('❌ Error processing CSV data:', error.message);
  }
}

// Instructions for usage
console.log('📋 CSV Data Processor Instructions:');
console.log('===================================');
console.log('1. Replace the csvData variable above with your actual CSV data');
console.log('2. Make sure your CSV has these columns: type,category,name,email,company,country,nominator_name,nominator_email');
console.log('3. Run this script: node scripts/process-csv-data.js');
console.log('4. Check the admin panel to see the created nominations');
console.log('');

// Uncomment the line below when you're ready to process data
// processCSVData();

console.log('⚠️  Script is ready but not executing. Uncomment the last line to run.');