# 🚀 AWS Quick Setup Guide

## Prerequisites
- AWS account with credit card
- Domain name (optional)
- NetHunt CRM API credentials

## Step 1: AWS Account Setup
1. Create account at [aws.amazon.com](https://aws.amazon.com)
2. Add payment method (required for verification)
3. Create IAM user (don't use root account)

## Step 2: Launch EC2 Instance
1. Go to EC2 Console → Launch Instance
2. **AMI**: Ubuntu Server 22.04 LTS
3. **Instance Type**: t2.micro (free tier)
4. **Storage**: 8GB gp2
5. **Security Group**: 
   - SSH (22): My IP
   - HTTP (80): 0.0.0.0/0
   - HTTPS (443): 0.0.0.0/0
6. **Key Pair**: Create and download .pem file

## Step 3: Launch RDS Database
1. Go to RDS Console → Create Database
2. **Engine**: PostgreSQL 15.4
3. **Template**: Free tier
4. **Instance**: db.t2.micro
5. **Storage**: 20GB
6. **Public Access**: Yes
7. **Security Group**: Create new (allow EC2 access)

## Step 4: Connect & Deploy
```bash
# Connect to EC2
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Run setup scripts
cd /var/www
sudo git clone https://github.com/your-username/influencer-analytics.git
sudo chown -R ubuntu:ubuntu influencer-analytics
cd influencer-analytics

# Generate secrets
./generate-secrets.sh

# Setup database (update script with RDS endpoint)
nano setup-database.sh  # Change localhost to RDS endpoint
./setup-database.sh

# Configure environment
cd backend
cp .env.example .env
nano .env  # Add your RDS endpoint and secrets

# Deploy
cd .. && ./deploy.sh

# Create admin
cd backend
node create-admin.js admin@yourdomain.com password123
```

## Step 5: Configure Nginx
```bash
sudo nano /etc/nginx/sites-available/influencer-analytics
# Add configuration (see full guide)
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Step 6: SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

## Cost: $0/month (free tier) → $23/month after

## Access: https://yourdomain.com 