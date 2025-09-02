#!/bin/bash

# World Staffing Awards - Quick Deploy Script
# This script automates the entire deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header() {
    echo -e "${CYAN}$1${NC}"
}

print_step() {
    echo -e "${MAGENTA}📋 $1${NC}"
}

# Main deployment function
main() {
    print_header "🚀 World Staffing Awards - Quick Deploy"
    print_header "======================================"
    echo ""
    
    print_info "This script will help you deploy the World Staffing Awards application"
    print_info "Make sure you have the following ready:"
    echo "  - GitHub account and CLI (gh) installed"
    echo "  - Vercel account (optional but recommended)"
    echo "  - Supabase project (for database)"
    echo ""
    
    read -p "Continue with deployment? (Y/n): " CONTINUE
    if [[ $CONTINUE =~ ^[Nn]$ ]]; then
        print_error "Deployment cancelled by user"
        exit 1
    fi
    
    # Step 1: Health Check
    print_step "Step 1: Running Health Check"
    echo "----------------------------------------"
    
    if node verify-app-health.js; then
        print_status "Health check passed!"
    else
        print_error "Health check failed. Please fix issues before continuing."
        exit 1
    fi
    
    echo ""
    
    # Step 2: Build Test
    print_step "Step 2: Testing Build"
    echo "----------------------------------------"
    
    print_info "Running production build test..."
    if npm run build; then
        print_status "Build successful!"
    else
        print_error "Build failed. Please fix build errors before continuing."
        exit 1
    fi
    
    echo ""
    
    # Step 3: GitHub Repository Setup
    print_step "Step 3: GitHub Repository Setup"
    echo "----------------------------------------"
    
    read -p "Create new GitHub repository? (Y/n): " CREATE_REPO
    if [[ ! $CREATE_REPO =~ ^[Nn]$ ]]; then
        if command -v gh &> /dev/null; then
            print_info "Running GitHub repository setup..."
            ./create-new-github-repo.sh
        else
            print_warning "GitHub CLI not found. Please install it or create repository manually."
            print_info "Manual steps:"
            echo "1. Go to https://github.com/new"
            echo "2. Create repository: world-staffing-awards-2026"
            echo "3. Run: git remote add origin https://github.com/USERNAME/REPO.git"
            echo "4. Run: git push -u origin main"
        fi
    else
        print_info "Skipping GitHub repository creation"
    fi
    
    echo ""
    
    # Step 4: Deployment Platform
    print_step "Step 4: Choose Deployment Platform"
    echo "----------------------------------------"
    
    echo "Choose your deployment platform:"
    echo "1) Vercel (Recommended)"
    echo "2) Netlify"
    echo "3) Railway"
    echo "4) Manual/Other"
    echo "5) Skip deployment"
    
    read -p "Enter your choice (1-5): " DEPLOY_CHOICE
    
    case $DEPLOY_CHOICE in
        1)
            deploy_vercel
            ;;
        2)
            deploy_netlify
            ;;
        3)
            deploy_railway
            ;;
        4)
            show_manual_deployment
            ;;
        5)
            print_info "Skipping deployment"
            ;;
        *)
            print_warning "Invalid choice. Showing manual deployment instructions."
            show_manual_deployment
            ;;
    esac
    
    echo ""
    
    # Step 5: Environment Variables
    print_step "Step 5: Environment Variables Setup"
    echo "----------------------------------------"
    
    show_environment_variables
    
    echo ""
    
    # Step 6: Database Setup
    print_step "Step 6: Database Setup (Supabase)"
    echo "----------------------------------------"
    
    show_database_setup
    
    echo ""
    
    # Final Steps
    print_step "🎉 Deployment Complete!"
    echo "----------------------------------------"
    
    print_status "Your World Staffing Awards application is ready!"
    echo ""
    print_info "Next steps:"
    echo "1. Configure environment variables in your deployment platform"
    echo "2. Set up Supabase database using the provided schema"
    echo "3. Test the application thoroughly"
    echo "4. Share with your community!"
    echo ""
    print_info "Documentation:"
    echo "- Complete guide: DEPLOYMENT_COMPLETE_GUIDE.md"
    echo "- README: README.md"
    echo "- Security: SECURITY.md"
    echo ""
    print_warning "Remember:"
    echo "- Never commit .env files"
    echo "- Use strong admin passwords"
    echo "- Monitor application performance"
    echo "- Keep dependencies updated"
}

