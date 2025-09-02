# HubSpot Sync Fix for Vercel Production

## Issue Identified
The HubSpot sync is not working in production because the `HUBSPOT_SYNC_ENABLED` environment variable is not set to `'true'` in Vercel.

## Current Status
- ✅ HUBSPOT_ACCESS_TOKEN: Present
- ✅ HUBSPOT_TOKEN: Present  
- ❌ HUBSPOT_SYNC_ENABLED: Not set to 'true'

## Required Vercel Environment Variables

You need to add/update these environment variables in your Vercel project:

### 1. HubSpot Configuration
```
HUBSPOT_SYNC_ENABLED=true
HUBSPOT_ACCESS_TOKEN=your_hubspot_access_token
```

### 2. Optional HubSpot Settings
```
HUBSPOT_CONTACT_LINKEDIN_KEY=linkedin
HUBSPOT_COMPANY_LINKEDIN_KEY=linkedin_company_page
HUBSPOT_PIPELINE_ID=default-pipeline
```

## How to Fix in Vercel

### Method 1: Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Select your `wssaa2026` project
3. Go to Settings → Environment Variables
4. Add the missing variable:
   - **Name**: `HUBSPOT_SYNC_ENABLED`
   - **Value**: `true`
   - **Environment**: Production (and Preview if needed)
5. Click "Save"
6. Redeploy your application

### Method 2: Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Set the environment variable
vercel env add HUBSPOT_SYNC_ENABLED production
# When prompted, enter: true

# Redeploy
vercel --prod
```

### Method 3: Using the Script
I've created a script to help you set this up:

```bash
# Run the fix script
node scripts/fix-production-hubspot-sync.js
```

## Verification Steps

After setting the environment variable and redeploying:

1. **Test Environment**:
   ```bash
   curl https://wssaa2026.vercel.app/api/test-env
   ```
   Should show `hubspot.configured: true`

2. **Test HubSpot Connection**:
   ```bash
   curl https://wssaa2026.vercel.app/api/sync/hubspot/test
   ```

3. **Test Form Submission**:
   Submit a test nomination through your live form and check if both nominator and nominee sync to HubSpot.

4. **Run Full Test Suite**:
   ```bash
   node scripts/test-production-hubspot-sync.js
   ```

## Expected Behavior After Fix

When someone submits a nomination form:

1. **Nominator** → Immediately synced to HubSpot with tag "WSA 2026 Nominator"
2. **Nominee** → Immediately synced to HubSpot with tag "WSA 2026 Nominees" 
3. **Backup Sync** → Entry created in `hubspot_outbox` table for retry if needed
4. **Admin Approval** → Updates nominee status in HubSpot
5. **Voting** → Voters synced with tag "WSA 2026 Voters"

## HubSpot Properties Created

The system will automatically create these custom properties in your HubSpot:

### Contact Properties
- `wsa_role` (Nominator/Nominee/Voter)
- `wsa_year` (2026)
- `wsa_source` (World Staffing Awards)
- `wsa_contact_tag` (WSA 2026 Nominator/Nominees/Voters)
- `wsa_linkedin`, `wsa_company`, `wsa_job_title`, etc.

### Company Properties  
- `wsa_company_tag` (Nominator 2026)
- `wsa_category` (Nomination Category)
- `wsa_nomination_id`

## Troubleshooting

If sync still doesn't work after setting the environment variable:

1. **Check Logs**: Go to Vercel → Functions → View logs
2. **Verify Token**: Ensure your HubSpot token has these scopes:
   - `crm.objects.contacts.read`
   - `crm.objects.contacts.write`
   - `crm.objects.companies.read`
   - `crm.objects.companies.write`
   - `crm.schemas.contacts.read`
   - `crm.schemas.contacts.write`

3. **Manual Sync**: Use the admin panel to trigger manual sync
4. **Test API**: Use the test endpoints to diagnose issues

## Contact for Support

If you need help with:
- Setting up HubSpot private app
- Configuring environment variables
- Debugging sync issues

Let me know and I can provide more specific guidance.