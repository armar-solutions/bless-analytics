# 🚀 AWS Setup Checklist - Influencer Analytics

## 📋 Pre-Setup Checklist

### AWS Account
- [ ] AWS account created
- [ ] Payment method added
- [ ] Account verified
- [ ] IAM user created (not using root)
- [ ] Access keys downloaded

### Prerequisites
- [ ] Domain name purchased (optional)
- [ ] NetHunt CRM API credentials ready
- [ ] SSH client installed (Terminal, Git Bash, etc.)
- [ ] Key pair file downloaded (.pem)

## 🖥️ EC2 Instance Setup

### Launch Instance
- [ ] Go to EC2 Console
- [ ] Click "Launch Instance"
- [ ] **AMI**: Ubuntu Server 22.04 LTS
- [ ] **Instance Type**: t2.micro (free tier)
- [ ] **Storage**: 8GB gp2
- [ ] **Security Group**: 
  - [ ] SSH (22): My IP
  - [ ] HTTP (80): 0.0.0.0/0
  - [ ] HTTPS (443): 0.0.0.0/0
- [ ] **Key Pair**: Created and downloaded
- [ ] Instance launched successfully

### Connect to Instance
- [ ] Note EC2 public IP address
- [ ] Set key file permissions: `chmod 400 key.pem`
- [ ] Connect via SSH: `ssh -i key.pem ubuntu@EC2_IP`
- [ ] Successfully logged in

## 🗄️ RDS Database Setup

### Launch Database
- [ ] Go to RDS Console
- [ ] Click "Create Database"
- [ ] **Engine**: PostgreSQL 15.4
- [ ] **Template**: Free tier
- [ ] **Instance**: db.t2.micro
- [ ] **Storage**: 20GB
- [ ] **Public Access**: Yes
- [ ] **Security Group**: Created new
- [ ] Database created successfully

### Configure Security
- [ ] Note RDS endpoint
- [ ] Note database password
- [ ] Configure RDS security group to allow EC2 access
- [ ] Test connection from EC2

## 🔧 Server Configuration

### Run Setup Script
- [ ] Download aws-setup.sh to EC2
- [ ] Make executable: `chmod +x aws-setup.sh`
- [ ] Run script: `./aws-setup.sh`
- [ ] All packages installed successfully

### Verify Services
- [ ] Node.js installed: `node --version`
- [ ] Nginx running: `sudo systemctl status nginx`
- [ ] PM2 installed: `pm2 --version`
- [ ] PostgreSQL client installed: `psql --version`

## 📦 Application Deployment

### Clone Repository
- [ ] Navigate to /var/www
- [ ] Clone repository: `git clone <repo-url> influencer-analytics`
- [ ] Set ownership: `sudo chown -R ubuntu:ubuntu influencer-analytics`
- [ ] Navigate to project: `cd influencer-analytics`

### Generate Secrets
- [ ] Run: `./generate-secrets.sh`
- [ ] Copy JWT_SECRET value
- [ ] Copy DB_PASSWORD value
- [ ] Store securely

### Setup Database
- [ ] Run: `./aws-setup-database.sh`
- [ ] Enter RDS endpoint
- [ ] Enter database password
- [ ] All migrations completed successfully

### Configure Environment
- [ ] Copy .env.example: `cp backend/.env.example backend/.env`
- [ ] Edit .env file with:
  - [ ] RDS endpoint
  - [ ] Database credentials
  - [ ] JWT secret
  - [ ] NetHunt API credentials
  - [ ] Frontend URL

### Deploy Application
- [ ] Run: `./deploy.sh`
- [ ] Frontend built successfully
- [ ] Backend started with PM2
- [ ] Application accessible

### Create Admin User
- [ ] Run: `cd backend && node create-admin.js admin@domain.com password`
- [ ] Admin user created successfully

## 🌐 Web Server Configuration

