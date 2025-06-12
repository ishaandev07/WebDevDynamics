# Production Deployment Checklist ✅

Use this checklist to ensure your StayFitNFine application is ready for production deployment.

## 🔧 Pre-Deployment Setup

### Server Requirements
- [ ] Ubuntu 20.04+ or CentOS 7+ server with root access
- [ ] Minimum 2GB RAM, 20GB disk space
- [ ] Domain name pointing to server IP
- [ ] SSH access configured

### Software Installation
- [ ] Node.js 18.0+ installed
- [ ] MySQL 8.0+ installed and secured
- [ ] PM2 process manager installed globally
- [ ] Nginx web server installed
- [ ] UFW firewall configured

## 🗄️ Database Configuration

### MySQL Setup
- [ ] Database `stayfitfine_db` created
- [ ] Dedicated user `stayfitfine_user` created
- [ ] User has proper permissions on database
- [ ] Database tables imported from `mysql-setup.sql`
- [ ] Database connection tested

### Backup Strategy
- [ ] Automated backup script configured
- [ ] Backup directory `/var/backups/stayfitfine` created
- [ ] Cron job for daily backups scheduled
- [ ] Backup retention policy implemented (7 days)

## ⚙️ Application Configuration

### Environment Variables
- [ ] `.env` file created from `.env.example`
- [ ] `DATABASE_URL` configured with correct credentials
- [ ] `SESSION_SECRET` set to strong random string (64+ characters)
- [ ] `NODE_ENV` set to `production`
- [ ] `PORT` set to `5000`
- [ ] Optional SMTP settings configured if email features needed

### Application Files
- [ ] All application files uploaded to `/var/www/stayfitfine`
- [ ] Correct file permissions set (owned by application user)
- [ ] Dependencies installed with `npm ci --production`
- [ ] Application built with `npm run build`

## 🚀 Process Management

### PM2 Configuration
- [ ] `ecosystem.config.js` file present
- [ ] Log directory `/var/log/stayfitfine` created
- [ ] PM2 process started successfully
- [ ] PM2 configuration saved
- [ ] PM2 startup script configured for auto-restart

### Process Verification
- [ ] Application responds on port 5000
- [ ] All API endpoints functional
- [ ] Database connections working
- [ ] No errors in PM2 logs

## 🌐 Web Server Setup

### Nginx Configuration
- [ ] Server block created in `/etc/nginx/sites-available/stayfitfine`
- [ ] Site enabled and symlinked to `sites-enabled`
- [ ] Nginx configuration tested (`nginx -t`)
- [ ] Reverse proxy to application port 5000 configured
- [ ] Static file serving configured
- [ ] Gzip compression enabled

### SSL Certificate
- [ ] Certbot installed
- [ ] SSL certificate obtained for domain
- [ ] HTTPS redirect configured
- [ ] Certificate auto-renewal tested
- [ ] Security headers configured

## 🔒 Security Configuration

### Firewall Setup
- [ ] UFW enabled
- [ ] SSH port allowed (22)
- [ ] HTTP port allowed (80)
- [ ] HTTPS port allowed (443)
- [ ] All other ports blocked
- [ ] Firewall status verified

### Application Security
- [ ] Strong session secret configured
- [ ] Security headers implemented in Nginx
- [ ] CORS properly configured
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

## 📊 Monitoring & Maintenance

### Logging
- [ ] Application logs accessible via PM2
- [ ] Nginx access logs configured
- [ ] Nginx error logs configured
- [ ] Log rotation configured
- [ ] Log monitoring strategy in place

### Performance
- [ ] Application performance tested under load
- [ ] Database queries optimized
- [ ] Static asset caching configured
- [ ] CDN consideration (if needed)

### Backup & Recovery
- [ ] Database backup script tested
- [ ] Application files backup strategy
- [ ] Recovery procedures documented
- [ ] Backup integrity verification process

## 🔍 Testing & Validation

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] User registration/login works
- [ ] All navigation links functional
- [ ] Contact forms submit successfully
- [ ] Health calculators working
- [ ] Admin dashboard accessible
- [ ] Mobile responsiveness verified

### Performance Testing
- [ ] Page load times acceptable (<3 seconds)
- [ ] Database queries performant
- [ ] Memory usage within limits
- [ ] CPU usage reasonable under load

### Security Testing
- [ ] HTTPS enforced
- [ ] Session security verified
- [ ] Input validation working
- [ ] Error handling doesn't expose sensitive data

## 📝 Documentation

### Deployment Documentation
- [ ] DEPLOYMENT.md reviewed and customized
- [ ] Server configuration documented
- [ ] Environment variables documented
- [ ] Backup procedures documented

### Operational Documentation
- [ ] Monitoring procedures documented
- [ ] Troubleshooting guide available
- [ ] Update procedures documented
- [ ] Emergency contact information available

## 🚦 Go-Live Checklist

### Final Steps
- [ ] All above items completed
- [ ] DNS propagation verified
- [ ] SSL certificate valid and trusted
- [ ] All team members notified
- [ ] Monitoring alerts configured

### Post-Deployment
- [ ] Application health verified
- [ ] Performance metrics baseline established
- [ ] User acceptance testing completed
- [ ] Stakeholders notified of successful deployment

## 🆘 Emergency Procedures

### Rollback Plan
- [ ] Previous version backup available
- [ ] Rollback procedure documented and tested
- [ ] Database rollback strategy defined
- [ ] Emergency contact list prepared

### Incident Response
- [ ] Monitoring alerts configured
- [ ] Escalation procedures defined
- [ ] Communication plan established
- [ ] Recovery time objectives defined

---

## Deployment Commands Summary

```bash
# 1. Clone repository
git clone <repository-url> /var/www/stayfitfine
cd /var/www/stayfitfine

# 2. Setup environment
cp .env.example .env
nano .env  # Configure all variables

# 3. Install and build
npm ci --production
npm run build

# 4. Deploy with script
./deploy.sh

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/stayfitfine
sudo ln -s /etc/nginx/sites-available/stayfitfine /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# 6. Setup SSL
sudo certbot --nginx -d yourdomain.com

# 7. Configure firewall
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
```

**Status: ✅ READY FOR PRODUCTION**

Your StayFitNFine application is fully configured and ready for deployment!