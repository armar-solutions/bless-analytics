# 🚀 AWS Setup Guide - Influencer Analytics

## 📁 Files Overview

This repository contains everything you need to host your Influencer Analytics platform on AWS:

### 🛠️ Setup Scripts
- **`aws-setup.sh`** - Server environment setup for AWS EC2
- **`aws-setup-database.sh`** - RDS database setup and migrations
- **`generate-secrets.sh`** - Generate secure passwords and JWT secrets
- **`deploy.sh`** - Deploy the application

### 📋 Guides & Documentation
- **`AWS_QUICK_SETUP.md`** - Quick reference guide
- **`AWS_CHECKLIST.md`** - Comprehensive setup checklist
- **`HOSTING_GUIDE.md`** - General hosting guide
- **`DEPLOYMENT.md`** - Detailed deployment documentation

## 🎯 Quick Start (30 minutes)

### Step 1: AWS Infrastructure
1. **Create AWS Account**: [aws.amazon.com](https://aws.amazon.com)
2. **Launch EC2**: Ubuntu 22.04, t2.micro, 8GB storage
3. **Launch RDS**: PostgreSQL 15.4, db.t2.micro, 20GB storage
4. **Configure Security Groups**: Allow SSH, HTTP, HTTPS

### Step 2: Connect & Setup
```bash
# Connect to your EC2 instance
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Download and run setup scripts
wget https://raw.githubusercontent.com/your-username/influencer-analytics/main/aws-setup.sh
chmod +x aws-setup.sh
./aws-setup.sh
```

### Step 3: Deploy Application
```bash
# Clone repository
cd /var/www
git clone https://github.com/your-username/influencer-analytics.git
cd influencer-analytics

# Generate secrets
./generate-secrets.sh

# Setup database
./aws-setup-database.sh

# Configure environment
cd backend
cp .env.example .env
nano .env  # Add your credentials

# Deploy
cd .. && ./deploy.sh

# Create admin user
cd backend
node create-admin.js admin@yourdomain.com password123
```

### Step 4: Configure Web Server
```bash
# Configure Nginx
sudo nano /etc/nginx/sites-available/influencer-analytics
# Add configuration (see guides)

# Enable site
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Setup SSL (if you have a domain)
sudo certbot --nginx -d yourdomain.com
```

## 💰 Cost Breakdown

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

## 🔧 Architecture

```
Internet → CloudFront (optional) → EC2 (Nginx) → Node.js App → RDS PostgreSQL
```

### Components
- **EC2 Instance**: Ubuntu server running your application
- **RDS Database**: Managed PostgreSQL database
- **Nginx**: Web server and reverse proxy
- **PM2**: Process manager for Node.js
- **Let's Encrypt**: Free SSL certificates

## 📊 Resource Requirements

### For Your Usage Pattern
- **CPU**: t2.micro (1 vCPU) - Sufficient for manual syncs
- **Memory**: 1GB RAM - Adequate for small team
- **Storage**: 8GB - Plenty for application + OS
- **Database**: 20GB - Sufficient for analytics data
- **Bandwidth**: 15GB/month - More than enough

### Scaling Path
1. **Start**: t2.micro (free tier)
2. **Growth**: t3.small ($16/month)
3. **Scale**: t3.medium ($32/month)
4. **Enterprise**: Larger instances as needed

## 🔒 Security Features

### Built-in Security
- **IAM Users**: No root account usage
- **Security Groups**: Firewall rules
- **SSH Keys**: Key-based authentication
- **HTTPS**: SSL/TLS encryption
- **Database Encryption**: RDS encryption at rest
- **JWT Authentication**: Secure API access

### Best Practices
- Strong passwords for all services
- Regular security updates
- Database backups
- Monitoring and alerting
- Principle of least privilege

## 🚀 Performance Optimization

### Application Level
- **PM2**: Process management and auto-restart
- **Nginx**: Efficient static file serving
- **Database Indexes**: Optimized queries
- **Connection Pooling**: Efficient database connections

### Infrastructure Level
- **EBS gp2**: SSD storage for better I/O
- **RDS**: Managed database with automatic backups
- **Security Groups**: Minimal network exposure
- **Auto-scaling**: Ready for future growth

## 📈 Monitoring & Maintenance

### Health Checks
```bash
# Application status
pm2 status
pm2 logs

# System resources
htop
df -h
free -h

# Services
sudo systemctl status nginx
sudo systemctl status postgresql
```

### Regular Tasks
- Monitor application logs
- Check system resources
- Review AWS costs
- Update SSL certificates
- Backup database
- Security updates

## 🛠️ Troubleshooting

### Common Issues

1. **Can't connect to EC2**
   - Check security group allows SSH (port 22)
   - Verify key file permissions: `chmod 400 key.pem`

2. **Database connection failed**
   - Check RDS security group allows EC2
   - Verify RDS endpoint and credentials
   - Test: `psql -h ENDPOINT -U postgres`

3. **Application won't start**
   - Check logs: `pm2 logs`
   - Verify environment variables
   - Test manually: `cd backend && node server.js`

4. **Nginx 502 error**
   - Check if backend is running: `pm2 status`
   - Verify proxy_pass URL in Nginx config
   - Check Nginx logs: `sudo nginx -t`

### Useful Commands
```bash
# Application management
pm2 status
pm2 logs
pm2 restart influencer-analytics-backend

# System monitoring
htop
df -h
free -h

# Service management
sudo systemctl status nginx postgresql
sudo journalctl -u nginx -f

# Database
psql -h RDS_ENDPOINT -U postgres -d influencer_analytics
```

## 🎯 Success Metrics

### Technical Success
- ✅ Application accessible via HTTPS
- ✅ Admin can log in and access all features
- ✅ Data syncs successfully from NetHunt
- ✅ Analytics dashboard displays data
- ✅ User management functional
- ✅ SSL certificate valid
- ✅ No security warnings
- ✅ Performance acceptable

### Business Success
- ✅ Zero downtime deployment
- ✅ Cost-effective hosting
- ✅ Scalable architecture
- ✅ Professional infrastructure
- ✅ Easy maintenance

## 📞 Support

### Documentation
- **`AWS_CHECKLIST.md`**: Step-by-step checklist
- **`AWS_QUICK_SETUP.md`**: Quick reference
- **`HOSTING_GUIDE.md`**: Detailed guide
- **`DEPLOYMENT.md`**: Technical documentation

### Troubleshooting
1. Check the logs: `pm2 logs`
2. Verify AWS console for resource status
3. Test individual components
4. Review security group configurations
5. Check the detailed guides

### Getting Help
- Review the troubleshooting section
- Check AWS documentation
- Monitor application logs
- Verify configuration files

## 🎉 Ready to Deploy?

Your Influencer Analytics platform is ready for AWS deployment! Follow the guides above and you'll have a production-ready application running in the cloud.

**Start with**: `AWS_CHECKLIST.md` for a complete step-by-step process.

**Quick reference**: `AWS_QUICK_SETUP.md` for the essential commands.

**Need help?**: Check the troubleshooting sections in any guide. 