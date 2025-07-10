#!/bin/bash

# Influencer Analytics Git-Based Deployment Script
# This script pulls from GitHub and updates the running application

set -e  # Exit on any error

echo "🚀 Starting Influencer Analytics Git Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d ".git" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Store current branch
CURRENT_BRANCH=$(git branch --show-current)
print_status "Current branch: $CURRENT_BRANCH"

# Ensure git pull uses merge (no rebase) globally and locally
print_step "0. Configuring git pull strategy (merge, no rebase)..."
git config --global pull.rebase false
git config pull.rebase false

# Step 1: Pull latest changes from GitHub
print_step "1. Pulling latest changes from GitHub..."
git fetch origin

# Check if we have tracking information set up
if git rev-parse --abbrev-ref --symbolic-full-name @{u} >/dev/null 2>&1; then
    print_status "Pulling from tracked branch..."
    git pull --no-rebase
else
    print_warning "No tracking information found. Pulling from origin/main..."
    git pull origin main --no-rebase
fi

# Get the latest commit hash for logging
LATEST_COMMIT=$(git rev-parse --short HEAD)
print_status "Latest commit: $LATEST_COMMIT"

# Step 2: Install backend dependencies
print_step "2. Installing backend dependencies..."
cd backend
npm install --production
cd ..

# Step 3: Install frontend dependencies
print_step "3. Installing frontend dependencies..."
cd frontend
npm install

# Step 4: Build frontend for production
print_step "4. Building frontend for production..."
npm run build
cd ..

# Step 5: Restart the application
print_step "5. Restarting application..."
if pm2 list | grep -q "influencer-analytics-backend"; then
    print_status "Restarting existing PM2 process..."
    pm2 restart influencer-analytics-backend
else
    print_warning "No PM2 process found. Starting new process..."
    pm2 start ecosystem.config.js
fi

# Step 6: Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Step 7: Check application status
print_step "6. Checking application status..."
sleep 3
pm2 status

# Step 8: Show recent logs
print_step "7. Recent application logs:"
pm2 logs influencer-analytics-backend --lines 10

print_status "Deployment completed successfully! 🎉"
echo ""
echo "Deployment Summary:"
echo "- Branch: $CURRENT_BRANCH"
echo "- Commit: $LATEST_COMMIT"
echo "- Timestamp: $(date)"
echo ""
echo "Useful commands:"
echo "- View logs: pm2 logs influencer-analytics-backend"
echo "- Monitor: pm2 monit"
echo "- Restart: pm2 restart influencer-analytics-backend"
echo "- Status: pm2 status" 