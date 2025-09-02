# Vercel Deployment Guide

## Quick Fix for Current Error

The error you're seeing is because Vercel doesn't have the required environment variables. Here's how to fix it:

### 1. Set Environment Variables in Vercel

Go to your Vercel project dashboard and add these environment variables:

#### Required Variables (Minimum to fix the error):
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd
```

### 2. Get Your Supabase Credentials

If you don't have a Supabase project yet:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy the Project URL and Service Role Key

### 3. Deploy Steps

1. **Connect Repository to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository: `rupeshkumar-create/wssaa2026`

2. **Add Environment Variables:**
   - In Vercel project settings, go to "Environment Variables"
   - Add all the variables from the template above
   - Make sure to escape the `$` characters in the password hash with backslashes

3. **Redeploy:**
   - After adding environment variables, trigger a new deployment
   - The build should now succeed

## Alternative: Deploy Without Supabase (Local Storage Mode)

If you want to deploy quickly without setting up Supabase, you can use local storage mode:

### Environment Variables for Local Storage Mode:
```
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd
```

This will use local JSON files for data storage (suitable for testing/demo).

## Admin Login Credentials

Once deployed, you can access the admin panel at:
- URL: `https://your-app.vercel.app/admin`
- Email: `admin@worldstaffingawards.com`
- Password: `WSA2026Admin!Secure`

## Troubleshooting

### Build Still Failing?
1. Check that all environment variables are set correctly
2. Make sure the password hash is properly escaped with backslashes
3. Verify your Supabase credentials are correct

### Need Help?
- Check the Vercel build logs for specific error messages
- Ensure your GitHub repository is public or Vercel has access
- Contact support if you need help with Supabase setup

## Next Steps After Deployment

1. Set up your Supabase database schema
2. Configure HubSpot integration (optional)
3. Set up Loops.so integration (optional)
4. Test the nomination and voting flow
5. Customize the branding and content