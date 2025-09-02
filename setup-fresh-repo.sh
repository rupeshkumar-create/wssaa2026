#!/bin/bash

echo "🔄 Setting up fresh GitHub repository for World Staffing Awards"
echo "=================================================="

# Step 1: Remove existing git repository
echo "📁 Removing existing git repository..."
rm -rf .git

# Step 2: Initialize new git repository
echo "🆕 Initializing new git repository..."
git init

# Step 3: Add all files
echo "📝 Adding files to git..."
git add .

# Step 4: Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: World Staffing Awards 2026 - Complete application with Supabase, HubSpot, and Loops integration"

echo ""
echo "✅ Fresh git repository created successfully!"
echo ""
echo "🔗 Next steps:"
echo "1. Create a new repository on GitHub"
echo "2. Run: git remote add origin https://github.com/yourusername/your-repo-name.git"
echo "3. Run: git branch -M main"
echo "4. Run: git push -u origin main"
echo ""
echo "📋 Repository is ready for GitHub and Vercel integration!"