#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Category mappings to existing subcategories
const CATEGORY_MAPPINGS = {
  leaders: 'best-staffing-leader',
  recruiters: 'best-recruiter',
  companies: 'best-staffing-firm'
};

// Helper function to generate slug
function generateSlug(firstName, lastName, company) {
  const name = `${firstName} ${lastName}`.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  const companySlug = company.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${name}-${companySlug}`;
}

// Helper function to generate live URL
function generateLiveUrl(firstName, lastName, company) {
  const slug = generateSlug(firstName, lastName, company);
  return `https://wssaa2026.vercel.app/nominee/${slug}`;
}

// Process Leaders CSV
async function processLeaders() {
  console.log('Processing Leaders CSV...');
  const leaders = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Leaders.csv'))
      .pipe(csv())
      .on('data', (row) => {
        if (row['First Name'] && row['Last Name'] && row['Company Name']) {
          const firstName = row['First Name'].trim();
          const lastName = row['Last Name'].trim();
          const company = row['Company Name'].trim();
          const title = row['Tittle'] || row['Title'] || '';
          const email = row['Email Address'] || '';
          const linkedinUrl = row['Person Linkedin Url'] || '';
          const profilePic = row['Profile Pic'] || '';
          const websiteLink = row['Webiste Link'] || row['Website Link'] || '';
          
          const slug = generateSlug(firstName, lastName, company);
          const liveUrl = generateLiveUrl(firstName, lastName, company);
          
          leaders.push({
            type: 'leaders',
            nominee: {
              type: 'person',
              firstname: firstName,
              lastname: lastName,
              person_email: email,
              person_linkedin: linkedinUrl,
              jobtitle: title,
              person_company: company,
              headshot_url: profilePic,
              live_url: liveUrl,
              why_me: 'Past Winner - Recognized as one of the Top 100 Leaders in the World Staffing Summit Awards. This individual has demonstrated exceptional leadership, innovation, and contribution to the staffing industry.'
            },
            nominator: {
              email: 'awards@worldstaffingsummit.com',
              firstname: 'World Staffing',
              lastname: 'Summit',
              company: 'World Staffing Summit',
              linkedin: 'https://www.linkedin.com/company/world-staffing-summit/',
              job_title: 'Awards Committee'
            },
            nomination: {
              subcategory_id: CATEGORY_MAPPINGS.leaders,
              category_group_id: 'leadership',
              state: 'approved',
              votes: Math.floor(Math.random() * 50) + 10,
              additional_votes: 0,
              upload_source: 'form',
              approved_at: new Date().toISOString(),
              approved_by: 'admin'
            }
          });
        }
      })
      .on('end', () => {
        console.log(`Processed ${leaders.length} leaders`);
        resolve(leaders);
      })
      .on('error', reject);
  });
}

// Process Companies CSV
async function processCompanies() {
  console.log('Processing Companies CSV...');
  const companies = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Company.csv'))
      .pipe(csv())
      .on('data', (row) => {
        if (row['Company Name'] && row['First Name'] && row['Last Name']) {
          const companyName = row['Company Name'].trim();
          const firstName = row['First Name'].trim();
          const lastName = row['Last Name'].trim();
          const linkedinUrl = row['Linkedin URL'] || '';
          const email = row['Email Address'] || '';
          const domainName = row['Domain Name'] || '';
          const logo = row['Logo'] || '';
          const websiteLink = row['Website'] || domainName || '';
          
          const slug = generateSlug(companyName, '', '');
          const liveUrl = generateLiveUrl(companyName, '', '');
          
          companies.push({
            type: 'companies',
            nominee: {
              type: 'company',
              company_name: companyName,
              company_website: websiteLink,
              company_linkedin: linkedinUrl,
              company_email: email,
              logo_url: logo,
              live_url: liveUrl,
              why_us: `Past Winner - ${companyName} has been recognized as one of the Top 100 Companies in the World Staffing Summit Awards. This company has demonstrated exceptional performance, innovation, and leadership in the staffing industry.`
            },
            nominator: {
              email: 'awards@worldstaffingsummit.com',
              firstname: 'World Staffing',
              lastname: 'Summit',
              company: 'World Staffing Summit',
              linkedin: 'https://www.linkedin.com/company/world-staffing-summit/',
              job_title: 'Awards Committee'
            },
            nomination: {
              subcategory_id: CATEGORY_MAPPINGS.companies,
              category_group_id: 'staffing',
              state: 'approved',
              votes: Math.floor(Math.random() * 50) + 10,
              additional_votes: 0,
              upload_source: 'form',
              approved_at: new Date().toISOString(),
              approved_by: 'admin'
            }
          });
        }
      })
      .on('end', () => {
        console.log(`Processed ${companies.length} companies`);
        resolve(companies);
      })
      .on('error', reject);
  });
}

