#!/bin/bash

# AI-Powered SaaS Platform - Production Deployment Script
# This script automates the deployment process to your own server

set -e  # Exit on any error

# Configuration
APP_NAME="ai-saas-platform"
APP_DIR="/var/www/${APP_NAME}"
DOMAIN=""
EMAIL=""
GITHUB_REPO=""
NODE_VERSION="18"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "This script should not be run as root. Please run as a regular user with sudo privileges."
    fi
}

# Check if user has sudo privileges
check_sudo() {
    if ! sudo -n true 2>/dev/null; then
        error "This script requires sudo privileges. Please run: sudo -v"
    fi
}

# Get user input for configuration
get_config() {
    echo -e "${BLUE}=== AI-Powered SaaS Platform Deployment Configuration ===${NC}"
    echo
    
    if [[ -z "$DOMAIN" ]]; then
        read -p "Enter your domain name (e.g., yourdomain.com): " DOMAIN
        if [[ -z "$DOMAIN" ]]; then
            error "Domain name is required"
        fi
    fi
    
    if [[ -z "$EMAIL" ]]; then
        read -p "Enter your email for SSL certificate: " EMAIL
        if [[ -z "$EMAIL" ]]; then
            error "Email is required for SSL certificate"
        fi
    fi
    
    if [[ -z "$GITHUB_REPO" ]]; then
        read -p "Enter your GitHub repository URL: " GITHUB_REPO
        if [[ -z "$GITHUB_REPO" ]]; then
            error "GitHub repository URL is required"
        fi
    fi
    
    echo
    echo -e "${BLUE}Configuration Summary:${NC}"
    echo "Domain: $DOMAIN"
    echo "Email: $EMAIL"
    echo "Repository: $GITHUB_REPO"
    echo "App Directory: $APP_DIR"
    echo
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "Deployment cancelled"
    fi
}

# Update system packages
update_system() {
    log "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    sudo apt install -y curl wget git unzip software-properties-common build-essential
}

# Install Node.js
install_nodejs() {
    log "Installing Node.js ${NODE_VERSION}..."
    
    # Check if Node.js is already installed with correct version
    if command -v node &> /dev/null; then
        CURRENT_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
        if [[ "$CURRENT_VERSION" -ge "$NODE_VERSION" ]]; then
            log "Node.js $CURRENT_VERSION is already installed"
            return
        fi
    fi
    
    # Install Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Verify installation
    node --version
    npm --version
}

# Install PM2
install_pm2() {
    log "Installing PM2 process manager..."
    
    if ! command -v pm2 &> /dev/null; then
        sudo npm install -g pm2
    else
        log "PM2 is already installed"
    fi
    
    # Setup PM2 startup
    pm2 startup | grep "sudo" | bash || true
}

# Install and configure Nginx
install_nginx() {
    log "Installing and configuring Nginx..."
    
    sudo apt install -y nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Create Nginx configuration
    sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << EOF
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
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
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
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
    sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test Nginx configuration
    sudo nginx -t
    sudo systemctl restart nginx
}

# Setup firewall
setup_firewall() {
    log "Configuring firewall..."
    
    sudo ufw --force reset
    sudo ufw allow OpenSSH
    sudo ufw allow 'Nginx Full'
    sudo ufw --force enable
}

# Clone and setup application
setup_application() {
    log "Setting up application..."
    
    # Create application directory
    sudo mkdir -p $APP_DIR
    sudo chown $USER:$USER $APP_DIR
    
    # Clone repository
    cd $APP_DIR
    if [[ -d ".git" ]]; then
        log "Repository already exists, pulling latest changes..."
        git pull origin main
    else
        git clone $GITHUB_REPO .
    fi
    
    # Install dependencies
    npm install --production
    
    # Create production environment file
    if [[ ! -f ".env" ]]; then
        cp .env.example .env
        
        # Generate secure session secret
        SESSION_SECRET=$(openssl rand -base64 32)
        
        # Update environment file
        sed -i "s/NODE_ENV=development/NODE_ENV=production/" .env
        sed -i "s|DATABASE_URL=file:./database.sqlite|DATABASE_URL=file:${APP_DIR}/database.sqlite|" .env
        sed -i "s/change-this-to-a-secure-random-string-in-production/${SESSION_SECRET}/" .env
        sed -i "s/DOMAIN=localhost/DOMAIN=${DOMAIN}/" .env
        
        warn "Please edit ${APP_DIR}/.env file to add any API keys or additional configuration"
    fi
    
    # Build application
    npm run build
    
    # Initialize database
    npm run db:push
    
    # Create logs directory
    mkdir -p logs
    
    # Set proper permissions
    sudo chown -R $USER:$USER $APP_DIR
    chmod 600 .env
}

# Create PM2 configuration
create_pm2_config() {
    log "Creating PM2 configuration..."
    
    cd $APP_DIR
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'dist/index.js',
    cwd: '${APP_DIR}',
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
    node_args: '--max-old-space-size=1024',
    watch: false,
    ignore_watch: ['node_modules', 'logs', 'uploads']
  }]
};
EOF
    
    # Start application with PM2
    pm2 delete $APP_NAME 2>/dev/null || true
    pm2 start ecosystem.config.js
    pm2 save
}

