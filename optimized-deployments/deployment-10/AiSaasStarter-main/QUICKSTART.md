# Quick Start Guide

Get your AI-Powered SaaS Platform running in minutes.

## For Local Development

### Prerequisites Check
```bash
# Check Node.js version (requires v18+)
node --version

# Check npm version
npm --version

# If not installed, download from: https://nodejs.org/
```

### 3-Step Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

3. **Start Application**
   ```bash
   npm run dev
   ```

**Access your application at: http://localhost:5000**

## For Production Deployment

### Automated Deployment (Recommended)

Run the deployment script on your Ubuntu server:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment (will prompt for configuration)
./deploy.sh
```

The script will:
- Install Node.js, Nginx, PM2
- Configure SSL certificates
- Set up monitoring and backups
- Deploy your application

### Manual Deployment

If you prefer manual setup, follow the [DEPLOYMENT.md](./DEPLOYMENT.md) guide.

## Default Login

After setup, access the application with:
- **Username**: admin
- **Password**: admin

*Change these credentials immediately in production*

## Core Features Ready to Use

### 1. AI Chat System
- Navigate to `/chat`
- Start conversations with the AI assistant
- Rate responses with thumbs up/down
- View session ratings after multiple interactions

### 2. Customer Management
- Navigate to `/crm`
- Add, edit, and manage customers
- Track customer status and information

### 3. Quote Management
- Navigate to `/quotes`
- Create and manage business quotes
- Link quotes to customers

### 4. Settings Configuration
- Navigate to `/settings`
- Configure user profile
- Set notification preferences
- Manage AI and system settings

### 5. Dashboard Analytics
- Navigate to `/dashboard`
- View real-time metrics
- Monitor customer and quote statistics

## Customization Quick Tips

### Adding Your Own AI Data
1. Prepare your data in JSONL format
2. Navigate to `/dataset-upload`
3. Upload your custom dataset
4. The AI will incorporate your data automatically

### Changing the Appearance
- Edit `client/src/index.css` for global styles
- Modify `tailwind.config.ts` for theme colors
- Update components in `client/src/components/`

### Adding New Features
- Create new pages in `client/src/pages/`
- Add API routes in `server/routes.ts`
- Update database schema in `shared/schema.ts`

## Common Commands

```bash
# Development
npm run dev              # Start development server
npm run check           # Type checking
npm run db:push         # Update database schema

# Production
npm run build           # Build for production
npm run start           # Start production server

# Deployment Management
./deploy.sh             # Deploy to production
./backup.sh             # Backup data
./update.sh             # Update application
./monitor.sh            # Check system status
```

## Need Help?

- **Setup Issues**: Check [SETUP.md](./SETUP.md)
- **Deployment Issues**: Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Architecture Details**: Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Application Structure**: Check [README.md](./README.md)

## Next Steps After Setup

1. **Security**: Change default passwords and update secrets
2. **Configuration**: Add your API keys in the `.env` file
3. **Customization**: Upload your own AI training data
4. **Monitoring**: Set up monitoring and alerting for production
5. **Backup**: Configure automated backups for your data

Your AI-Powered SaaS Platform is now ready to use!