// Process Recruiters TSV
async function processRecruiters() {
  console.log('Processing Recruiters TSV...');
  const recruiters = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Recruiters.tsv'))
      .pipe(csv({ separator: '\t' }))
      .on('data', (row) => {
        if (row['first_name'] && row['last_name'] && row['company_name']) {
          const firstName = row['first_name'].trim();
          const lastName = row['last_name'].trim();
          const company = row['company_name'].trim();
          const title = row['tittle'] || row['title'] || '';
          const email = row['your_email_address'] || '';
          const linkedinUrl = row['linkedin_profile'] || '';
          const profilePic = row['profile_picture'] || '';
          const websiteLink = row['Website'] || '';
          
          const slug = generateSlug(firstName, lastName, company);
          const liveUrl = generateLiveUrl(firstName, lastName, company);
          
          recruiters.push({
            type: 'recruiters',
            nominee: {
              type: 'person',
              firstname: firstName,
              lastname: lastName,
              person_email: email,
              person_linkedin: linkedinUrl,
              jobtitle: title,
              person_company: company,
              headshot_url: profilePic,
              live_url: liveUrl,
              why_me: 'Past Winner - Recognized as one of the Top 100 Recruiters in the World Staffing Summit Awards. This recruiter has demonstrated exceptional skills, dedication, and success in talent acquisition and recruitment.'
            },
            nominator: {
              email: 'awards@worldstaffingsummit.com',
              firstname: 'World Staffing',
              lastname: 'Summit',
              company: 'World Staffing Summit',
              linkedin: 'https://www.linkedin.com/company/world-staffing-summit/',
              job_title: 'Awards Committee'
            },
            nomination: {
              subcategory_id: CATEGORY_MAPPINGS.recruiters,
              category_group_id: 'staffing',
              state: 'approved',
              votes: Math.floor(Math.random() * 50) + 10,
              additional_votes: 0,
              upload_source: 'form',
              approved_at: new Date().toISOString(),
              approved_by: 'admin'
            }
          });
        }
      })
      .on('end', () => {
        console.log(`Processed ${recruiters.length} recruiters`);
        resolve(recruiters);
      })
      .on('error', reject);
  });
}

// Insert nominations into database
async function insertNominations(nominations) {
  console.log(`Inserting ${nominations.length} complete nominations into database...`);
  
  let inserted = 0;
  let errors = 0;
  
  for (const item of nominations) {
    try {
      // 1. Insert or get nominator
      const { data: existingNominator } = await supabase
        .from('nominators')
        .select('id')
        .eq('email', item.nominator.email)
        .single();
      
      let nominatorId;
      if (existingNominator) {
        nominatorId = existingNominator.id;
      } else {
        const { data: newNominator, error: nominatorError } = await supabase
          .from('nominators')
          .insert(item.nominator)
          .select('id')
          .single();
        
        if (nominatorError) {
          console.error(`Error inserting nominator for ${item.nominee.firstname} ${item.nominee.lastname}:`, nominatorError);
          errors++;
          continue;
        }
        nominatorId = newNominator.id;
      }
      
      // 2. Insert nominee
      const { data: newNominee, error: nomineeError } = await supabase
        .from('nominees')
        .insert(item.nominee)
        .select('id')
        .single();
      
      if (nomineeError) {
        console.error(`Error inserting nominee ${item.nominee.firstname || item.nominee.company_name}:`, nomineeError);
        errors++;
        continue;
      }
      
      // 3. Insert nomination
      const nominationData = {
        ...item.nomination,
        nominator_id: nominatorId,
        nominee_id: newNominee.id
      };
      
      const { error: nominationError } = await supabase
        .from('nominations')
        .insert(nominationData);
      
      if (nominationError) {
        console.error(`Error inserting nomination for ${item.nominee.firstname || item.nominee.company_name}:`, nominationError);
        errors++;
        continue;
      }
      
      inserted++;
      console.log(`✓ Inserted ${item.type} nomination: ${item.nominee.firstname || item.nominee.company_name} ${item.nominee.lastname || ''}`);
      
    } catch (err) {
      console.error(`Exception processing ${item.nominee.firstname || item.nominee.company_name}:`, err);
      errors++;
    }
    
    // Small delay between insertions
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  console.log(`\nInsertion complete:`);
  console.log(`- Successfully inserted: ${inserted}`);
  console.log(`- Errors: ${errors}`);
  console.log(`- Total processed: ${nominations.length}`);
}

// Main function
async function main() {
  try {
    console.log('Starting WSS Top 100 nominees import...\n');
    
    // Check if csv-parser is available
    try {
      require('csv-parser');
    } catch (err) {
      console.log('Installing csv-parser...');
      const { execSync } = require('child_process');
      execSync('npm install csv-parser', { stdio: 'inherit' });
    }
    
    // Process all CSV files
    const [leaders, companies, recruiters] = await Promise.all([
      processLeaders(),
      processCompanies(),
      processRecruiters()
    ]);
    
    // Combine all nominations
    const allNominations = [...leaders, ...companies, ...recruiters];
    
    console.log(`\nTotal nominations to insert: ${allNominations.length}`);
    console.log(`- Leaders: ${leaders.length}`);
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Recruiters: ${recruiters.length}\n`);
    
    // Insert into database
    if (allNominations.length > 0) {
      await insertNominations(allNominations);
    } else {
      console.log('No nominations to insert.');
    }
    
    console.log('\nImport completed successfully!');
    
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };