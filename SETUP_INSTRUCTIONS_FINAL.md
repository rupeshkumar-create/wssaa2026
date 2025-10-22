# Admin Nomination System Setup Instructions

## Quick Seded)

p
1. Open your Supabase projecboard

3. Copy and paste sql`
4. Run each section one by one (they are clearly marked as SECTION 1, SECTI2, etc.)

### Step 2: Verify the Setup
After running all sections, you should see:
- 6 category groups
egories  
- 0 admin nominatio
- 1 settings record

### Step 3: Test the Admin Panel
1. Start your development server: `npm run dev`
2. Go to `/admin` and login
e" tab
4. You should ries
ion
6. Check the "Drafts" tab to see ion
l is sent

## Manual Setup (If Quick Setup Fails)

If the quick setup doesn't work, run each section individ

### Section 1: Basic Tables
```sql
ps (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,

);

CREATE TABLE IF NOT EXISTS public.subcategories (
RY KEY,
  name
  category_group_id TEXT
  nomination_type TEXT CHECK (nomination_type IN ('person', ,
XT,
  display_order INTEGER DEFAULT 0,
  creatNOW()
);

CREATE TABLE IF NOT ettings (
  id TEXT PRIMARY KEY DEFAULT 'main',
  nominations_open BOOLEAN NOT NULL DEFAULT true,
  voting_open BOOLEAN NOT NULL DEFAULT true,

  voting_deadline,
  created_at TIMESTAMPTZ NOT N
  uULT NOW()

```

### Section 2: Adme
```sql
(
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
,
  subcategory_id TEXT NOTies(id),
  cate,
  
  -- Ps
 TEXT,
  lastname TEXT,
  jobtitle TEXT,
  person_email TEXT,
  person_linkedin TEXT,
  person_phone TEXT,

  person_country TEXT,
  headshot_url TEXT,
  why_me TEXT,
  bio TEXT,
  achievements TEXT,
  
  -- Company fields
  company_name TEXT,
  company_website TEXT,
  company_linkedin TEXT,
  company_email TEXT,
T,
  company_country TEXT,
  company_size TEXT,
  company_industry TEXT,
  logo_url TEXT,

  
  -- Admin fields
  admin_notes TEXT,
  state TEXT NOT NULL DEFAULT 'draft' CHected')),

  approved_at TIMESTAMPTZ,
EXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULTNOW(),
  updated_at TIMESTAMPTZ NOT NULNOW(),
  
s
  CONSTRAINT admin_nominHECK (
    nomination_type != 'person' OR (firstnameNULL)
  ),
  CONSTRAINT admin_nomination_company_required CH(
LL)
  )
);
```

Continue with the.

## Troubleshooting

### Issues

1. **"relation does not exist" error**
   - Make sure you ran the table creation sections first
   - Check that all foreign key references are created in thder

2. **"function does not exist" error**
   - Make sure yo)
   - The function uses `$$` delimiters, not `$`

3. **Cat**
   - Verify the categories API: `/a
   - Check that subcategories haips
   - Make sure RLS policies are set u

4. **Admi
   - Check the browser console for API 
   - Verify the admin_nominxists
   - Check that all required fields are

**
   - Verify `LOOPS
   e ID
   -ogs

### Verification Commands

Run:

```sql

SELECT 'Categooups
UNION ALL
SELECT 'Subcategories' as table_name, count(*) as cos
UNION ALL
SELECT 'Admin Nominations' as table_name, count(*) ons
UNION ALL


-- Check relationships
SELECT 
  sc.name as subcategory,

  sc.nomination_type

JOIN pd
ORDER BY cg.display_order, sc.dispder;

-- Test categories API data structure
SELECT 
d,
  sc.name,
  sc.nomination_type,
  json_build_object(
   
g.name
  ) as category_gr

JOIN public.categg.id

```

Expected results:
- Category Groups: 6
ries: 18
- Admin Nominations: 0 (initially)
- Settings: 1

## Testing the Complete Workflow

### 1. Test Category Log
- Go to `/admin`
- Click "Add Nominee" tab
- Verify dropdown shows categorieype
ories

### 2. Test Draft Creation
- Fill out the form completely
- Submit the nomination
n


- Click "Approve" on a draftion
- Verify 
  - `nominators` table
  - `nominees` table  
  - `nominations` table
- Checproved"

### 4. Test Email Sending
- Verify til
- Check server logs for email sending status
- Test with a real email address you can access

c Display
- Check that approved nonees`
- Verify the nominee page is accessible
- Test voting functionality



.local`:

```env
# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Loops Email (required for email notif
LOOPS_API_KEY=your_loops_api_key
LOOPS_SYNC_ENABLED=true

# Base URL (for email links)
3000
```

## Success Criteria

The setup is complete when:
- ✅ Categories API returns proper data with subcategories
- ✅ Admin form shows filtered categories based on type
- ✅ Draft nominations are created successfully
- ✅ Drafts panel displays pending nominations
- ✅ Approval process creates all required records
- ✅ Nominee approval emails are sent
c view
- ✅ Admin can nominate wh

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check the server logs for API errors

4. Test ints
ard

al!ctionlly fun now be fuhouldsystem smination n nomiThe ad