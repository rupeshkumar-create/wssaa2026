# Admin Nomination System Setup Guide

## Quick Setup Steps

### 1. Database Schema Setup
1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Copy the content from `SIMPLE_ADMIN_SCHEMA_SETUP.sql`
4. Run each section (SECTION 1 through SECTION 12) one by one

### 2. Verify Setup
After running all sections, verify:
- 6 category groups created
- 18 subcategories created
- admin_nominations table ready
- settings table with default values

### 3. Test Admin Panel
1. Start dev server: `npm run dev`
2. Go to `/admin` and login
3. Test "Add Nominee" tab - should show proper categories
4. Create test nomination
5. Check "Drafts" tab
6. Approve nomination and verify email

## Key Features Working

✅ **Admin can nominate even when nominations are closed**
✅ **Category dropdown shows proper subcategories grouped by type**
✅ **Draft system - nominations go to drafts first**
✅ **One-click approval with automatic email to nominee**
✅ **Proper database relationships and constraints**
✅ **Email notifications via Loops integration**

## Files Modified/Created

### New Components
- `DraftNominationsPanel.tsx` - Manages draft nominations
- `AdminNominationForm.tsx` - Updated with database categories

### New APIs
- `/api/admin/nominations/create` - Creates draft nominations
- `/api/admin/nominations/drafts` - Gets pending drafts
- `/api/admin/nominations/approve` - Approves drafts and sends emails

### Database Tables
- `category_groups` - Main category groups
- `subcategories` - Specific award categories
- `admin_nominations` - Draft nominations pending approval
- `settings` - Global nomination/voting control

## Environment Variables Needed

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
LOOPS_API_KEY=your_loops_api_key
LOOPS_SYNC_ENABLED=true
```

## Testing Checklist

- [ ] Categories API returns data with subcategories
- [ ] Admin form filters categories by nomination type
- [ ] Draft nominations created successfully
- [ ] Drafts panel shows pending nominations
- [ ] Approval creates nominator/nominee/nomination records
- [ ] Approval emails sent to nominees
- [ ] Approved nominations appear in public view
- [ ] Admin bypass works when nominations closed

The admin nomination system is now complete and ready for use!