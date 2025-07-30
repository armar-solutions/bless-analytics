# Deployment Guide

This guide covers the complete deployment process for the Influencer Analytics Dashboard, from initial server setup to production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AWS Setup](#aws-setup)
3. [Server Configuration](#server-configuration)
4. [Database Setup](#database-setup)
5. [Application Deployment](#application-deployment)
6. [SSL/HTTPS Configuration](#sslhttps-configuration)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before starting the deployment process, ensure you have:

- AWS account with appropriate permissions
- Domain name (optional but recommended)
- SSH key pair for EC2 access
- Basic knowledge of Linux command line
- Node.js and npm installed locally

## AWS Setup

### 1. Launch EC2 Instance

1. **Create EC2 Instance:**
   - Instance Type: `t3.medium` or higher
   - OS: Ubuntu 22.04 LTS
   - Storage: 20GB minimum
   - Security Group: Allow SSH (port 22), HTTP (port 80), HTTPS (port 443)

2. **Configure Security Groups:**
   ```
   SSH (22): Your IP only
   HTTP (80): 0.0.0.0/0
   HTTPS (443): 0.0.0.0/0
   Custom TCP (3001): 0.0.0.0/0 (for API)
   ```

### 2. Connect to Server

```bash
ssh -i your-key.pem ubuntu@your-server-ip
```

### 3. Run Initial Setup Script

```bash
# Download and run the AWS setup script
curl -O https://raw.githubusercontent.com/your-repo/InfluencerAnalytics/main/aws-setup.sh
chmod +x aws-setup.sh
./aws-setup.sh
```

## Server Configuration

### 1. Install Dependencies

The setup script will install:
- Node.js 18+
- PostgreSQL
- Nginx
- PM2
- Git
- UFW firewall

### 2. Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw allow 3001
sudo ufw enable
```

### 3. Create Application User

```bash
sudo adduser appuser
sudo usermod -aG sudo appuser
sudo su - appuser
```

## Database Setup

### 1. PostgreSQL Configuration

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

```sql
CREATE DATABASE "bless-analytics-db";
CREATE USER appuser WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE "bless-analytics-db" TO appuser;
\q
```

### 2. Configure PostgreSQL

```bash
sudo nano /etc/postgresql/14/main/postgresql.conf
```

Add/modify these settings:
```
listen_addresses = 'localhost'
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
```

```bash
sudo systemctl restart postgresql
```

### 3. Run Database Migrations

```bash
cd /home/ubuntu/InfluencerAnalytics/backend
npm run db:migrate
npm run db:sync
```

## Application Deployment

### 1. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/your-repo/InfluencerAnalytics.git
cd InfluencerAnalytics
```

### 2. Install Dependencies

```bash
# Backend dependencies
cd backend
npm install --production

# Frontend dependencies
cd ../frontend
npm install
```

### 3. Environment Configuration

```bash
cd /home/ubuntu/InfluencerAnalytics/backend
cp .env.example .env
nano .env
```

Configure the following variables:
```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database Configuration
DB_USER=appuser
DB_HOST=localhost
DB_DATABASE=bless-analytics-db
DB_PASSWORD=your_secure_password
DB_PORT=5432

# NetHunt CRM API
NETHUNT_API_KEY=your_api_key
NETHUNT_EMAIL=your_email

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_123456789
```

### 4. Build Frontend

```bash
cd /home/ubuntu/InfluencerAnalytics/frontend
npm run build
```

### 5. Configure PM2

```bash
cd /home/ubuntu/InfluencerAnalytics
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 6. Configure Nginx

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/influencer-analytics
```

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend
    location / {
        root /home/ubuntu/InfluencerAnalytics/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL/HTTPS Configuration

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

### 3. Auto-renewal

```bash
sudo crontab -e
```

Add this line:
```
0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### 1. PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs influencer-analytics-backend

# Monitor resources
pm2 monit

# Restart application
pm2 restart influencer-analytics-backend
```

### 2. System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check application logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Database Monitoring

```bash
# Connect to database
sudo -u postgres psql -d bless-analytics-db

# Check database size
SELECT pg_size_pretty(pg_database_size('bless-analytics-db'));

# Check active connections
SELECT count(*) FROM pg_stat_activity;
```

### 4. Automated Backups

Create backup script:

```bash
nano /home/ubuntu/backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/ubuntu/backups"
DB_NAME="bless-analytics-db"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
sudo -u postgres pg_dump $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /home/ubuntu/InfluencerAnalytics

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

Make executable and schedule:

```bash
chmod +x /home/ubuntu/backup.sh
crontab -e
```

Add this line for daily backups at 2 AM:
```
0 2 * * * /home/ubuntu/backup.sh
```

## Deployment Updates

### 1. Automated Deployment Script

Use the provided deployment script:

```bash
./deploy-update.sh
```

### 2. Manual Deployment

```bash
# Pull latest changes
git pull origin main

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Build frontend
npm run build

# Restart application
pm2 restart influencer-analytics-backend
```

## Troubleshooting

### Common Issues

1. **Application won't start:**
   ```bash
   pm2 logs influencer-analytics-backend
   cd backend && node server.js
   ```

2. **Database connection issues:**
   ```bash
   sudo systemctl status postgresql
   sudo -u postgres psql -d bless-analytics-db
   ```

3. **Nginx issues:**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   sudo tail -f /var/log/nginx/error.log
   ```

4. **Port conflicts:**
   ```bash
   sudo netstat -tulpn | grep :3001
   sudo lsof -i :3001
   ```

### Performance Optimization

1. **Enable Gzip compression in Nginx:**
   ```nginx
   gzip on;
   gzip_vary on;
   gzip_min_length 1024;
   gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
   ```

2. **Database optimization:**
   ```sql
   -- Create indexes for frequently queried columns
   CREATE INDEX idx_deals_created_at ON deals(created_at);
   CREATE INDEX idx_deals_status ON deals(status);
   ```

3. **PM2 clustering:**
   ```bash
   pm2 start ecosystem.config.js -i max
   ```

### Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSH key-based authentication only
- [ ] Regular security updates
- [ ] SSL certificate installed
- [ ] Database password is strong
- [ ] JWT secret is secure
- [ ] Environment variables protected
- [ ] Log monitoring enabled

## Maintenance Schedule

### Daily
- Check application logs
- Monitor system resources
- Verify backups completed

### Weekly
- Update system packages
- Review error logs
- Check disk space
- Test backup restoration

### Monthly
- Security updates
- Performance review
- Database maintenance
- SSL certificate renewal check

---

**Last Updated:** December 2024  
**Version:** 1.0.0 