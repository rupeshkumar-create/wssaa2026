# Admin Nomination System - Complete Setup Guide

## Overview
This implementation provides a complete admin nomination system with the following features:

✅ **Admin can nominate anytime** - Even when public nominations are closed  
✅ **No draft system** - Admin nominations go directly to main nominations list  
✅ **Source tracking** - Track which nominations came from admin vs public  
✅ **Proper categories** - Database-driven categories with subcategories  
✅ **Orange submit button** - Changed from blue to orange in admin panel  
✅ **Approval emails** - Automatic emails sent when admin approves nominations  
✅ **Reporting** - Shows counts of admin vs public nominations  

## Setup Steps

### Step 1: Database Schema Setup

**Option A: Run the category setup SQL**
1. Go to Supabase SQL Editor
2. Copy and run the content from `SIMPLE_ADMIN_SCHEMA_SETUP.sql`
3. Run each section (SECTION 1 through SECTION 12) one by one

**Option B: Add source tracking to existing setup**
1. If you already have categories, just run `ADD_NOMINATION_SOURCE_TRACKING.sql`
2. This adds the `nomination_source` and `additional_votes` columns

### Step 2: Verify Categories API

Run the test script:
```bash
node scripts/test-categories-working.js
```

Expected output:
- ✅ Categories API working with 18+ categories
- ✅ Person and company categories found
- ✅ Proper category structure with groups

### Step 3: Test Admin Nomination System

Run the complete test:
```bash
node scripts/test-admin-nomination-system-complete.js
```

This will:
- Test category loading
- Create test admin nominations (person and company)
- Verify source tracking
- Show what to expect in admin panel

### Step 4: Test in Admin Panel

1. Go to `/admin` and login
2. Click "Add Nominee" tab
3. Verify:
   - Categories dropdown shows proper subcategories
   - Person/Company filtering works
   - Submit button is orange
   - Form creates nominations successfully

4. Click "Nominations" tab
5. Verify:
   - Admin nominations appear with "admin" source
   - Can approve nominations
   - Approval sends emails to nominees

## Key Features Implemented

### 1. Removed Draft System
- Admin nominations go directly to main `nominations` table
- No separate `admin_nominations` table needed
- Nominations appear immediately in admin panel for approval

### 2. Source Tracking
- `nomination_source` field tracks 'admin' vs 'public'
- Admin nominations marked with `isAdminNomination: true`
- Reporting shows breakdown by source

### 3. Categories Integration
- Uses same categories across all forms:
  - Admin nomination form
  - Public nomination form  
  - Directory filters
  - Home page categories
- Database-driven instead of hardcoded constants
- Proper filtering by nomination type (person/company/both)

### 4. Approval Workflow
- Admin can approve any nomination from nominations list
- Approval triggers:
  - State change to 'approved'
  - Auto-generation of live URL
  - Email notification to nominee
  - Appearance in public nominees view

### 5. Email Integration
- Uses existing Loops transactional email service
- Sends approval emails with nominee page URLs
- Proper error handling and logging

## File Structure

### Updated Files
```
src/
├── components/admin/AdminNominationForm.tsx    # Updated to use main API, orange button
├── app/admin/page.tsx                          # Removed drafts tab
├── app/api/nomination/submit/route.ts          # Added admin source tracking
├── app/api/admin/nominations/route.ts          # Updated to use main nominations table
└── server/loops/transactional.ts              # Enhanced approval emails

scripts/
├── test-categories-working.js                  # Test categories across all forms
└── test-admin-nomination-system-complete.js    # Test complete admin workflow

database/
├── SIMPLE_ADMIN_SCHEMA_SETUP.sql              # Complete schema setup
└── ADD_NOMINATION_SOURCE_TRACKING.sql         # Add source tracking to existing setup
```

### New APIs
- `/api/admin/nomination-stats` - Get admin vs public nomination counts

## Database Schema

### Key Tables
1. **category_groups** - Main category groups (6 records)
2. **subcategories** - Award categories (18 records) 
3. **nominations** - All nominations with source tracking
4. **nominees** - Nominee details
5. **nominators** - Nominator details

### Key Fields Added
- `nominations.nomination_source` - 'admin' or 'public'
- `nominations.additional_votes` - Manual vote adjustments
- `subcategories.nomination_type` - 'person', 'company', or 'both'

## Testing Checklist

- [ ] Categories API returns proper data with subcategories
- [ ] Admin form shows filtered categories by type
- [ ] Admin form submit button is orange
- [ ] Admin nominations created with 'admin' source
- [ ] Admin nominations appear in nominations list
- [ ] Admin can approve nominations
- [ ] Approval emails sent to nominees
- [ ] Approved nominations appear in public view
- [ ] Source tracking works (admin vs public counts)
- [ ] Categories work in public form, directory, home page

## Troubleshooting

### Categories Not Showing
1. Check if category tables exist in Supabase
2. Verify `/api/categories` endpoint works
3. Check browser console for errors
4. Ensure RLS policies allow public read access

### Admin Nominations Not Creating
1. Check browser console for API errors
2. Verify nomination submission API works
3. Check database constraints
4. Ensure all required fields are provided

### Approval Emails Not Sending
1. Verify `LOOPS_API_KEY` environment variable
2. Check Loops dashboard for API errors
3. Verify email template IDs are correct
4. Check server logs for email errors

## Environment Variables

```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOOPS_API_KEY=your_loops_api_key

# Optional
LOOPS_SYNC_ENABLED=true
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Success Criteria

The system is working correctly when:

1. **Categories**: Dropdown shows proper subcategories grouped by type
2. **Admin Form**: Creates nominations that appear in nominations list
3. **Source Tracking**: Admin nominations marked as 'admin' source
4. **Approval**: Admin can approve nominations and emails are sent
5. **Public Display**: Approved nominations appear in public nominees view
6. **Reporting**: Stats show breakdown of admin vs public nominations

## Next Steps

1. **Production Deployment**: Deploy updated code to production
2. **User Training**: Train admin users on new workflow
3. **Monitoring**: Monitor nomination creation and approval rates
4. **Reporting**: Use nomination stats API for admin dashboard
5. **Cleanup**: Remove any old draft-related code if not needed

The admin nomination system is now complete and production-ready!