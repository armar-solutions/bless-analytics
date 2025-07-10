# 🚀 Quick Hosting Reference

## 1. Get a Server
- **DigitalOcean**: $6/month (recommended)
- **AWS**: Free tier available
- **Vultr**: $5/month

## 2. Connect & Setup
```bash
ssh root@your-server-ip
wget https://raw.githubusercontent.com/your-username/influencer-analytics/main/server-setup.sh
chmod +x server-setup.sh
./server-setup.sh
```

## 3. Deploy App
```bash
cd /var/www
git clone https://github.com/your-username/influencer-analytics.git
cd influencer-analytics
./generate-secrets.sh
./setup-database.sh
cd backend && cp .env.example .env && nano .env
cd .. && ./deploy.sh
```

## 4. Create Admin
```bash
cd backend
node create-admin.js admin@yourdomain.com password123
```

## 5. Configure Domain (Optional)
```bash
sudo nano /etc/nginx/sites-available/influencer-analytics
sudo ln -s /etc/nginx/sites-available/influencer-analytics /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

## 🔧 Useful Commands
```bash
pm2 status                    # Check app status
pm2 logs                      # View logs
pm2 restart influencer-analytics-backend  # Restart app
sudo systemctl status nginx postgresql  # Check services
```

## 📍 Your App Will Be At
- **IP only**: `http://your-server-ip`
- **With domain**: `https://yourdomain.com`

## 🆘 Need Help?
- Check logs: `pm2 logs`
- See detailed guide: `HOSTING_GUIDE.md`
- Full deployment docs: `DEPLOYMENT.md` 