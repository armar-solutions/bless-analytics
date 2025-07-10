#!/bin/bash

# Server Setup Script for Influencer Analytics
# Run this as root on a fresh Ubuntu server

set -e

echo "🚀 Setting up server for Influencer Analytics..."

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

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root"
   exit 1
fi

print_status "Updating system packages..."
apt update && apt upgrade -y

print_status "Installing essential packages..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

print_status "Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

print_status "Installing PostgreSQL..."
apt install -y postgresql postgresql-contrib
systemctl start postgresql
systemctl enable postgresql

print_status "Installing Nginx..."
apt install -y nginx
systemctl start nginx
systemctl enable nginx

print_status "Installing PM2..."
npm install -g pm2

print_status "Installing Certbot for SSL..."
apt install -y certbot python3-certbot-nginx

print_status "Setting up firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

print_status "Creating application directory..."
mkdir -p /var/www
chown $SUDO_USER:$SUDO_USER /var/www

print_status "Server setup completed! 🎉"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> /var/www/influencer-analytics"
echo "2. Set up the database and environment variables"
echo "3. Run the deployment script: ./deploy.sh"
echo ""
echo "Useful commands:"
echo "- Check services: systemctl status postgresql nginx"
echo "- View logs: journalctl -u nginx -f"
echo "- Check firewall: ufw status" 