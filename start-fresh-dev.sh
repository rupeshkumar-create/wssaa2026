#!/bin/bash

echo "🧹 Cleaning up any existing processes..."
pkill -f "next dev" 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

echo "🔧 Installing dependencies..."
npm install

echo "🏗️  Building the app to check for errors..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 Starting development server..."
    echo "📱 App will be available at: http://localhost:3000"
    echo "🔧 Admin panel at: http://localhost:3000/admin/login"
    echo ""
    echo "💡 Press Ctrl+C to stop the server"
    echo ""
    
    npm run dev
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi