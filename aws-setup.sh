#!/bin/bash

# AWS Setup Script for Influencer Analytics
# Run this on your AWS EC2 instance after connecting via SSH

set -e

echo "🚀 Setting up AWS EC2 instance for Influencer Analytics..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as ubuntu user
if [[ $EUID -eq 0 ]]; then
   print_error "This script should be run as ubuntu user, not root"
   exit 1
fi

print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_status "Installing essential packages..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

print_status "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

print_status "Installing PM2..."
sudo npm install -g pm2

print_status "Installing Certbot for SSL..."
sudo apt install -y certbot python3-certbot-nginx

print_status "Installing PostgreSQL client..."
sudo apt install -y postgresql-client

print_status "Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

print_status "Creating application directory..."
sudo mkdir -p /var/www
sudo chown ubuntu:ubuntu /var/www

print_status "AWS EC2 setup completed! 🎉"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> /var/www/influencer-analytics"
echo "2. Update setup-database.sh with your RDS endpoint"
echo "3. Configure .env file with RDS credentials"
echo "4. Run the deployment script: ./deploy.sh"
echo ""
echo "Useful commands:"
echo "- Check services: systemctl status nginx"
echo "- View logs: journalctl -u nginx -f"
echo "- Check firewall: ufw status"
echo "- Monitor resources: htop" 