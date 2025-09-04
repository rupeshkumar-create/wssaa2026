# Separated Bulk Upload System Guide

## Overview

The Separated Bulk Upload System allows administrators to upload person and company nominations using separate CSV files with comprehensive category examples. All uploads go to draft status for manual approval before syncing to Loops with appropriate user groups.

## Key Features

### 🔄 Separated Upload Types
- **Person Nominations**: Individual recruiters, leaders, influencers, educators
- **Company Nominations**: Staffing firms, platforms, agencies, podcasts

### 📋 Draft & Approval Workflow
- All uploads saved as drafts for quality control
- Manual approval process before public visibility
- Batch approval with automatic Loops sync

### 🎯 Smart Loops Integration
- Automatic user group assignment based on type and category
- Regional grouping (USA, Europe, Global)
- Real-time sync status tracking

## Person Categories Included

### Role-Specific Categories
- `top-recruiter` - Top performing recruiters
- `top-executive-leader` - C-level executives (CEO/COO/CMO/CRO)

### Regional Categories
- `top-recruiting-leader-usa` - USA recruiting leaders
- `top-recruiter-usa` - USA recruiters
- `top-recruiting-leader-europe` - European recruiting leaders  
- `top-recruiter-europe` - European recruiters
- `top-global-recruiter` - Global recruiters
- `top-global-staffing-leader` - Global staffing leaders

### Thought Leadership
- `top-staffing-influencer` - LinkedIn/X/Blog influencers
- `top-thought-leader` - Industry thought leaders
- `top-staffing-educator` - Coaches and educators

### Special Recognition
- `rising-star-under-30` - Rising stars under 30

## Company Categories Included

### Regional Categories
- `top-staffing-company-usa` - Top USA staffing companies
- `top-staffing-company-europe` - Top European staffing companies
- `top-global-staffing-company` - Global staffing companies

### Technology Categories
- `top-ai-driven-staffing-platform` - AI-powered platforms
- `top-ai-driven-platform-usa` - USA AI platforms
- `top-ai-driven-platform-europe` - European AI platforms
- `top-digital-experience-for-clients` - Digital experience leaders

### Specialized Categories
- `top-women-led-staffing-firm` - Women-led firms
- `fastest-growing-staffing-firm` - Fastest growing companies
- `best-staffing-podcast-or-show` - Podcasts and shows

## CSV Template Structure

### Person Nominations Template
```csv
first_name,last_name,job_title,company_name,email,phone,country,linkedin,bio,achievements,why_vote_for_me,headshot_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
```

**Required Fields:**
- `first_name` - Person's first name
- `last_name` - Person's last name  
- `job_title` - Current job title
- `email` - Contact email
- `country` - Country of residence
- `why_vote_for_me` - Compelling reason to vote
- `category` - Must match valid person category

**Optional Fields:**
- `company_name` - Current company
- `phone` - Phone number
- `linkedin` - LinkedIn profile URL
- `bio` - Professional biography (max 2000 chars)
- `achievements` - Key achievements (max 2000 chars)
- `headshot_url` - Professional headshot image URL
- `nominator_*` - Nominator details (can be empty)

### Company Nominations Template
```csv
company_name,website,email,phone,country,industry,company_size,bio,achievements,why_vote_for_me,logo_url,category,nominator_name,nominator_email,nominator_company,nominator_job_title,nominator_phone,nominator_country
```

**Required Fields:**
- `company_name` - Company name
- `email` - Contact email
- `country` - Country of operation
- `why_vote_for_me` - Compelling reason to vote
- `category` - Must match valid company category

**Optional Fields:**
- `website` - Company website URL
- `phone` - Phone number
- `industry` - Industry sector
- `company_size` - Employee count range
- `bio` - Company description (max 2000 chars)
- `achievements` - Key achievements (max 2000 chars)
- `logo_url` - Company logo image URL
- `nominator_*` - Nominator details (can be empty)

