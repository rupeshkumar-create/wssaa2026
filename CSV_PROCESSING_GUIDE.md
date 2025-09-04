# CSV Data Processing Guide

## Overview
The bulk upload functionality has been temporarily removed from the admin interface. Instead, you can provide CSV data directly to be processed and saved to Supabase as admin-approved nominations.

## How to Process CSV Data

### Step 1: Prepare Your CSV Data
Your CSV should have the following columns:
```
type,category,name,email,company,country,nominator_name,nominator_email
```

### Step 2: Provide CSV Data
Send your CSV data in one of these formats:
- Raw CSV text
- CSV file attachment
- Paste the data directly

### Step 3: Processing
I will:
1. Validate the CSV format and data
2. Create nominees in Supabase
3. Create nominations with "approved" status (bypassing the normal approval process)
4. Set the nominator as "Admin User" or your specified admin user

## CSV Format Example
```csv
type,category,name,email,company,country,nominator_name,nominator_email
person,top-recruiter,John Smith,john.smith@example.com,TechTalent Solutions,United States,Admin User,admin@worldstaffingawards.com
person,rising-star-under-30,Emma Wilson,emma.wilson@example.com,NextGen Talent,Australia,Admin User,admin@worldstaffingawards.com
company,top-staffing-company-usa,TechTalent AI Solutions,info@techtalentai.com,,United States,Admin User,admin@worldstaffingawards.com
```

## Valid Categories

### Individual Awards (type: person)
- top-recruiter
- rising-star-under-30
- top-executive-leader
- top-staffing-influencer
- top-staffing-educator
- top-global-recruiter
- top-thought-leader
- top-recruiting-leader-usa
- top-recruiting-leader-europe
- top-recruiter-usa
- top-recruiter-europe
- top-global-staffing-leader

### Company Awards (type: company)
- top-staffing-company-usa
- top-staffing-company-europe
- top-ai-driven-staffing-platform
- top-women-led-staffing-firm
- fastest-growing-staffing-firm
- top-digital-experience-for-clients
- best-staffing-podcast-or-show
- top-global-staffing-company
- top-ai-driven-platform-europe
- top-ai-driven-platform-usa

## Field Requirements

### Required Fields
- **type**: Must be "person" or "company"
- **category**: Must be one of the valid categories listed above
- **name**: Full name for person or company name
- **email**: Valid email address
- **nominator_name**: Name of the person making the nomination (usually "Admin User")
- **nominator_email**: Email of the nominator (usually admin email)

### Optional Fields
- **company**: Company name (for person type, leave empty for company type)
- **country**: Country name

## Benefits of This Approach
1. **Direct Admin Control**: All nominations are immediately approved
2. **No Upload Errors**: Manual processing ensures data integrity
3. **Flexible Format**: Can handle various CSV formats and fix issues on the fly
4. **Immediate Results**: Nominations appear in the system right away

## Next Steps
1. Prepare your CSV data following the format above
2. Send it to me for processing
3. I'll validate, process, and save it to Supabase
4. You can then view the nominations in the admin panel

## Script Available
There's also a script at `scripts/process-csv-data.js` that can be used to process CSV data programmatically if needed in the future.