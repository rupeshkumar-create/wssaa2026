#!/bin/bash

echo "🔄 Restarting development server..."

# Kill any existing Next.js processes
echo "🛑 Killing existing Next.js processes..."
pkill -f "next dev" || true
pkill -f "node.*next" || true
pkill -f "npm.*dev" || true

# Wait a moment for processes to fully terminate
sleep 2

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next || true
rm -rf node_modules/.cache || true

# Start fresh development server
echo "🚀 Starting fresh development server..."
npm run dev