# Install SSL certificate
install_ssl() {
    log "Installing SSL certificate..."
    
    # Install Certbot
    sudo apt install -y certbot python3-certbot-nginx
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive
    
    # Test auto-renewal
    sudo certbot renew --dry-run
}

# Setup monitoring and backup
setup_monitoring() {
    log "Setting up monitoring and backup..."
    
    cd $APP_DIR
    
    # Create monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash

echo "=== System Status ==="
echo "Date: $(date)"
echo

echo "=== Disk Usage ==="
df -h

echo "=== Memory Usage ==="
free -h

echo "=== PM2 Status ==="
pm2 status

echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager

echo "=== Recent Application Errors ==="
tail -n 20 logs/err.log 2>/dev/null || echo "No error logs found"
EOF
    chmod +x monitor.sh
    
    # Create backup script
    cat > backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/var/backups/ai-saas-platform"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
sudo mkdir -p $BACKUP_DIR

# Backup database
cp database.sqlite $BACKUP_DIR/database_$DATE.sqlite 2>/dev/null || echo "No database file found"

# Backup uploads
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz uploads/ 2>/dev/null || echo "No uploads directory found"

# Backup environment file
cp .env $BACKUP_DIR/env_$DATE

# Remove backups older than 30 days
sudo find $BACKUP_DIR -type f -mtime +30 -delete 2>/dev/null || true

echo "Backup completed: $DATE"
EOF
    chmod +x backup.sh
    
    # Add to crontab for daily backups
    (crontab -l 2>/dev/null; echo "0 2 * * * cd ${APP_DIR} && ./backup.sh") | crontab -
    
    # Create update script
    cat > update.sh << 'EOF'
#!/bin/bash

echo "Starting application update..."

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
    echo "Update successful!"
else
    echo "Update failed! Check logs:"
    pm2 logs ai-saas-platform --lines 20
    exit 1
fi
EOF
    chmod +x update.sh
}

# Setup log rotation
setup_log_rotation() {
    log "Setting up log rotation..."
    
    sudo tee /etc/logrotate.d/${APP_NAME} > /dev/null << EOF
${APP_DIR}/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        pm2 reloadLogs
    endscript
}
EOF
}

# Final verification
verify_deployment() {
    log "Verifying deployment..."
    
    # Check if PM2 app is running
    if ! pm2 list | grep -q "${APP_NAME}.*online"; then
        error "Application is not running in PM2"
    fi
    
    # Check if Nginx is running
    if ! sudo systemctl is-active --quiet nginx; then
        error "Nginx is not running"
    fi
    
    # Check if port 5000 is listening
    if ! netstat -tuln | grep -q ":5000"; then
        error "Application is not listening on port 5000"
    fi
    
    # Test HTTP response
    if ! curl -f -s "http://localhost:5000" > /dev/null; then
        warn "Application might not be responding correctly"
    fi
    
    log "Deployment verification completed successfully!"
}

# Print final instructions
print_final_instructions() {
    echo
    echo -e "${GREEN}=== Deployment Completed Successfully! ===${NC}"
    echo
    echo -e "${BLUE}Your AI-Powered SaaS Platform is now running at:${NC}"
    echo "  HTTP:  http://${DOMAIN}"
    echo "  HTTPS: https://${DOMAIN}"
    echo
    echo -e "${BLUE}Management Commands:${NC}"
    echo "  Check status:     cd ${APP_DIR} && ./monitor.sh"
    echo "  Update app:       cd ${APP_DIR} && ./update.sh"
    echo "  Backup data:      cd ${APP_DIR} && ./backup.sh"
    echo "  View logs:        pm2 logs ${APP_NAME}"
    echo "  Restart app:      pm2 restart ${APP_NAME}"
    echo
    echo -e "${BLUE}Important Files:${NC}"
    echo "  Environment:      ${APP_DIR}/.env"
    echo "  Database:         ${APP_DIR}/database.sqlite"
    echo "  Logs:             ${APP_DIR}/logs/"
    echo "  Nginx config:     /etc/nginx/sites-available/${APP_NAME}"
    echo
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "1. Update DNS records to point ${DOMAIN} to this server's IP"
    echo "2. Edit ${APP_DIR}/.env to add any required API keys"
    echo "3. Test your application at https://${DOMAIN}"
    echo "4. Set up monitoring and alerting as needed"
    echo
    echo -e "${GREEN}Deployment completed successfully!${NC}"
}

# Main deployment function
main() {
    echo -e "${BLUE}"
    cat << "EOF"
    ╔═══════════════════════════════════════════════════════════╗
    ║            AI-Powered SaaS Platform Deployment           ║
    ║                                                           ║
    ║  This script will deploy your application to production  ║
    ║  with Nginx, PM2, SSL certificates, and monitoring       ║
    ╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    check_root
    check_sudo
    get_config
    
    log "Starting deployment process..."
    
    update_system
    install_nodejs
    install_pm2
    install_nginx
    setup_firewall
    setup_application
    create_pm2_config
    install_ssl
    setup_monitoring
    setup_log_rotation
    verify_deployment
    print_final_instructions
}

# Run main function
main "$@"