#!/bin/bash

# StayFitNFine Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting StayFitNFine deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Copying from .env.example..."
    cp .env.example .env
    print_warning "Please edit .env file with your production values before proceeding."
    print_warning "Run: nano .env"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Install dependencies
print_status "Installing production dependencies..."
npm ci --production

# Build the application
print_status "Building application..."
npm run build

# Check if PM2 is installed
if ! command -v pm2 &> /dev/null; then
    print_warning "PM2 not found. Installing PM2 globally..."
    npm install -g pm2
fi

# Create log directory
print_status "Creating log directory..."
sudo mkdir -p /var/log/stayfitfine
sudo chown $USER:$USER /var/log/stayfitfine

# Stop existing PM2 process if running
if pm2 list | grep -q "stayfitfine"; then
    print_status "Stopping existing PM2 process..."
    pm2 stop stayfitfine
    pm2 delete stayfitfine
fi

# Start application with PM2
print_status "Starting application with PM2..."
pm2 start ecosystem.config.js

# Save PM2 configuration
print_status "Saving PM2 configuration..."
pm2 save

# Setup PM2 startup script (if not already done)
print_status "Setting up PM2 startup script..."
pm2 startup

print_status "Deployment completed successfully!"
print_status "Application is running on port 5000"
print_status "Check logs with: pm2 logs stayfitfine"
print_status "Monitor with: pm2 monit"

echo ""
print_status "Next steps:"
echo "1. Configure Nginx reverse proxy"
echo "2. Setup SSL certificate with Let's Encrypt"
echo "3. Configure firewall settings"
echo "4. Setup database backups"
echo ""
print_status "See DEPLOYMENT.md for detailed instructions"