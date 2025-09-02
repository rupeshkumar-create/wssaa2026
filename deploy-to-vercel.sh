#!/bin/bash

# Deploy World Staffing Awards to Vercel
# This script handles the complete deployment process

echo "🚀 Deploying World Staffing Awards to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Login to Vercel (if not already logged in)
echo "🔐 Checking Vercel authentication..."
vercel whoami || vercel login

# Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod

# Set environment variables (you'll need to do this manually in Vercel dashboard)
echo "⚙️ Environment Variables Setup Required:"
echo ""
echo "Please set these environment variables in your Vercel dashboard:"
echo "https://vercel.com/dashboard -> Your Project -> Settings -> Environment Variables"
echo ""
echo "Required Variables:"
echo "- SUPABASE_URL=https://cabdkztnkycebtlcmckx.supabase.co"
echo "- SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]"
echo "- NEXT_PUBLIC_SUPABASE_URL=https://cabdkztnkycebtlcmckx.supabase.co"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]"
echo "- HUBSPOT_TOKEN=[your-hubspot-token]"
echo "- HUBSPOT_SYNC_ENABLED=true"
echo "- LOOPS_API_KEY=[your-loops-api-key]"
echo "- LOOPS_SYNC_ENABLED=true"
echo "- ADMIN_EMAILS=admin@worldstaffingawards.com"
echo "- ADMIN_PASSWORD_HASHES=[your-hashed-password]"
echo "- SERVER_SESSION_SECRET=[your-session-secret]"
echo "- CRON_SECRET=[your-cron-secret]"
echo "- SYNC_SECRET=[your-sync-secret]"
echo ""
echo "✅ Deployment initiated! Check your Vercel dashboard for the live URL."