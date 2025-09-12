# Admin Nomination System - Final Setup Instructions

## Overview
This document provides step-by-step instructions to set up the complete admin nomination system with all the fixes requested.

## What This System Provides

### ✅ Fixed Issues
1. **Admin can nominate anytime** - Even when public nominations are closed
2. **Proper category dropdowns** - Shows subcategories grouped by main categories
3. **Draft approval workflow** - Nominations go to drafts first, then get approved
4. **Automatic nominee emails** - Nominees get notified when approved with their page link
5. **Correct transactional email** - Uses proper Loops email templates

### 🎯 Key Features
- **Dynamic Categories**: Fetches from database instead of hardcoded constants
- **Type Filtering**: Shows only relevant categories (person/company/both)
- **Draft Management**: Admin panel to review and approve nominations
- **Email Integration**: Automatic approval emails with nominee page URLs
- **Bypass Controls**: Admin can nominate when public nominations are closed

## Setup Steps

### Step 1: Database Schema Setup

**Option A: Manual Setup (Recommended)**
1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the entire content from `MANUAL_SCHEMA_SETUP.sql`
4. Paste it into the SQL Editor
5. Click "Run" to execute all statements
6. Verify the verification queries at the end show proper counts

**Option B: API Setup (Alternative)**
1. Ensure your development server is running (`npm run dev`)
2. Run: `node scripts/setup-admin-schema-simple.js`
3. Check the output for any errors

### Step 2: Verify Database Setup

Run these queries in Supabase SQL Editor to verify:

```sql
-- Check category groups
SELECT * FROM public.category_groups ORDER BY display_order;

-- Check subcategories with groups
SELECT 
  sc.name as subcategory,
  cg.name as category_group,
  sc.nomination_type
FROM public.subcategories sc
JOIN public.category_groups cg ON sc.category_group_id = cg.id
ORDER BY cg.display_order, sc.display_order;

-- Check settings
SELECT * FROM public.settings;
```

Expected results:
- 6 category groups
- 18 subcategories
- 1 settings record

### Step 3: Test the Admin Nomination System

1. **Access Admin Panel**
   ```
   Go to: http://localhost:3000/admin
   ```

2. **Test Category Loading**
   - Click "Add Nominee" tab
   - Verify category dropdown shows proper subcategories
   - Switch between "Person" and "Company" types
   - Verify categories filter correctly

3. **Create Test Nomination**
   - Fill out the form with test data
   - Use a real email address for testing
   - Click "Create Nomination"
   - Verify success message appears

4. **Check Draft Management**
   - Click "Drafts" tab
   - Verify your test nomination appears
   - Review the nomination details
   - Click "Approve" button

5. **Verify Email Sending**
   - Check if approval email was sent
   - Verify email contains nominee page URL
   - Check Loops dashboard for email delivery

6. **Verify Public Appearance**
   - Go to main nominations page
   - Verify approved nomination appears
   - Check nominee individual page works

### Step 4: Test Bypass Functionality

1. **Close Public Nominations**
   - In admin panel, go to "Settings" tab
   - Turn off "Nominations Open"
   - Save settings

2. **Test Admin Bypass**
   - Try creating another nomination as admin
   - Verify it works despite nominations being closed
   - Regular users should not be able to nominate

3. **Reopen Nominations**
   - Turn "Nominations Open" back on
   - Save settings

## File Structure

### New Files Created
```
src/
├── app/api/admin/nominations/
│   ├── create/route.ts          # Create draft nominations
│   ├── drafts/route.ts          # Get draft nominations
│   └── approve/route.ts         # Approve draft nominations
├── components/admin/
│   └── DraftNominationsPanel.tsx # Draft management UI
└── server/loops/
    └── transactional.ts         # Enhanced with nominee approval emails

scripts/
├── apply-admin-nomination-fixes.js
├── setup-admin-schema-simple.js
└── test-admin-nomination-complete.js

Database/
├── ADMIN_NOMINATION_FIXES_COMPLETE.sql
├── MANUAL_SCHEMA_SETUP.sql
└── ADMIN_NOMINATION_SYSTEM_COMPLETE.md
```

### Modified Files
```
src/
├── app/admin/page.tsx           # Added drafts tab
├── components/admin/AdminNominationForm.tsx # Updated with database categories
└── server/loops/transactional.ts # Added nominee approval email
```

## Database Schema

### New Tables
1. **category_groups** - Main category groups (6 records)
2. **subcategories** - Award categories (18 records)
3. **admin_nominations** - Draft nominations pending approval
4. **settings** - Global nomination/voting controls
5. **loops_outbox** - Enhanced email queue

### Key Relationships
- subcategories → category_groups (many-to-one)
- admin_nominations → subcategories (many-to-one)
- nominations → subcategories (many-to-one)

## Environment Variables Required

```env
# Existing (should already be set)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOOPS_API_KEY=your_loops_api_key

# Optional
LOOPS_SYNC_ENABLED=true
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Troubleshooting

### Common Issues

1. **Categories not loading**
   - Check if category tables exist in database
   - Verify API endpoint `/api/categories` works
   - Check browser console for errors

2. **Draft nominations not appearing**
   - Verify `admin_nominations` table exists
   - Check if nomination was created successfully
   - Refresh the drafts panel

3. **Approval failing**
   - Check database constraints
   - Verify all required tables exist
   - Check server logs for errors

4. **Emails not sending**
   - Verify `LOOPS_API_KEY` is set
   - Check Loops dashboard for API errors
   - Verify email template IDs are correct

### Debug Steps

1. **Check Database Tables**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('category_groups', 'subcategories', 'admin_nominations', 'settings');
   ```

2. **Test API Endpoints**
   ```bash
   curl http://localhost:3000/api/categories
   curl http://localhost:3000/api/admin/nominations/drafts
   ```

3. **Check Server Logs**
   - Look for database connection errors
   - Check for API validation errors
   - Verify email sending logs

## Testing Checklist

- [ ] Database schema applied successfully
- [ ] Category groups and subcategories created
- [ ] Categories API returns proper data
- [ ] Admin form shows filtered categories
- [ ] Draft nominations created successfully
- [ ] Drafts panel displays nominations
- [ ] Approval process works end-to-end
- [ ] Nominee approval emails sent
- [ ] Approved nominations appear publicly
- [ ] Admin bypass works when nominations closed
- [ ] All test data cleaned up

## Success Criteria

When everything is working correctly:

1. **Admin Form**: Shows proper categories filtered by type
2. **Draft Creation**: Creates nominations in draft state
3. **Draft Panel**: Shows pending nominations with full details
4. **Approval Process**: Creates all required database records
5. **Email Sending**: Sends approval emails with nominee page URLs
6. **Public Display**: Approved nominations appear in public view
7. **Bypass Functionality**: Admin can nominate when public nominations are closed

## Next Steps After Setup

1. **Production Deployment**: Deploy the updated code to production
2. **Email Template Customization**: Customize Loops email templates if needed
3. **User Training**: Train admin users on the new workflow
4. **Monitoring**: Monitor email delivery and system performance
5. **Backup**: Ensure database backups include new tables

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review server logs for specific error messages
3. Verify all environment variables are set correctly
4. Test individual components (database, APIs, emails) separately
5. Use the provided test scripts to isolate issues

The system is designed to be robust and handle edge cases, but proper setup is crucial for optimal performance.