# Production Deployment Guide

This guide covers deploying the AI-Powered SaaS Platform to your own server.

## Server Requirements

### Minimum Specifications
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB SSD
- **OS**: Ubuntu 20.04 LTS or newer (recommended)
- **Network**: Static IP address

### Recommended Specifications
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

## Prerequisites

### 1. Server Setup

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential packages
sudo apt install -y curl wget git unzip software-properties-common

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 2. Install Process Manager

```bash
# Install PM2 for process management
sudo npm install -g pm2

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME
```

### 3. Install Reverse Proxy (Nginx)

```bash
# Install Nginx
sudo apt install -y nginx

# Start and enable Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 4. Setup Firewall

```bash
# Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Deployment Steps

### 1. Clone and Setup Application

```bash
# Clone your repository
cd /var/www
sudo mkdir ai-saas-platform
sudo chown $USER:$USER ai-saas-platform
cd ai-saas-platform

# Clone your code (replace with your repository URL)
git clone <your-repository-url> .

# Install dependencies
npm install --production
```

### 2. Environment Configuration

```bash
# Create production environment file
cp .env.example .env
```

Edit the production `.env` file:

```env
# Production Configuration
NODE_ENV=production
PORT=5000

# Database Configuration
DATABASE_URL=file:/var/www/ai-saas-platform/database.sqlite

# Security
SESSION_SECRET=your-super-secure-session-secret-for-production

# Domain Configuration
DOMAIN=yourdomain.com

# Optional: AI Services
# OPENAI_API_KEY=your-production-openai-key
```

### 3. Build Application

```bash
# Build the application for production
npm run build

# Initialize database
npm run db:push
```

### 4. Configure PM2

Create PM2 ecosystem configuration:

```bash
# Create PM2 configuration file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'ai-saas-platform',
    script: 'dist/index.js',
    cwd: '/var/www/ai-saas-platform',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
```

### 5. Configure Nginx

Create Nginx site configuration:

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/ai-saas-platform << 'EOF'
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
    
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
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # API rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
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
    
    # Static file handling
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        proxy_pass http://localhost:5000;
    }
    
    # File upload size
    client_max_body_size 50M;
}
EOF

# Enable the site
sudo ln -s /etc/nginx/sites-available/ai-saas-platform /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

## Monitoring and Maintenance

### 1. PM2 Monitoring

```bash
# View application status
pm2 status

# View logs
pm2 logs ai-saas-platform

# Restart application
pm2 restart ai-saas-platform

# Monitor resources
pm2 monit
```

### 2. System Monitoring

Create monitoring script:

```bash
# Create monitoring script
cat > /var/www/ai-saas-platform/monitor.sh << 'EOF'
#!/bin/bash

# Check disk space
df -h

# Check memory usage
free -h

# Check PM2 status
pm2 status

# Check Nginx status
sudo systemctl status nginx

# Check application logs for errors
tail -n 50 /var/www/ai-saas-platform/logs/err.log
EOF

chmod +x /var/www/ai-saas-platform/monitor.sh
```

### 3. Backup Script

```bash
# Create backup script
cat > /var/www/ai-saas-platform/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/ai-saas-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
cp /var/www/ai-saas-platform/database.sqlite $BACKUP_DIR/database_$DATE.sqlite

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/ai-saas-platform/uploads

# Backup environment file
cp /var/www/ai-saas-platform/.env $BACKUP_DIR/env_$DATE

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
EOF

chmod +x /var/www/ai-saas-platform/backup.sh

# Add to crontab for daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /var/www/ai-saas-platform/backup.sh") | crontab -
```

### 4. Log Rotation

```bash
# Create logrotate configuration
sudo tee /etc/logrotate.d/ai-saas-platform << 'EOF'
/var/www/ai-saas-platform/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
```

## Security Hardening

### 1. File Permissions

```bash
# Set proper file permissions
sudo chown -R www-data:www-data /var/www/ai-saas-platform
sudo chmod -R 755 /var/www/ai-saas-platform
sudo chmod 600 /var/www/ai-saas-platform/.env
sudo chmod 644 /var/www/ai-saas-platform/database.sqlite
```

### 2. Fail2Ban Setup

```bash
# Install Fail2Ban
sudo apt install -y fail2ban

# Configure Fail2Ban for Nginx
sudo tee /etc/fail2ban/jail.local << 'EOF'
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 6

[nginx-badbots]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2

[nginx-noproxy]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

# Restart Fail2Ban
sudo systemctl restart fail2ban
```

## Troubleshooting

### Common Issues

1. **Application won't start**
   ```bash
   # Check PM2 logs
   pm2 logs ai-saas-platform
   
   # Check Node.js version
   node --version
   
   # Rebuild application
   npm run build
   ```

2. **Database permission errors**
   ```bash
   # Fix database permissions
   sudo chown www-data:www-data /var/www/ai-saas-platform/database.sqlite
   sudo chmod 644 /var/www/ai-saas-platform/database.sqlite
   ```

3. **Nginx configuration errors**
   ```bash
   # Test Nginx configuration
   sudo nginx -t
   
   # Check Nginx logs
   sudo tail -f /var/log/nginx/error.log
   ```

4. **SSL certificate issues**
   ```bash
   # Renew certificate manually
   sudo certbot renew
   
   # Check certificate status
   sudo certbot certificates
   ```

## Performance Optimization

### 1. Enable Gzip Compression

Already configured in Nginx setup above.

### 2. Database Optimization

```bash
# Optimize SQLite database
sqlite3 /var/www/ai-saas-platform/database.sqlite "VACUUM;"
sqlite3 /var/www/ai-saas-platform/database.sqlite "ANALYZE;"
```

### 3. PM2 Cluster Mode

Already configured in ecosystem.config.js for maximum performance.

## Updates and Deployment

Create deployment script for easy updates:

```bash
# Create deployment script
cat > /var/www/ai-saas-platform/deploy.sh << 'EOF'
#!/bin/bash

echo "Starting deployment..."

# Backup current version
./backup.sh

# Pull latest code
git pull origin main

# Install any new dependencies
npm install --production

# Run database migrations if needed
npm run db:push

# Build application
npm run build

# Restart application
pm2 restart ai-saas-platform

# Wait for app to be ready
sleep 10

# Check if app is running
if pm2 list | grep -q "ai-saas-platform.*online"; then
    echo "Deployment successful!"
else
    echo "Deployment failed! Check logs:"
    pm2 logs ai-saas-platform --lines 20
    exit 1
fi
EOF

chmod +x /var/www/ai-saas-platform/deploy.sh
```

## Domain Setup

1. Point your domain's A record to your server's IP address
2. Update the `server_name` in Nginx configuration
3. Obtain SSL certificate with the correct domain
4. Update the `DOMAIN` environment variable

Your AI-Powered SaaS Platform is now ready for production use!