## Workflow Process

### 1. Template Download
- Choose person or company template
- Templates include comprehensive examples for all categories
- Real-world examples with proper formatting

### 2. CSV Preparation
- Fill required fields for each nomination
- Nominator fields can be left empty
- Validate URLs and email formats
- Keep text fields within character limits

### 3. Upload to Draft
- Select appropriate upload type (person/company)
- Upload CSV file (max 10MB)
- System validates all data
- Successful uploads saved as drafts

### 4. Review & Approval
- View upload batches with statistics
- Review any validation errors
- Approve draft nominations in batches
- System handles Loops sync automatically

### 5. Loops Integration
- Approved nominations sync to Loops
- Smart user group assignment:
  - `nominees-person-usa` - USA person nominees
  - `nominees-person-europe` - European person nominees
  - `nominees-person-global` - Global person nominees
  - `nominees-person-general` - General person nominees
  - `nominees-company-usa` - USA company nominees
  - `nominees-company-europe` - European company nominees
  - `nominees-company-global` - Global company nominees
  - `nominees-company-general` - General company nominees

## Validation Rules

### Email Validation
- Must be valid email format
- Required for nominees
- Optional for nominators

### URL Validation
- LinkedIn, website, image URLs must be valid
- Optional fields

### Text Length Limits
- `why_vote_for_me`: 1000 characters max
- `bio`: 2000 characters max
- `achievements`: 2000 characters max

### Category Validation
- Must match exactly with predefined categories
- Case-sensitive matching
- Separate validation for person vs company

## Error Handling

### Upload Errors
- Row-by-row validation
- Detailed error messages with field names
- Failed rows excluded from draft creation
- Error summary in batch statistics

### Sync Errors
- Individual nomination sync status tracking
- Retry mechanism for failed syncs
- Error logging for troubleshooting

## Best Practices

### Data Quality
- Use complete, accurate information
- Verify email addresses and URLs
- Keep descriptions concise but compelling
- Use professional headshots/logos

### Batch Management
- Upload in manageable batches (100-500 rows)
- Review errors before resubmitting
- Approve drafts promptly for timely sync

### Nominator Information
- Include nominator details when available
- Can be left empty for admin-initiated nominations
- Helps with relationship tracking

## API Endpoints

### Upload Endpoints
- `POST /api/admin/separated-bulk-upload` - Upload CSV file
- `GET /api/admin/separated-bulk-upload/batches` - List batches
- `GET /api/admin/separated-bulk-upload/batches/[id]/errors` - View errors

### Approval Endpoints
- `POST /api/admin/separated-bulk-upload/approve-drafts` - Approve batch

## Database Schema

### Tables Created
- `separated_bulk_upload_batches` - Batch tracking
- `separated_bulk_upload_errors` - Error logging
- `loops_user_groups` - User group configuration

### Views Created
- `draft_nominations_for_approval` - Draft nominations ready for approval
- `loops_sync_status` - Sync status summary

## Monitoring & Analytics

### Batch Statistics
- Total, successful, failed, draft, approved counts
- Upload and approval timestamps
- Error summaries

### Loops Sync Status
- Sync success/failure rates
- User group distribution
- Last sync timestamps

## Troubleshooting

### Common Issues
1. **Invalid Category**: Ensure category matches exactly
2. **Email Format**: Use valid email format (user@domain.com)
3. **URL Format**: Include http:// or https:// prefix
4. **Character Limits**: Keep text within specified limits
5. **CSV Format**: Use proper CSV formatting with commas

### Support
- Check error messages for specific field issues
- Validate data against template examples
- Contact system administrator for Loops sync issues

## Security Considerations

- Admin authentication required
- Row-level security on all tables
- Secure file upload handling
- API key protection for Loops integration

This separated bulk upload system provides a comprehensive, secure, and efficient way to manage large-scale nominations while maintaining data quality and proper workflow controls.