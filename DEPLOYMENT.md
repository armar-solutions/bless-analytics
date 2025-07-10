# Deployment Guide - Influencer Analytics Dashboard

## Overview
This guide covers deploying the Influencer Analytics dashboard to a production server. The application consists of:
- **Frontend**: React app with Vite
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL
- **Authentication**: JWT-based

## Prerequisites
- Ubuntu 20.04+ server with root access
- Domain name (optional but recommended)
- NetHunt CRM API credentials

## 1. Server Setup

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Node.js 20.x
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

## 2. Database Setup

### Create Database User
```bash
sudo -u postgres psql
CREATE DATABASE influencer_analytics;
CREATE USER analytics_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE influencer_analytics TO analytics_user;
\q
```

### Run Migrations
```bash
cd /var/www/influencer-analytics/backend
psql -d influencer_analytics -U analytics_user -f migrations/001_create_users_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/002_create_contacts_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/003_create_course_deals_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/004_create_webinars_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/005_create_seminars_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/006_create_deal_stage_history_table.sql
psql -d influencer_analytics -U analytics_user -f migrations/004_add_user_management_columns.sql
```

## 3. Application Deployment

### Clone Repository
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/your-username/influencer-analytics.git
sudo chown -R $USER:$USER /var/www/influencer-analytics
```

### Backend Setup
```bash
cd /var/www/influencer-analytics/backend
npm install
```

### Create Environment File
```bash
cp .env.example .env
nano .env
```

**Environment Variables:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=influencer_analytics
DB_USER=analytics_user
DB_PASSWORD=your_secure_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_here

# NetHunt CRM
NETHUNT_API_KEY=your_nethunt_api_key
NETHUNT_BASE_URL=https://app.nethunt.com/api/v1

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (for CORS)
FRONTEND_URL=https://yourdomain.com
```

### Frontend Setup
```bash
cd /var/www/influencer-analytics/frontend
npm install
```

### Build Frontend
```bash
npm run build
```

### Update Vite Config for Production
Edit `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
```

## 4. PM2 Configuration

### Create PM2 Ecosystem File
```bash
cd /var/www/influencer-analytics
nano ecosystem.config.js
```

**ecosystem.config.js:**
```javascript
module.exports = {
  apps: [{
    name: 'influencer-analytics-backend',
    script: './backend/server.js',
    cwd: '/var/www/influencer-analytics/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

### Start Application
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 5. Nginx Configuration

### Create Nginx Site Configuration
```bash
sudo nano /etc/nginx/sites-available/influencer-analytics
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (if using Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Frontend (React App)
    location / {
        root /var/www/influencer-analytics/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API
    location /api/ {
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

### Enable Site
```bash
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 6. SSL Certificate (Let's Encrypt)

### Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Get SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Auto-renewal
```bash
sudo crontab -e
# Add this line:
0 12 * * * /usr/bin/certbot renew --quiet
```

## 7. Firewall Configuration

```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## 8. Create Initial Admin User

```bash
cd /var/www/influencer-analytics/backend
node create-admin.js admin@yourdomain.com your_admin_password
```

## 9. Monitoring & Logs

### PM2 Monitoring
```bash
pm2 monit
pm2 logs
```

### Nginx Logs
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Application Logs
```bash
pm2 logs influencer-analytics-backend
```

## 10. Backup Strategy

### Database Backup Script
```bash
nano /var/www/influencer-analytics/backup.sh
```

**backup.sh:**
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/influencer-analytics"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="influencer_analytics"
DB_USER="analytics_user"

mkdir -p $BACKUP_DIR

# Database backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# Application backup
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz /var/www/influencer-analytics

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Setup Cron Job for Backups
```bash
chmod +x /var/www/influencer-analytics/backup.sh
crontab -e
# Add this line for daily backups at 2 AM:
0 2 * * * /var/www/influencer-analytics/backup.sh
```

## 11. Performance Optimization

### Enable Gzip Compression
Add to Nginx configuration:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
```

### Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_course_deals_created_at ON course_deals(created_at);
CREATE INDEX idx_seminars_created_at ON seminars(created_at);
CREATE INDEX idx_webinars_created_at ON webinars(created_at);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
```

## 12. Troubleshooting

### Common Issues

1. **Port 3001 not accessible**
   - Check if PM2 is running: `pm2 status`
   - Check firewall: `sudo ufw status`

2. **Database connection issues**
   - Verify PostgreSQL is running: `sudo systemctl status postgresql`
   - Check connection: `psql -d influencer_analytics -U analytics_user`

3. **Nginx 502 Bad Gateway**
   - Check if backend is running: `pm2 logs`
   - Verify proxy_pass URL in Nginx config

4. **SSL Certificate issues**
   - Check certificate status: `sudo certbot certificates`
   - Renew if needed: `sudo certbot renew`

### Useful Commands
```bash
# Restart application
pm2 restart influencer-analytics-backend

# View real-time logs
pm2 logs influencer-analytics-backend --lines 100

# Check system resources
htop
df -h
free -h

# Monitor Nginx
sudo nginx -t
sudo systemctl status nginx
```

## 13. Security Checklist

- [ ] Firewall configured (UFW)
- [ ] SSL certificate installed
- [ ] Strong database password
- [ ] JWT secret is secure
- [ ] Environment variables protected
- [ ] Regular backups configured
- [ ] System updates automated
- [ ] Nginx security headers added
- [ ] Database user has minimal privileges

## 14. Maintenance

### Regular Tasks
- Monitor disk space: `df -h`
- Check application logs: `pm2 logs`
- Update system packages: `sudo apt update && sudo apt upgrade`
- Renew SSL certificate: `sudo certbot renew`
- Test backups: Restore to test environment

### Performance Monitoring
- Use `htop` for system monitoring
- Monitor database performance with `pg_stat_statements`
- Set up application monitoring with PM2 Plus or similar

## Support

For issues or questions:
1. Check logs first: `pm2 logs` and `sudo journalctl -u nginx`
2. Verify configuration files
3. Test individual components (database, backend, frontend)
4. Check system resources and network connectivity 