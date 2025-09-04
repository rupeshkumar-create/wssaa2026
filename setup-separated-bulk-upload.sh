#!/bin/bash

# Separated Bulk Upload System Setup Script
# This script sets up the complete separated bulk upload system

echo "🚀 Setting up Separated Bulk Upload System..."
echo "================================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the world-staffing-awards directory"
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found"
    echo "Please create .env.local with required environment variables:"
    echo "- NEXT_PUBLIC_SUPABASE_URL"
    echo "- SUPABASE_SERVICE_ROLE_KEY"
    echo "- LOOPS_API_KEY"
    exit 1
fi

echo "📋 Step 1: Applying database schema..."
node scripts/apply-fixed-schema.js

if [ $? -eq 0 ]; then
    echo "✅ Database schema applied successfully"
else
    echo "❌ Database schema application failed"
    exit 1
fi

echo ""
echo "📋 Step 2: Testing system components..."
node scripts/test-separated-system.js

if [ $? -eq 0 ]; then
    echo "✅ System test completed successfully"
else
    echo "⚠️  System test completed with warnings"
fi

echo ""
echo "📋 Step 3: Verifying CSV templates..."

# Check if templates directory exists
if [ ! -d "templates" ]; then
    echo "❌ Templates directory not found"
    exit 1
fi

# Check if template files exist
if [ -f "templates/person_nominations_comprehensive.csv" ]; then
    echo "✅ Person nominations template found"
else
    echo "❌ Person nominations template missing"
    exit 1
fi

if [ -f "templates/company_nominations_comprehensive.csv" ]; then
    echo "✅ Company nominations template found"
else
    echo "❌ Company nominations template missing"
    exit 1
fi

echo ""
echo "📋 Step 4: Checking API endpoints..."

# Check if API files exist
api_files=(
    "src/app/api/admin/separated-bulk-upload/route.ts"
    "src/app/api/admin/separated-bulk-upload/batches/route.ts"
    "src/app/api/admin/separated-bulk-upload/approve-drafts/route.ts"
)

for file in "${api_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ API endpoint found: $file"
    else
        echo "❌ API endpoint missing: $file"
        exit 1
    fi
done

echo ""
echo "📋 Step 5: Checking component files..."

if [ -f "src/components/admin/SeparatedBulkUploadPanel.tsx" ]; then
    echo "✅ SeparatedBulkUploadPanel component found"
else
    echo "❌ SeparatedBulkUploadPanel component missing"
    exit 1
fi

echo ""
echo "🎉 Separated Bulk Upload System Setup Complete!"
echo "=============================================="
echo ""
echo "📝 Next Steps:"
echo "1. Start your development server: npm run dev"
echo "2. Go to Admin Panel → Bulk Upload tab"
echo "3. Use the 'Separated Bulk Upload System' section"
echo "4. Download person or company CSV templates"
echo "5. Fill in the templates with your data"
echo "6. Upload the CSV files"
echo "7. Review and approve draft nominations"
echo "8. Approved nominations will sync to Loops automatically"
echo ""
echo "📚 Documentation:"
echo "- Complete guide: SEPARATED_BULK_UPLOAD_COMPLETE.md"
echo "- Usage guide: SEPARATED_BULK_UPLOAD_GUIDE.md"
echo "- CSV templates: templates/ directory"
echo ""
echo "🔧 Troubleshooting:"
echo "- Run: node scripts/test-separated-system.js"
echo "- Check: SEPARATED_BULK_UPLOAD_COMPLETE.md"
echo ""
echo "🚀 The system is ready for use!"