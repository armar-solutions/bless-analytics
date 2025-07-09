#!/bin/bash

# Influencer Analytics Deployment Script
# This script automates the deployment process

set -e  # Exit on any error

echo "🚀 Starting Influencer Analytics Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

print_status "Installing backend dependencies..."
cd backend
npm install --production
cd ..

print_status "Installing frontend dependencies..."
cd frontend
npm install

print_status "Building frontend for production..."
npm run build
cd ..

print_status "Creating logs directory..."
mkdir -p backend/logs

print_status "Checking if PM2 is installed..."
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2..."
    npm install -g pm2
fi

print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

print_status "Saving PM2 configuration..."
pm2 save

print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully! 🎉"
echo ""
echo "Next steps:"
echo "1. Configure Nginx (see DEPLOYMENT.md)"
echo "2. Set up SSL certificate with Let's Encrypt"
echo "3. Configure firewall (sudo ufw allow 'Nginx Full')"
echo "4. Create initial admin user: cd backend && node create-admin.js"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs influencer-analytics-backend"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart influencer-analytics-backend"
echo "- Status: pm2 status" 