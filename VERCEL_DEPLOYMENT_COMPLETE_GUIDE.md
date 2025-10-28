# 🚀 Complete Vercel Deployment Guide

## Step 1: Prepare for Deployment

The `node-domexception@1.0.0` warning is just a deprecation notice and won't affect your deployment. Your app is ready to deploy!

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Option B: Using Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see below)
5. Deploy

## Step 3: Configure Environment Variables

In your Vercel project settings, add these environment variables:

### 🔴 Required Variables (Minimum for basic functionality):
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES=$2b$12$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd
```

### 🟡 Optional Variables (For full functionality):
```
HUBSPOT_ACCESS_TOKEN=your_hubspot_token_here
HUBSPOT_SYNC_ENABLED=true
LOOPS_API_KEY=your_loops_api_key_here
LOOPS_SYNC_ENABLED=true
WSA_YEAR=2026
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Step 4: Get Supabase Credentials

If you don't have a Supabase project:

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings > API
4. Copy:
   - Project URL (for SUPABASE_URL and NEXT_PUBLIC_SUPABASE_URL)
   - Anon key (for NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - Service role key (for SUPABASE_SERVICE_ROLE_KEY)

## Step 5: Set Up Database Schema

After deployment, set up your database:

1. Go to your Supabase project
2. Open SQL Editor
3. Run the schema from `supabase-schema.sql`
4. Create storage bucket named `nominee-images`
5. Set up storage policies for public access

## Step 6: Test Your Deployment

Once deployed, test these URLs:

- `https://your-app.vercel.app/` - Homepage
- `https://your-app.vercel.app/api/test-env` - Environment check
- `https://your-app.vercel.app/nominate` - Nomination form
- `https://your-app.vercel.app/directory` - Nominees directory
- `https://your-app.vercel.app/admin` - Admin panel

### Admin Login Credentials:
- Email: `admin@worldstaffingawards.com`
- Password: `WSA2026Admin!Secure`

## Troubleshooting Common Issues

### 1. Build Fails with Environment Variable Errors
- Make sure all required environment variables are set in Vercel
- Check that there are no typos in variable names
- Ensure the password hash is properly escaped

### 2. Database Connection Issues
- Verify Supabase credentials are correct
- Check that your Supabase project is active
- Ensure the database schema has been applied

### 3. 404 Errors on Pages
- Make sure the build completed successfully
- Check that all required files are in the repository
- Verify the deployment logs in Vercel dashboard

### 4. Admin Panel Not Working
- Check that admin environment variables are set correctly
- Verify the password hash is properly formatted
- Test the `/api/admin/test-env` endpoint

## Environment Variable Template

Copy this template and fill in your values:

```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Admin Configuration
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES=$2b$12$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca

# Security
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd

# Optional Integrations
HUBSPOT_ACCESS_TOKEN=your_hubspot_token_here
HUBSPOT_SYNC_ENABLED=true
LOOPS_API_KEY=your_loops_api_key_here
LOOPS_SYNC_ENABLED=true

# App Configuration
WSA_YEAR=2026
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Quick Deploy Script

Run this script to deploy quickly:

```bash
#!/bin/bash
echo "🚀 Deploying to Vercel..."

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

# Deploy
vercel --prod

echo "✅ Deployment complete!"
echo "Don't forget to set up environment variables in Vercel dashboard"
```

## Next Steps After Deployment

1. **Set up monitoring** - Add error tracking and performance monitoring
2. **Configure custom domain** - Set up your custom domain in Vercel
3. **Set up analytics** - Add Google Analytics or similar
4. **Test thoroughly** - Test all features with real data
5. **Set up backups** - Configure database backups in Supabase

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Test environment variables with `/api/test-env`
3. Verify Supabase connection
4. Check the browser console for errors

Your World Staffing Awards application is now ready for production! 🎉