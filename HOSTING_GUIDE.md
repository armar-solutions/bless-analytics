# 🚀 Complete Hosting Guide - Influencer Analytics

This guide will walk you through hosting your Influencer Analytics dashboard on a cloud server.

## 📋 Prerequisites

- A cloud server (DigitalOcean, AWS, Vultr, etc.)
- A domain name (optional but recommended)
- NetHunt CRM API credentials
- Basic command line knowledge

## 🎯 Quick Start (30 minutes)

### Step 1: Choose Your Cloud Provider

**Recommended: DigitalOcean**
- Sign up at [digitalocean.com](https://digitalocean.com)
- Create a new droplet:
  - Choose Ubuntu 22.04
  - Select Basic plan ($6-12/month)
  - Choose datacenter close to your users
  - Add your SSH key

### Step 2: Connect to Your Server

```bash
ssh root@your-server-ip
```

### Step 3: Run Server Setup

```bash
# Download the setup script
wget https://raw.githubusercontent.com/your-username/influencer-analytics/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

### Step 4: Clone Your Repository

```bash
cd /var/www
git clone https://github.com/your-username/influencer-analytics.git
chown -R $USER:$USER influencer-analytics
cd influencer-analytics
```

### Step 5: Generate Secure Secrets

```bash
chmod +x generate-secrets.sh
./generate-secrets.sh
```

### Step 6: Set Up Database

```bash
chmod +x setup-database.sh
./setup-database.sh
# Enter the database password from step 5
```

### Step 7: Configure Environment

```bash
cd backend
cp .env.example .env
nano .env
```

Fill in your configuration:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=influencer_analytics
DB_USER=analytics_user
DB_PASSWORD=your_generated_password
JWT_SECRET=your_generated_jwt_secret
NETHUNT_API_KEY=your_nethunt_api_key
NETHUNT_BASE_URL=https://app.nethunt.com/api/v1
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
```

### Step 8: Deploy Application

```bash
cd /var/www/influencer-analytics
chmod +x deploy.sh
./deploy.sh
```

### Step 9: Create Admin User

```bash
cd backend
node create-admin.js admin@yourdomain.com your_admin_password
```

### Step 10: Configure Nginx (if you have a domain)

```bash
# Edit Nginx configuration
sudo nano /etc/nginx/sites-available/influencer-analytics
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        root /var/www/influencer-analytics/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

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
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 11: Set Up SSL (Optional but Recommended)

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔧 Detailed Steps

### Option A: DigitalOcean (Recommended for Beginners)

1. **Create Account**: Sign up at [digitalocean.com](https://digitalocean.com)
2. **Create Droplet**:
   - Choose Ubuntu 22.04
   - Select Basic plan ($6/month)
   - Choose datacenter (closest to your users)
   - Add SSH key or create password
3. **Follow Quick Start steps above**

### Option B: AWS EC2

1. **Create Account**: Sign up at [aws.amazon.com](https://aws.amazon.com)
2. **Launch EC2 Instance**:
   - Choose Ubuntu Server 22.04
   - Select t2.micro (free tier) or t3.small
   - Configure security group (allow SSH, HTTP, HTTPS)
   - Create key pair
3. **Follow Quick Start steps above**

### Option C: Vultr

1. **Create Account**: Sign up at [vultr.com](https://vultr.com)
2. **Deploy Instance**:
   - Choose Ubuntu 22.04
   - Select plan ($5-10/month)
   - Choose location
   - Add SSH key
3. **Follow Quick Start steps above**

## 🌐 Domain Setup

### 1. Purchase Domain
- GoDaddy, Namecheap, or Google Domains
- Choose a memorable name

### 2. Point Domain to Server
- Add A record pointing to your server IP
- Add CNAME for www subdomain

### 3. Update Environment
```bash
nano /var/www/influencer-analytics/backend/.env
# Update FRONTEND_URL=https://yourdomain.com
```

### 4. Restart Application
```bash
pm2 restart influencer-analytics-backend
```

## 🔒 Security Checklist

- [ ] Firewall enabled (UFW)
- [ ] Strong database password
- [ ] Secure JWT secret
- [ ] SSL certificate installed
- [ ] Regular backups configured
- [ ] System updates automated

## 📊 Monitoring

### Check Application Status
```bash
pm2 status
pm2 logs influencer-analytics-backend
```

### Monitor System Resources
```bash
htop
df -h
free -h
```

### Check Services
```bash
systemctl status nginx postgresql
```

## 🛠️ Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   pm2 logs influencer-analytics-backend
   cd /var/www/influencer-analytics/backend
   node server.js
   ```

2. **Database connection error**
   ```bash
   sudo systemctl status postgresql
   psql -d influencer_analytics -U analytics_user
   ```

3. **Nginx 502 error**
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   pm2 status
   ```

4. **SSL certificate issues**
   ```bash
   sudo certbot certificates
   sudo certbot renew
   ```

## 💰 Cost Estimation

### Monthly Costs (USD)
- **DigitalOcean**: $6-12/month
- **AWS**: $10-20/month (with free tier)
- **Vultr**: $5-10/month
- **Domain**: $10-15/year
- **Total**: $5-20/month

## 🚀 Performance Tips

1. **Enable Gzip compression** in Nginx
2. **Add database indexes** for better performance
3. **Set up monitoring** with PM2 Plus
4. **Configure backups** to run daily
5. **Use CDN** for static assets (optional)

## 📞 Support

If you encounter issues:

1. Check the logs: `pm2 logs`
2. Verify configuration files
3. Test individual components
4. Check system resources
5. Review the detailed DEPLOYMENT.md file

## 🎉 Success!

Once deployed, your Influencer Analytics dashboard will be available at:
- **Without domain**: `http://your-server-ip`
- **With domain**: `https://yourdomain.com`

Login with the admin credentials you created in Step 9! 