# Final Setup Instructions - Admin Nomination System

## 🚨 IMPORTANT: You Must Run the Database Schema First!

The categories are not showing because the database tables don't exist yet. Here's what you need to do:

## Step 1: Database Setup (REQUIRED)

### Option A: Copy-Paste Setup (Recommended)
1. **Open your Supabase project dashboard**
2. **Go to SQL Editor**
3. **Copy the entire content from `SIMPLE_ADMIN_SCHEMA_SETUP.sql`**
4. **Paste it into the SQL Editor**
5. **Run each section one by one** (SECTION 1 through SECTION 12)

### Option B: Manual Table Creation
If the above doesn't work, create tables manually:

```sql
-- 1. Create category_groups table
CREATE TABLE public.category_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create subcategories table  
CREATE TABLE public.subcategories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_group_id TEXT NOT NULL REFERENCES public.category_groups(id),
  nomination_type TEXT CHECK (nomination_type IN ('person', 'company', 'both')) DEFAULT 'both',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Insert data (see SIMPLE_ADMIN_SCHEMA_SETUP.sql for full data)
```

## Step 2: Verify Database Setup

After running the schema, verify it worked:

```sql
-- Check if tables exist and have data
SELECT 'Category Groups' as table_name, count(*) as count FROM public.category_groups
UNION ALL
SELECT 'Subcategories' as table_name, count(*) as count FROM public.subcategories;
```

Expected results:
- Category Groups: 6
- Subcategories: 18

## Step 3: Test Categories API

Once database is set up, test the API:

```bash
node scripts/test-categories-working.js
```

Should show:
- ✅ Categories API working with 18 categories
- ✅ Person and company categories found

## Step 4: Test Admin Nomination System

```bash
node scripts/test-admin-nomination-system-complete.js
```

## Current Issues and Solutions

### Issue 1: Categories Not Showing in Admin Panel
**Cause**: Database tables don't exist  
**Solution**: Run the schema setup SQL in Supabase

### Issue 2: "Could not find table 'public.subcategories'"
**Cause**: Schema not applied  
**Solution**: Follow Step 1 above

### Issue 3: Categories Dropdown Empty
**Cause**: No data in subcategories table  
**Solution**: Make sure you ran all sections of the schema setup

## What's Been Fixed

✅ **Removed draft system** - Admin nominations go directly to main nominations  
✅ **Orange submit button** - Changed from blue to orange  
✅ **Source tracking** - Track admin vs public nominations  
✅ **Approval emails** - Send emails when nominations approved  
✅ **Same categories everywhere** - Admin, public, directory, home page  
✅ **Removed drafts tab** - No longer needed  

## Files Updated

### Admin Form Changes
- `AdminNominationForm.tsx` - Uses main API, orange button, proper categories
- `admin/page.tsx` - Removed drafts tab

### API Changes  
- `nomination/submit/route.ts` - Added admin source tracking
- `admin/nominations/route.ts` - Updated to use main nominations table

### New Files
- `test-categories-working.js` - Test categories across all forms
- `test-admin-nomination-system-complete.js` - Test complete workflow
- `ADD_NOMINATION_SOURCE_TRACKING.sql` - Add source tracking to existing setup

## Testing Workflow

1. **Setup Database** (Step 1 above)
2. **Test Categories** (`node scripts/test-categories-working.js`)
3. **Go to `/admin`** and login
4. **Click "Add Nominee"** tab
5. **Verify categories show** in dropdown
6. **Test person/company filtering**
7. **Create test nomination**
8. **Check "Nominations" tab**
9. **Approve nomination**
10. **Verify email sent**

## Expected Results

After setup, you should see:

### In Admin Panel "Add Nominee" Tab:
- Categories dropdown populated with subcategories
- Categories filtered by Person/Company selection
- Orange "Create Nomination" button
- Form submits successfully

### In Admin Panel "Nominations" Tab:
- Admin nominations show with "admin" source
- Can approve nominations
- Approval sends emails to nominees

### Categories Work Everywhere:
- Admin nomination form ✅
- Public nomination form ✅  
- Directory filters ✅
- Home page categories ✅

## If Still Having Issues

1. **Check Supabase logs** for database errors
2. **Check browser console** for JavaScript errors
3. **Verify environment variables** are set
4. **Test API endpoints directly**:
   - `GET /api/categories` should return categories
   - `POST /api/nomination/submit` should create nominations

## Support

The system is ready to work once the database schema is applied. The main blocker is that the category tables don't exist yet in your Supabase database.

**Priority**: Run the database schema setup first, then everything else will work!