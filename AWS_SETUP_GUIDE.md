# 🚀 Complete AWS Setup Guide - Influencer Analytics

This guide will walk you through hosting your Influencer Analytics dashboard on AWS from scratch.

## 📋 Prerequisites

- AWS account (free tier eligible)
- Credit card for AWS account verification
- Domain name (optional but recommended)
- NetHunt CRM API credentials
- Basic command line knowledge

## 🎯 Overview

We'll set up:
- **EC2 Instance**: Ubuntu server for your application
- **RDS Database**: PostgreSQL database
- **Security Groups**: Firewall rules
- **SSL Certificate**: HTTPS support
- **Domain**: Professional URL (optional)

## 📊 AWS Free Tier Limits

- **EC2**: 750 hours/month (t2.micro)
- **RDS**: 750 hours/month (db.t2.micro)
- **Storage**: 30GB EBS
- **Data Transfer**: 15GB/month
- **Duration**: 12 months

## 🚀 Step-by-Step Setup

### Step 1: Create AWS Account

1. **Go to AWS**: [aws.amazon.com](https://aws.amazon.com)
2. **Click "Create an AWS Account"**
3. **Fill in details**:
   - Email address
   - Password
   - AWS account name
4. **Add payment method** (required for verification)
5. **Verify identity** (phone/email verification)
6. **Choose support plan**: Select "Free" tier

### Step 2: Set Up IAM User (Security Best Practice)

1. **Go to IAM Console**: [console.aws.amazon.com/iam](https://console.aws.amazon.com/iam)
2. **Create Admin User**:
   - Click "Users" → "Add user"
   - Username: `influencer-analytics-admin`
   - Access type: "Programmatic access" + "AWS Management Console access"
3. **Attach Policies**:
   - Search for "AdministratorAccess"
   - Select and attach
4. **Download credentials**:
   - Save Access Key ID and Secret Access Key
   - Download CSV file (keep secure!)

### Step 3: Launch EC2 Instance

1. **Go to EC2 Console**: [console.aws.amazon.com/ec2](https://console.aws.amazon.com/ec2)
2. **Click "Launch Instance"**
3. **Choose AMI**:
   - Search for "Ubuntu"
   - Select "Ubuntu Server 22.04 LTS"
   - Architecture: x86
4. **Choose Instance Type**:
   - Select "t2.micro" (free tier eligible)
   - Click "Next: Configure Instance Details"
5. **Configure Instance**:
   - Number of instances: 1
   - Click "Next: Add Storage"
6. **Add Storage**:
   - Size: 8 GB (free tier)
   - Volume type: gp2
   - Click "Next: Add Tags"
7. **Add Tags**:
   - Key: `Name`
   - Value: `influencer-analytics-server`
   - Click "Next: Configure Security Group"
8. **Configure Security Group**:
   - Security group name: `influencer-analytics-sg`
   - Description: `Security group for Influencer Analytics`
   - Add rules:
     - **SSH**: Port 22, Source: My IP
     - **HTTP**: Port 80, Source: 0.0.0.0/0
     - **HTTPS**: Port 443, Source: 0.0.0.0/0
   - Click "Review and Launch"
9. **Review and Launch**:
   - Click "Launch"
   - **Create Key Pair**:
     - Name: `influencer-analytics-key`
     - Download .pem file
     - **Keep this secure!**

### Step 4: Launch RDS Database

1. **Go to RDS Console**: [console.aws.amazon.com/rds](https://console.aws.amazon.com/rds)
2. **Click "Create database"**
3. **Choose database creation method**:
   - Select "Standard create"
4. **Engine options**:
   - Engine type: PostgreSQL
   - Version: 15.4 (latest)
5. **Templates**:
   - Select "Free tier"
6. **Settings**:
   - DB instance identifier: `influencer-analytics-db`
   - Master username: `postgres`
   - Master password: `Generate a strong password!`
7. **Instance configuration**:
   - DB instance class: db.t2.micro (free tier)
8. **Storage**:
   - Storage type: General Purpose SSD (gp2)
   - Allocated storage: 20 GB
   - Enable storage autoscaling: No
9. **Connectivity**:
   - VPC: Default VPC
   - Public access: Yes
   - VPC security group: Create new
   - Security group name: `influencer-analytics-db-sg`
   - Availability Zone: No preference
10. **Database authentication**:
    - Password authentication
11. **Additional configuration**:
    - Initial database name: `influencer_analytics`
    - Backup retention: 7 days
    - Enable encryption: Yes
12. **Click "Create database"**

### Step 5: Configure Database Security Group

1. **Go to EC2 Console** → **Security Groups**
2. **Find your database security group** (`influencer-analytics-db-sg`)
3. **Edit inbound rules**:
   - Add rule:
     - Type: PostgreSQL
     - Port: 5432
     - Source: Custom
     - Enter your EC2 security group ID (`influencer-analytics-sg`)

### Step 6: Connect to Your EC2 Instance

1. **Get your EC2 public IP**:
   - Go to EC2 Console → Instances
   - Copy the Public IPv4 address

2. **Connect via SSH**:
   ```bash
   # On Mac/Linux
   chmod 400 influencer-analytics-key.pem
   ssh -i influencer-analytics-key.pem ubuntu@YOUR_EC2_IP
   
   # On Windows (using Git Bash or WSL)
   chmod 400 influencer-analytics-key.pem
   ssh -i influencer-analytics-key.pem ubuntu@YOUR_EC2_IP
   ```

### Step 7: Set Up Server Environment

1. **Update system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install required software**:
   ```bash
   # Install Node.js 20.x
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Nginx
   sudo apt install -y nginx
   sudo systemctl start nginx
   sudo systemctl enable nginx
   
   # Install PM2
   sudo npm install -g pm2
   
   # Install Certbot for SSL
   sudo apt install -y certbot python3-certbot-nginx
   
   # Install PostgreSQL client
   sudo apt install -y postgresql-client
   ```

3. **Set up firewall**:
   ```bash
   sudo ufw allow ssh
   sudo ufw allow 'Nginx Full'
   sudo ufw --force enable
   ```

### Step 8: Deploy Your Application

1. **Clone your repository**:
   ```bash
   cd /var/www
   sudo git clone https://github.com/your-username/influencer-analytics.git
   sudo chown -R ubuntu:ubuntu influencer-analytics
   cd influencer-analytics
   ```

2. **Generate secure secrets**:
   ```bash
   chmod +x generate-secrets.sh
   ./generate-secrets.sh
   # Copy the JWT_SECRET and DB_PASSWORD values
   ```

3. **Set up database**:
   ```bash
   # Get your RDS endpoint from AWS Console
   # Go to RDS → Databases → Your database → Connectivity & security
   # Copy the endpoint (e.g., influencer-analytics-db.abc123.us-east-1.rds.amazonaws.com)
   
   chmod +x setup-database.sh
   # Edit the script to use your RDS endpoint
   nano setup-database.sh
   ```

4. **Update database setup script**:
   ```bash
   # In setup-database.sh, change:
   # PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME
   # To:
   # PGPASSWORD=$DB_PASSWORD psql -h YOUR_RDS_ENDPOINT -U $DB_USER -d $DB_NAME
   ```

5. **Run database setup**:
   ```bash
   ./setup-database.sh
   # Enter the database password from step 2
   ```

6. **Configure environment**:
   ```bash
   cd backend
   cp .env.example .env
   nano .env
   ```

   Fill in your configuration:
   ```env
   # Database Configuration (use RDS endpoint)
   DB_HOST=YOUR_RDS_ENDPOINT
   DB_PORT=5432
   DB_NAME=influencer_analytics
   DB_USER=postgres
   DB_PASSWORD=your_generated_password
   
   # JWT Secret
   JWT_SECRET=your_generated_jwt_secret
   
   # NetHunt CRM
   NETHUNT_API_KEY=your_nethunt_api_key
   NETHUNT_EMAIL=your_nethunt_email
   NETHUNT_BASE_URL=https://app.nethunt.com/api/v1
   
   # Server Configuration
   PORT=3001
   NODE_ENV=production
   
   # Frontend URL
   FRONTEND_URL=https://yourdomain.com
   ```

7. **Deploy application**:
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

### Step 10: Configure Nginx

1. **Create Nginx configuration**:
   ```bash
   sudo nano /etc/nginx/sites-available/influencer-analytics
   ```

2. **Add this configuration**:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       # Frontend
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
   }
   ```

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Step 11: Set Up Domain (Optional)

1. **Purchase domain** (GoDaddy, Namecheap, etc.)
2. **Point domain to your EC2 IP**:
   - Add A record: `yourdomain.com` → `YOUR_EC2_IP`
   - Add CNAME: `www.yourdomain.com` → `yourdomain.com`
3. **Update environment**:
   ```bash
   nano /var/www/influencer-analytics/backend/.env
   # Update FRONTEND_URL=https://yourdomain.com
   ```
4. **Restart application**:
   ```bash
   pm2 restart influencer-analytics-backend
   ```

### Step 12: Set Up SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Step 13: Test Your Application

1. **Check application status**:
   ```bash
   pm2 status
   pm2 logs influencer-analytics-backend
   ```

2. **Test database connection**:
   ```bash
   psql -h YOUR_RDS_ENDPOINT -U postgres -d influencer_analytics
   ```

3. **Visit your application**:
   - **Without domain**: `http://YOUR_EC2_IP`
   - **With domain**: `https://yourdomain.com`

## 🔧 Monitoring and Maintenance

### Check Application Status
```bash
pm2 status
pm2 logs influencer-analytics-backend
pm2 monit
```

### Monitor System Resources
```bash
htop
df -h
free -h
```

### Check Services
```bash
sudo systemctl status nginx
sudo systemctl status postgresql
```

### View Logs
```bash
# Application logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System logs
sudo journalctl -u nginx -f
```

## 🛠️ Troubleshooting

### Common Issues

1. **Can't connect to EC2**:
   - Check security group allows SSH (port 22)
   - Verify key file permissions: `chmod 400 key.pem`

2. **Database connection failed**:
   - Check RDS security group allows EC2
   - Verify RDS endpoint and credentials
   - Test connection: `psql -h ENDPOINT -U postgres`

3. **Application won't start**:
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Test manually: `cd backend && node server.js`

4. **Nginx 502 error**:
   - Check if backend is running: `pm2 status`
   - Verify proxy_pass URL in Nginx config
   - Check Nginx logs: `sudo nginx -t`

## 💰 Cost Estimation

### Free Tier (First 12 Months)
- **EC2 t2.micro**: $0/month
- **RDS db.t2.micro**: $0/month
- **Storage**: $0/month (up to 30GB)
- **Data Transfer**: $0/month (up to 15GB)
- **Total**: $0/month

### After Free Tier
- **EC2 t2.micro**: ~$8/month
- **RDS db.t2.micro**: ~$12/month
- **Storage**: ~$2/month
- **Data Transfer**: ~$1/month
- **Total**: ~$23/month

## 🔒 Security Checklist

- [ ] IAM user created (not using root)
- [ ] Security groups configured
- [ ] SSH key pair used
- [ ] Database encrypted
- [ ] SSL certificate installed
- [ ] Firewall enabled
- [ ] Strong passwords used
- [ ] Regular backups configured

## 🎉 Success!

Your Influencer Analytics dashboard is now live on AWS!

**Access your application:**
- **Without domain**: `http://YOUR_EC2_IP`
- **With domain**: `https://yourdomain.com`

**Login credentials:**
- Email: `admin@yourdomain.com`
- Password: `your_admin_password`

## 📞 Support

If you encounter issues:
1. Check the logs: `pm2 logs`
2. Verify AWS console for resource status
3. Test individual components
4. Review security group configurations
5. Check the detailed DEPLOYMENT.md file 