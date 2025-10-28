#!/bin/bash

# World Staffing Awards - Vercel Deployment Script
echo "🚀 Deploying World Staffing Awards to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your Supabase database"
echo "3. Test the application"
echo ""
echo "🔧 Required Environment Variables:"
echo "- SUPABASE_URL"
echo "- SUPABASE_SERVICE_ROLE_KEY"
echo "- NEXT_PUBLIC_SUPABASE_URL"
echo "- NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "- ADMIN_EMAILS"
echo "- ADMIN_PASSWORD_HASHES"
echo "- SERVER_SESSION_SECRET"
echo "- CRON_SECRET"
echo "- SYNC_SECRET"
echo ""
echo "🔧 Optional Environment Variables:"
echo "- HUBSPOT_ACCESS_TOKEN (for HubSpot integration)"
echo "- LOOPS_API_KEY (for email integration)"
echo "- HUBSPOT_SYNC_ENABLED=true"
echo "- LOOPS_SYNC_ENABLED=true"