### Configure Nginx
- [ ] Create site config: `sudo nano /etc/nginx/sites-available/influencer-analytics`
- [ ] Add configuration (see guide)
- [ ] Enable site: `sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/`
- [ ] Test config: `sudo nginx -t`
- [ ] Reload Nginx: `sudo systemctl reload nginx`

### Domain Setup (Optional)
- [ ] Domain purchased
- [ ] DNS records configured:
  - [ ] A record: domain.com → EC2_IP
  - [ ] CNAME: www.domain.com → domain.com
- [ ] DNS propagated (check with: `nslookup domain.com`)

### SSL Certificate
- [ ] Install SSL: `sudo certbot --nginx -d domain.com`
- [ ] Certificate installed successfully
- [ ] HTTPS working

## ✅ Final Verification

### Application Access
- [ ] Frontend loads: `https://domain.com` or `http://EC2_IP`
- [ ] Login works with admin credentials
- [ ] Dashboard displays correctly
- [ ] All pages accessible

### Functionality Test
- [ ] Sync button works (admin only)
- [ ] Data syncs from NetHunt
- [ ] Analytics display correctly
- [ ] User management works (admin only)

### Monitoring
- [ ] Check application status: `pm2 status`
- [ ] View logs: `pm2 logs`
- [ ] Monitor resources: `htop`
- [ ] Check services: `sudo systemctl status nginx`

## 🔒 Security Verification

### Network Security
- [ ] Firewall enabled: `sudo ufw status`
- [ ] Only necessary ports open
- [ ] SSH key authentication working
- [ ] Root login disabled

### Application Security
- [ ] HTTPS enabled
- [ ] Strong passwords used
- [ ] JWT secret is secure
- [ ] Environment variables protected

## 📊 Performance Check

### Resource Usage
- [ ] CPU usage reasonable: `htop`
- [ ] Memory usage acceptable: `free -h`
- [ ] Disk space sufficient: `df -h`
- [ ] Network connectivity stable

### Database Performance
- [ ] Database queries fast
- [ ] Connection pool working
- [ ] No connection errors in logs

## 🎉 Success Criteria

### All Items Completed
- [ ] Application accessible via HTTPS
- [ ] Admin can log in and access all features
- [ ] Data syncs successfully from NetHunt
- [ ] Analytics dashboard displays data
- [ ] User management functional
- [ ] SSL certificate valid
- [ ] No security warnings
- [ ] Performance acceptable

## 🆘 Troubleshooting

### Common Issues
- [ ] Can't connect to EC2: Check security group and key file
- [ ] Database connection failed: Verify RDS endpoint and security group
- [ ] Application won't start: Check logs with `pm2 logs`
- [ ] Nginx 502 error: Verify backend is running
- [ ] SSL issues: Check domain DNS and certbot logs

### Useful Commands
```bash
# Check application status
pm2 status
pm2 logs

# Check services
sudo systemctl status nginx postgresql

# Monitor resources
htop
df -h
free -h

# Test database connection
psql -h RDS_ENDPOINT -U postgres -d influencer_analytics

# View logs
sudo journalctl -u nginx -f
sudo tail -f /var/log/nginx/error.log
```

## 💰 Cost Monitoring

### Free Tier Usage
- [ ] EC2 usage within 750 hours/month
- [ ] RDS usage within 750 hours/month
- [ ] Storage within 30GB
- [ ] Data transfer within 15GB/month

### Billing Alerts
- [ ] AWS billing alerts configured
- [ ] Monitor costs in AWS Console
- [ ] Set budget limits if needed

## 🎯 Next Steps

### After Setup
- [ ] Set up monitoring and alerts
- [ ] Configure automated backups
- [ ] Document deployment process
- [ ] Train team members
- [ ] Plan scaling strategy

### Maintenance
- [ ] Regular security updates
- [ ] Monitor application logs
- [ ] Backup database regularly
- [ ] Update SSL certificate
- [ ] Review costs monthly 