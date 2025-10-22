# Profile Images Update Guide

This guide explains how to update profile images for leaders and company logos in the World Staffing Awards application.

## Overview

I've created scripts and SQL files to update profile images for leaders and company logos based on the data you provided. The system will:

1. **Update person nominees** - Match by email address and update `headshot_url`
2. **Update company nominees** - Match by company name and update `logo_url`

## Files Created

### 1. SQL Script (Recommended)
- **File**: `UPDATE_LEADER_PROFILE_IMAGES.sql`
- **Description**: Direct SQL updates for all profile images
- **Usage**: Run this in your Supabase SQL editor

### 2. Node.js Scripts
- **File**: `scripts/update-leader-profile-images.js` - Complete update script
- **File**: `scripts/test-and-update-images.js` - Test connection and sample updates

## Prerequisites

Before running the updates, ensure you have:

1. **Supabase Credentials**: Update your `.env.local` file with actual Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```

2. **Database Schema**: Ensure your `nominees` table has the correct structure with:
   - `headshot_url` column for person nominees
   - `logo_url` column for company nominees

## Method 1: SQL Script (Recommended)

1. **Open Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to SQL Editor

2. **Run the SQL Script**
   - Copy the contents of `UPDATE_LEADER_PROFILE_IMAGES.sql`
   - Paste into SQL Editor
   - Execute the script

3. **Verify Results**
   - The script includes verification queries at the end
   - Check the summary output to see how many images were updated

## Method 2: Node.js Script

1. **Update Environment Variables**
   ```bash
   # Update .env.local with your actual Supabase credentials
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
   ```

2. **Test Connection First**
   ```bash
   node scripts/test-and-update-images.js
   ```

3. **Run Full Update**
   ```bash
   node scripts/update-leader-profile-images.js
   ```

## Data Coverage

### Person Nominees (21 leaders)
The script will update profile images for leaders including:
- Ranjit Nair (eTeam)
- Corey Michaels (Adecco)
- Michelle Davis (Travel Nurses)
- Justin Christian (BCforward)
- Ashley Holahan (IDR)
- And 16 more leaders...

### Company Nominees (22 companies)
The script will update logos for companies including:
- eTeam
- TekWissen
- Travel Nurses
- BCforward
- IDR
- Spherion
- And 16 more companies...

## Matching Logic

### Person Nominees
- **Primary Match**: `person_email` field
- **Update Field**: `headshot_url`
- **Fallback**: If email doesn't match, the nominee won't be updated

### Company Nominees
- **Primary Match**: `company_name` field (case-insensitive partial match)
- **Update Field**: `logo_url`
- **Matching Examples**:
  - "eTeam" matches companies with names containing "eTeam" or "eteam"
  - "BCforward" matches companies with names containing "BCforward" or "bcforward"

## Verification

After running the updates, you can verify the results:

### Check Updated Images
```sql
-- Count nominees with images
SELECT 
  'Person nominees with images' as category,
  COUNT(*) as count
FROM public.nominees 
WHERE type = 'person' AND headshot_url IS NOT NULL AND headshot_url != ''

UNION ALL

SELECT 
  'Company nominees with logos' as category,
  COUNT(*) as count
FROM public.nominees 
WHERE type = 'company' AND logo_url IS NOT NULL AND logo_url != '';
```

### View Sample Updated Nominees
```sql
-- Show examples of updated nominees
SELECT 
  type,
  CASE 
    WHEN type = 'person' THEN firstname || ' ' || lastname
    ELSE company_name
  END as name,
  CASE 
    WHEN type = 'person' THEN headshot_url
    ELSE logo_url
  END as image_url
FROM public.nominees 
WHERE (type = 'person' AND headshot_url IS NOT NULL AND headshot_url != '') 
   OR (type = 'company' AND logo_url IS NOT NULL AND logo_url != '')
ORDER BY type, name
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **No nominees found for email**
   - Check if the nominee exists in the database
   - Verify the email address matches exactly
   - Ensure the nominee type is 'person'

2. **No companies found for name**
   - Check if the company exists as a nominee
   - Verify the company name in the database
   - Ensure the nominee type is 'company'

3. **Database connection failed**
   - Verify Supabase credentials in `.env.local`
   - Check if the Supabase project is active
   - Ensure the service role key has proper permissions

### Manual Updates

If some images don't update automatically, you can update them manually:

```sql
-- Update specific person nominee
UPDATE public.nominees 
SET headshot_url = 'https://your-image-url-here',
    updated_at = NOW()
WHERE type = 'person' AND person_email = 'specific@email.com';

-- Update specific company nominee
UPDATE public.nominees 
SET logo_url = 'https://your-logo-url-here',
    updated_at = NOW()
WHERE type = 'company' AND company_name ILIKE '%Company Name%';
```

## Image URL Format

All image URLs are LinkedIn media URLs with the following characteristics:
- **Format**: `https://media.licdn.com/dms/image/v2/...`
- **Size**: Profile photos are 400x400px, logos are 200x200px
- **Expiration**: URLs include expiration timestamps (e=1762992000)

## Next Steps

1. **Run the Updates**: Use either the SQL script or Node.js script
2. **Verify Results**: Check that images are displaying correctly in the application
3. **Test Frontend**: Ensure the updated images appear in the nominee cards and profiles
4. **Monitor Performance**: LinkedIn image URLs should load quickly and reliably

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Verify your database schema matches the expected structure
3. Ensure all environment variables are properly configured
4. Test with a small subset of updates first

The profile images should now be properly updated and displayed throughout the application!