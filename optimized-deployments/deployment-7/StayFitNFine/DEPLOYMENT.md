# StayFitNFine - Complete Deployment Guide

This guide provides step-by-step instructions to deploy the StayFitNFine dietician website on your own server.

## 📋 Prerequisites

- **Server**: Ubuntu 20.04+ or CentOS 7+ with root access
- **Node.js**: Version 18.0 or higher
- **MySQL**: Version 8.0 or higher
- **Domain**: A registered domain pointing to your server IP
- **SSL Certificate**: Let's Encrypt or commercial SSL certificate

## 🔧 Server Setup

### 1. Update System Packages

```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL
sudo yum update -y
```

### 2. Install Node.js

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 3. Install MySQL Server

```bash
# Ubuntu/Debian
sudo apt install mysql-server -y

# Start and enable MySQL
sudo systemctl start mysql
sudo systemctl enable mysql

# Secure MySQL installation
sudo mysql_secure_installation
```

### 4. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 5. Install Nginx (Web Server)

```bash
# Ubuntu/Debian
sudo apt install nginx -y

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🗄️ Database Setup

### 1. Create Database and User

```bash
# Login to MySQL as root
sudo mysql -u root -p

# Create database
CREATE DATABASE stayfitfine_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create dedicated user
CREATE USER 'stayfitfine_user'@'localhost' IDENTIFIED BY 'your_strong_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON stayfitfine_db.* TO 'stayfitfine_user'@'localhost';

# Flush privileges and exit
FLUSH PRIVILEGES;
EXIT;
```

### 2. Import Database Schema

```bash
# Create the database tables using the provided SQL file
mysql -u stayfitfine_user -p stayfitfine_db < mysql-setup.sql
```

## 📁 Application Deployment

### 1. Create Application Directory

```bash
# Create directory for the application
sudo mkdir -p /var/www/stayfitfine
sudo chown $USER:$USER /var/www/stayfitfine
cd /var/www/stayfitfine
```

### 2. Clone or Upload Application Files

```bash
# Option A: Clone from repository
git clone https://github.com/yourusername/stayfitfine.git .

# Option B: Upload files via SCP
# scp -r /local/path/to/stayfitfine/* user@yourserver:/var/www/stayfitfine/
```

### 3. Install Dependencies

```bash
cd /var/www/stayfitfine
npm install --production
```

### 4. Build the Application

```bash
# Build the frontend
npm run build
```

## ⚙️ Environment Configuration

### 1. Create Production Environment File

```bash
cp .env.example .env
nano .env
```

### 2. Configure Environment Variables

```env
# Database Configuration
DATABASE_URL=mysql://stayfitfine_user:your_strong_password_here@localhost:3306/stayfitfine_db

# MySQL Database Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=stayfitfine_db
MYSQL_USER=stayfitfine_user
MYSQL_PASSWORD=your_strong_password_here

# Application Configuration
NODE_ENV=production
PORT=5000

# Session Security (Generate a strong random string)
SESSION_SECRET=your-super-secure-session-secret-key-here

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# External Services (Optional)
CALENDLY_API_KEY=your-calendly-api-key
CALENDLY_USER_URI=your-calendly-user-uri

# Security Headers
CORS_ORIGIN=https://yourdomain.com
```

### 3. Generate Strong Session Secret

```bash
# Generate a secure session secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🚀 Start the Application

### 1. Test the Application

```bash
# Test run to ensure everything works
cd /var/www/stayfitfine
npm start
```

### 2. Configure PM2

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'stayfitfine',
    script: 'server/index.js',
    cwd: '/var/www/stayfitfine',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: '/var/log/stayfitfine/error.log',
    out_file: '/var/log/stayfitfine/out.log',
    log_file: '/var/log/stayfitfine/combined.log',
    time: true
  }]
};
EOF

# Create log directory
sudo mkdir -p /var/log/stayfitfine
sudo chown $USER:$USER /var/log/stayfitfine

# Start application with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 startup script
pm2 startup
# Follow the instructions provided by the command above
```

## 🌐 Nginx Configuration

### 1. Create Nginx Server Block

```bash
sudo nano /etc/nginx/sites-available/stayfitfine
```

### 2. Add Nginx Configuration

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

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Static files
    location /static/ {
        alias /var/www/stayfitfine/dist/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # All other routes
    location / {
        proxy_pass http://localhost:5000;
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

### 3. Enable Site and Restart Nginx

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/stayfitfine /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## 🔒 SSL Certificate Setup

### 1. Install Certbot

```bash
# Ubuntu/Debian
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Obtain SSL Certificate

```bash
# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test automatic renewal
sudo certbot renew --dry-run
```

## 🔥 Firewall Configuration

### 1. Configure UFW (Ubuntu Firewall)

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Check status
sudo ufw status
```

## 📊 Monitoring and Maintenance

### 1. Monitor Application

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs stayfitfine

# Monitor in real-time
pm2 monit
```

### 2. Database Backup Script

```bash
# Create backup directory
sudo mkdir -p /var/backups/stayfitfine

# Create backup script
cat > /home/$USER/backup_db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u stayfitfine_user -p'your_strong_password_here' stayfitfine_db > /var/backups/stayfitfine/stayfitfine_backup_$DATE.sql
# Keep only last 7 days of backups
find /var/backups/stayfitfine/ -name "*.sql" -mtime +7 -delete
EOF

chmod +x /home/$USER/backup_db.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /home/$USER/backup_db.sh") | crontab -
```

### 3. Application Updates

```bash
# Update application
cd /var/www/stayfitfine
git pull origin main
npm install --production
npm run build
pm2 restart stayfitfine
```

## 🔍 Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check logs
   pm2 logs stayfitfine
   
   # Check environment variables
   cat .env
   
   # Test database connection
   mysql -u stayfitfine_user -p stayfitfine_db
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL status
   sudo systemctl status mysql
   
   # Check database exists
   mysql -u root -p -e "SHOW DATABASES;"
   ```

3. **Nginx errors**
   ```bash
   # Check Nginx status
   sudo systemctl status nginx
   
   # Check configuration
   sudo nginx -t
   
   # View error logs
   sudo tail -f /var/log/nginx/error.log
   ```

## 📞 Support

- Check application logs: `pm2 logs stayfitfine`
- Monitor system resources: `htop`
- Check disk space: `df -h`
- Monitor network: `netstat -tulpn`

## 🔄 Regular Maintenance

1. **Weekly Tasks**
   - Check application logs
   - Monitor disk space
   - Review security updates

2. **Monthly Tasks**
   - Update system packages
   - Renew SSL certificates (automatic)
   - Review backup integrity

3. **Quarterly Tasks**
   - Security audit
   - Performance optimization
   - Database optimization

---

Your StayFitNFine application is now ready for production deployment! 

**Important**: Remember to replace all placeholder values (passwords, domain names, API keys) with your actual production values.