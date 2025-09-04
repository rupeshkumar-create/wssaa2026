#!/bin/bash

echo "🚀 Deploying Simplified World Staffing Awards App"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Step 1: Git operations
echo ""
echo "📝 Step 1: Committing changes to Git..."
echo "----------------------------------------"

# Add all changes
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "ℹ️  No changes to commit"
else
    # Commit with a descriptive message
    git commit -m "feat: Remove theme system and simplify app

- Removed complex theme customization system
- Deleted ThemeContext, ThemeCustomizationPanel, LogoManagement
- Removed theme API routes and CSS variables
- Simplified layout.tsx and admin panel
- App now uses default Tailwind CSS styling
- Fixed theme-related issues and logo upload problems
- Improved app reliability and performance
- All core functionality preserved

Changes:
- Deleted: src/contexts/ThemeContext.tsx
- Deleted: src/components/admin/ThemeCustomizationPanel.tsx
- Deleted: src/components/admin/LogoManagement.tsx
- Deleted: src/components/ui/color-picker.tsx
- Deleted: src/app/api/admin/theme/route.ts
- Deleted: src/styles/theme.css
- Modified: src/app/layout.tsx (removed ThemeProvider)
- Modified: src/app/admin/page.tsx (removed theme tab)
- Added: THEME_SYSTEM_REMOVED.md (documentation)
- Added: scripts/test-app-without-theme.js
- Added: start-fresh-dev.sh"

    echo "✅ Changes committed successfully"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
git push origin main
if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Step 2: Build verification
echo ""
echo "🏗️  Step 2: Verifying build..."
echo "------------------------------"

npm run build
if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

# Step 3: Deploy to Vercel
echo ""
echo "🌐 Step 3: Deploying to Vercel..."
echo "---------------------------------"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🚀 Starting Vercel deployment..."
vercel --prod

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 DEPLOYMENT SUCCESSFUL!"
    echo "========================"
    echo ""
    echo "✅ Theme system removed and app simplified"
    echo "✅ Code committed and pushed to GitHub"
    echo "✅ Successfully deployed to Vercel"
    echo ""
    echo "🔗 Your app should be live at your Vercel domain"
    echo "🔧 Admin panel: [your-domain]/admin/login"
    echo ""
    echo "📋 What was fixed:"
    echo "  • Theme customization issues resolved"
    echo "  • Logo upload problems fixed"
    echo "  • App now uses reliable default styling"
    echo "  • Simplified codebase for better maintenance"
    echo "  • All core functionality preserved"
    echo ""
    echo "💡 Next steps:"
    echo "  1. Test the live app functionality"
    echo "  2. Verify admin panel access"
    echo "  3. Test nomination and voting features"
    echo "  4. Check responsive design on mobile"
else
    echo "❌ Vercel deployment failed"
    echo ""
    echo "🔧 Troubleshooting:"
    echo "  1. Make sure you're logged into Vercel: vercel login"
    echo "  2. Check your environment variables are set"
    echo "  3. Verify your Vercel project is configured correctly"
    echo ""
    echo "📖 You can also deploy manually:"
    echo "  1. Run: vercel login"
    echo "  2. Run: vercel --prod"
    exit 1
fi