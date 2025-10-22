# Vercel Admin Panel Fix Guide

## 🚨 Common Issues & Solutions

### Issue 1: Admin Panel Not Loading / 500 Error

**Symptoms:**
- Admin panel shows 500 error
- Login page doesn't load
- Environment variable errors in logs

**Solution:**

#### Step 1: Set Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

```bash
# Essential Variables (Required)
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca

# Database (Choose Option A or B)
# Option A: With Supabase
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Option B: Without Database (Demo Mode)
# Leave Supabase variables empty for local storage mode

# Security & Sync (Optional but recommended)
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd
```

#### Step 2: Important Notes

1. **Password Hash Escaping**: The `$` characters MUST be escaped with backslashes (`\$`)
2. **Environment Scope**: Set variables for "Production", "Preview", and "Development"
3. **Redeploy**: After adding variables, trigger a new deployment

### Issue 2: Admin Login Not Working

**Symptoms:**
- "Invalid credentials" error
- Login form submits but fails

**Solution:**

#### Check Environment Variables
The password hash must be exactly:
```
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
```

#### Login Credentials
- **Email:** `admin@worldstaffingawards.com`
- **Password:** `WSA2026Admin!Secure`

### Issue 3: Database Connection Errors

**Symptoms:**
- API routes returning 500 errors
- "Database connection failed" messages
- Nominees/voting not working

**Solutions:**

#### Option A: Quick Fix (Demo Mode)
Remove or leave empty these variables:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`

The app will use local storage with demo data.

#### Option B: Full Database Setup
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your Project URL and Service Role Key
3. Add them to Vercel environment variables
4. Run the database schema setup (see below)

## 🛠️ Step-by-Step Vercel Setup

### 1. Deploy to Vercel

```bash
# Option 1: Via Vercel CLI
npm i -g vercel
vercel --prod

# Option 2: Via Vercel Dashboard
# Go to vercel.com → New Project → Import from GitHub
```

### 2. Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Minimum Required (Demo Mode):**
```
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0CFCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca
```

**Full Production Setup:**
```
# Admin
ADMIN_EMAILS=admin@worldstaffingawards.com
ADMIN_PASSWORD_HASHES="\$2b\$12\$31ImP/z1Exj0FCAgIdNsupEKMWjLNgGsD371n55ZL9/hhz9MY/Ti"
SERVER_SESSION_SECRET=05a0b6592ce764cd4a58a7624c30372398960a163bfc41ae5ec8fde21c3cf8ca

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

# Security
CRON_SECRET=966be53c4a0af438dfac5333a982d56f
SYNC_SECRET=ad673d564afffa2a3ab7e81fb9c86ddd

# Integrations (Optional)
HUBSPOT_ACCESS_TOKEN=your-hubspot-token
LOOPS_API_KEY=your-loops-api-key
```

### 3. Redeploy

After setting environment variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

## 🧪 Testing Your Deployment

### 1. Check Basic Functionality
- Visit: `https://your-app.vercel.app`
- Should load home page without errors

### 2. Test Admin Panel
- Visit: `https://your-app.vercel.app/admin`
- Should show login form
- Login with: `admin@worldstaffingawards.com` / `WSA2026Admin!Secure`

### 3. Test API Endpoints
- Visit: `https://your-app.vercel.app/api/nominees`
- Should return JSON with nominees data

## 🔧 Troubleshooting Commands

### Check Environment Variables
```bash
# Test if variables are loaded correctly
curl https://your-app.vercel.app/api/test-env
```

### Check Admin Authentication
```bash
# Test admin login endpoint
curl -X POST https://your-app.vercel.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@worldstaffingawards.com","password":"WSA2026Admin!Secure"}'
```

### Check Database Connection
```bash
# Test database connectivity
curl https://your-app.vercel.app/api/nominees
```

## 📋 Common Error Messages & Fixes

### "Environment variable not found"
- **Fix:** Add missing environment variables in Vercel dashboard
- **Check:** Ensure variables are set for correct environment (Production/Preview)

### "Invalid admin credentials"
- **Fix:** Verify password hash is properly escaped with backslashes
- **Check:** Use exact credentials: `admin@worldstaffingawards.com` / `WSA2026Admin!Secure`

### "Database connection failed"
- **Fix:** Either set up Supabase properly or remove database variables for demo mode
- **Check:** Verify Supabase URL and key are correct

### "Build failed"
- **Fix:** Check build logs for specific errors
- **Common:** Missing environment variables during build

## 🚀 Quick Deploy Script

Save this as `deploy-to-vercel.sh`:

```bash
#!/bin/bash
echo "🚀 Deploying to Vercel..."

# Deploy
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Admin Panel: https://your-app.vercel.app/admin"
echo "👤 Login: admin@worldstaffingawards.com"
echo "🔑 Password: WSA2026Admin!Secure"
```

## 📞 Need Help?

If you're still having issues:

1. **Check Vercel Build Logs:** Look for specific error messages
2. **Verify Environment Variables:** Ensure all required variables are set
3. **Test Locally First:** Make sure the app works locally with same environment variables
4. **Check Network Tab:** Look for failed API requests in browser dev tools

## 🎯 Success Checklist

- [ ] Vercel project created and connected to GitHub
- [ ] Environment variables added (minimum: ADMIN_EMAILS, ADMIN_PASSWORD_HASHES, SERVER_SESSION_SECRET)
- [ ] Deployment successful (no build errors)
- [ ] Home page loads without errors
- [ ] Admin login page accessible at `/admin`
- [ ] Can login with provided credentials
- [ ] Admin panel loads and shows data

Once all items are checked, your Vercel deployment should be working correctly!