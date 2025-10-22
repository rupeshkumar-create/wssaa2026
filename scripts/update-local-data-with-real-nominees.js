#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

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

// Process Leaders CSV
async function processLeaders() {
  console.log('Processing Leaders CSV...');
  const leaders = [];
  
  return new Promise((resolve, reject) => {
    const csvPath = path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Leaders.csv');
    if (!fs.existsSync(csvPath)) {
      console.log('Leaders CSV not found, skipping...');
      resolve([]);
      return;
    }
    
    fs.createReadStream(csvPath)
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
          
          leaders.push({
            id: `leader-${leaders.length + 1}`,
            category: CATEGORY_MAPPINGS.leaders,
            type: "person",
            nominee: {
              name: `${firstName} ${lastName}`,
              title: title,
              country: "Global",
              linkedin: linkedinUrl,
              imageUrl: profilePic
            },
            company: {
              name: company,
              website: websiteLink,
              country: "Global"
            },
            nominator: {
              name: "World Staffing Summit",
              email: "awards@worldstaffingsummit.com",
              company: "World Staffing Summit",
              linkedin: "https://www.linkedin.com/company/world-staffing-summit/"
            },
            whyNominated: "Recognized as one of the Top 100 Leaders in the World Staffing Summit Awards. This individual has demonstrated exceptional leadership, innovation, and contribution to the staffing industry.",
            whyVoteForMe: "Past Winner - Demonstrated exceptional leadership and innovation in the staffing industry with proven track record of success.",
            liveUrl: slug,
            status: "approved",
            uniqueKey: `${CATEGORY_MAPPINGS.leaders}:${slug}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
    const csvPath = path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Company.csv');
    if (!fs.existsSync(csvPath)) {
      console.log('Companies CSV not found, skipping...');
      resolve([]);
      return;
    }
    
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        if (row['Company Name']) {
          const companyName = row['Company Name'].trim();
          const firstName = row['First Name'] ? row['First Name'].trim() : '';
          const lastName = row['Last Name'] ? row['Last Name'].trim() : '';
          const linkedinUrl = row['Linkedin URL'] || '';
          const email = row['Email Address'] || '';
          const domainName = row['Domain Name'] || '';
          const logo = row['Logo'] || '';
          const websiteLink = row['Website'] || domainName || '';
          
          const slug = companyName.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
          
          companies.push({
            id: `company-${companies.length + 1}`,
            category: CATEGORY_MAPPINGS.companies,
            type: "company",
            nominee: {
              name: companyName,
              title: null,
              country: "Global",
              linkedin: linkedinUrl,
              imageUrl: logo
            },
            company: {
              name: companyName,
              website: websiteLink,
              country: "Global"
            },
            nominator: {
              name: "World Staffing Summit",
              email: "awards@worldstaffingsummit.com",
              company: "World Staffing Summit",
              linkedin: "https://www.linkedin.com/company/world-staffing-summit/"
            },
            whyNominated: `${companyName} has been recognized as one of the Top 100 Companies in the World Staffing Summit Awards. This company has demonstrated exceptional performance, innovation, and leadership in the staffing industry.`,
            whyVoteForMe: "Past Winner - Demonstrated exceptional performance and innovation in the staffing industry with proven track record of client satisfaction and industry leadership.",
            liveUrl: slug,
            status: "approved",
            uniqueKey: `${CATEGORY_MAPPINGS.companies}:${slug}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
    const tsvPath = path.join(__dirname, '..', 'data', 'Top 100 - WSS 25 - Recruiters.tsv');
    if (!fs.existsSync(tsvPath)) {
      console.log('Recruiters TSV not found, skipping...');
      resolve([]);
      return;
    }
    
    fs.createReadStream(tsvPath)
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
          
          recruiters.push({
            id: `recruiter-${recruiters.length + 1}`,
            category: CATEGORY_MAPPINGS.recruiters,
            type: "person",
            nominee: {
              name: `${firstName} ${lastName}`,
              title: title,
              country: "Global",
              linkedin: linkedinUrl,
              imageUrl: profilePic
            },
            company: {
              name: company,
              website: websiteLink,
              country: "Global"
            },
            nominator: {
              name: "World Staffing Summit",
              email: "awards@worldstaffingsummit.com",
              company: "World Staffing Summit",
              linkedin: "https://www.linkedin.com/company/world-staffing-summit/"
            },
            whyNominated: "Recognized as one of the Top 100 Recruiters in the World Staffing Summit Awards. This recruiter has demonstrated exceptional skills, dedication, and success in talent acquisition and recruitment.",
            whyVoteForMe: "Past Winner - Demonstrated exceptional skills and success in talent acquisition with proven track record of successful placements and client satisfaction.",
            liveUrl: slug,
            status: "approved",
            uniqueKey: `${CATEGORY_MAPPINGS.recruiters}:${slug}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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

// Main function
async function main() {
  try {
    console.log('Starting conversion of WSS Top 100 data to local JSON format...\n');
    
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
    
    console.log(`\nTotal nominations processed: ${allNominations.length}`);
    console.log(`- Leaders: ${leaders.length}`);
    console.log(`- Companies: ${companies.length}`);
    console.log(`- Recruiters: ${recruiters.length}\n`);
    
    // Write to local JSON file
    if (allNominations.length > 0) {
      const outputPath = path.join(__dirname, '..', 'data', 'nominations.json');
      fs.writeFileSync(outputPath, JSON.stringify(allNominations, null, 2));
      console.log(`✓ Updated ${outputPath} with ${allNominations.length} real nominations`);
    } else {
      console.log('No nominations to write.');
    }
    
    console.log('\nConversion completed successfully!');
    console.log('The podium should now show real WSS Top 100 nominees instead of demo data.');
    
  } catch (error) {
    console.error('Error during conversion:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { main };