deploy_vercel() {
    print_info "Deploying to Vercel..."
    
    if command -v vercel &> /dev/null; then
        print_info "Vercel CLI found. Starting deployment..."
        vercel --prod
        print_status "Vercel deployment initiated!"
    else
        print_warning "Vercel CLI not found."
        print_info "Please install Vercel CLI: npm i -g vercel"
        print_info "Or deploy manually:"
        echo "1. Go to https://vercel.com/new"
        echo "2. Import your GitHub repository"
        echo "3. Configure environment variables"
        echo "4. Deploy!"
    fi
}

deploy_netlify() {
    print_info "Deploying to Netlify..."
    
    if command -v netlify &> /dev/null; then
        print_info "Netlify CLI found. Starting deployment..."
        netlify deploy --prod --build
        print_status "Netlify deployment initiated!"
    else
        print_warning "Netlify CLI not found."
        print_info "Please install Netlify CLI: npm i -g netlify-cli"
        print_info "Or deploy manually:"
        echo "1. Go to https://app.netlify.com/start"
        echo "2. Connect your GitHub repository"
        echo "3. Configure build settings:"
        echo "   - Build command: npm run build"
        echo "   - Publish directory: out"
        echo "4. Configure environment variables"
        echo "5. Deploy!"
    fi
}

deploy_railway() {
    print_info "Deploying to Railway..."
    
    print_info "Railway deployment steps:"
    echo "1. Go to https://railway.app"
    echo "2. Create new project from GitHub repo"
    echo "3. Configure environment variables"
    echo "4. Deploy automatically triggers"
    
    print_info "Railway will automatically detect Next.js and configure deployment"
}

show_manual_deployment() {
    print_info "Manual deployment options:"
    echo ""
    echo "🔹 Docker Deployment:"
    echo "   - Create Dockerfile (example in docs)"
    echo "   - Build: docker build -t wsa ."
    echo "   - Run: docker run -p 3000:3000 wsa"
    echo ""
    echo "🔹 VPS/Server Deployment:"
    echo "   - Install Node.js 18+"
    echo "   - Clone repository"
    echo "   - Run: npm install && npm run build"
    echo "   - Start: npm start"
    echo "   - Use PM2 for process management"
    echo ""
    echo "🔹 Static Export (if no server features needed):"
    echo "   - Run: npm run export"
    echo "   - Deploy 'out' folder to any static host"
}

show_environment_variables() {
    print_info "Required environment variables:"
    echo ""
    echo "🔹 Supabase (Required):"
    echo "   SUPABASE_URL=your_supabase_project_url"
    echo "   SUPABASE_ANON_KEY=your_supabase_anon_key"
    echo "   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key"
    echo ""
    echo "🔹 Admin (Optional - has defaults):"
    echo "   ADMIN_PASSCODE=your_secure_admin_password"
    echo ""
    echo "🔹 Integrations (Optional):"
    echo "   HUBSPOT_ACCESS_TOKEN=your_hubspot_token"
    echo "   LOOPS_API_KEY=your_loops_api_key"
    echo ""
    echo "🔹 Production:"
    echo "   NODE_ENV=production"
    echo ""
    print_warning "Set these in your deployment platform's environment variables section"
}

show_database_setup() {
    print_info "Supabase database setup:"
    echo ""
    echo "1. Create Supabase project at https://supabase.com"
    echo "2. Go to SQL Editor"
    echo "3. Run the schema from: supabase-schema.sql"
    echo "4. Create storage bucket: 'nominee-images'"
    echo "5. Configure storage policies for public access"
    echo "6. Get your project credentials:"
    echo "   - Project URL"
    echo "   - Anon key"
    echo "   - Service role key"
    echo ""
    print_info "The schema file contains all necessary tables and policies"
}

# Run main function
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi