#!/bin/bash

echo "🔄 Restarting development server with fresh cache..."

# Kill any existing Next.js processes
echo "🛑 Killing existing Next.js processes..."
pkill -f "next dev" || true
pkill -f "node.*next" || true

# Wait a moment for processes to fully terminate
sleep 2

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm cache (optional but thorough)
echo "🧹 Clearing npm cache..."
npm cache clean --force

# Clear any browser cache instructions
echo "📱 Cache cleared! Please also:"
echo "   1. Hard refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)"
echo "   2. Or open in incognito/private mode"

# Start fresh development server
echo "🚀 Starting fresh development server..."
npm run dev