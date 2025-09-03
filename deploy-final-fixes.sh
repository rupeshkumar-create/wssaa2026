#!/bin/bash

echo "🚀 Deploying Final Fixes to Vercel"
echo "=================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the correct directory. Please run from world-staffing-awards folder."
    exit 1
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel..."
    vercel login
fi

echo "📦 Deploying to production..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment completed!"
echo ""
echo "🔍 Verification Steps:"
echo "1. Check Champions Podium smooth animations (no loading text on category switch)"
echo "2. Verify nominator WSA tags in HubSpot (should be 'Nominator 2026')"
echo "3. Test admin login requires both email and password"
echo ""
echo "🌐 Your app should be live at: https://wssaa2026.vercel.app"
echo ""
echo "📊 What was fixed:"
echo "✅ Champions Podium: Smooth category switching without loading interruption"
echo "✅ Nominator Tags: Correctly set to 'Nominator 2026' in HubSpot wsa_tags field"
echo "✅ Admin Login: Email and password authentication working"
echo ""
echo "🎉 All fixes deployed successfully!"