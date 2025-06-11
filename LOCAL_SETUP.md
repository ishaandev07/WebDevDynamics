# Smart Deployment Platform - Local Setup Guide

## Prerequisites

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

2. **PostgreSQL**
   - macOS: `brew install postgresql`
   - Ubuntu: `sudo apt install postgresql postgresql-contrib`
   - Windows: Download from postgresql.org

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
```bash
# Start PostgreSQL service
# macOS: brew services start postgresql
# Ubuntu: sudo systemctl start postgresql
# Windows: Start via Services

# Create database
createdb deployment_platform

# Alternative method:
psql -U postgres
CREATE DATABASE deployment_platform;
\q
```

### 3. Environment Configuration
Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

**Minimum required .env configuration:**
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/deployment_platform
SESSION_SECRET=your-random-secret-key-at-least-32-characters-long
REPL_ID=your-app-name
REPLIT_DOMAINS=localhost:5000
NODE_ENV=development
```

### 4. Database Migration
```bash
# Generate migration files
npx drizzle-kit generate

# Apply migrations to database
npx drizzle-kit migrate
```

### 5. Start Development Server
```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

## Features Available Locally

- ✅ **Free AI Code Optimization** - No API keys required
- ✅ **Project Upload & Analysis** - Upload ZIP files or folders
- ✅ **Live Deployments** - View optimized code at `/deployed/:id`
- ✅ **User Authentication** - With Replit Auth
- ✅ **Database Storage** - PostgreSQL with all tables
- ✅ **Payment System** - Stripe integration (requires API keys)
- ✅ **Chat System** - AI assistant for deployment help

## Optional Enhancements

Add these to `.env` for enhanced features:

```env
# Enhanced AI (optional)
OPENAI_API_KEY=sk-your-openai-key

# Payment Processing (optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public
STRIPE_PRICE_ID=price_your_subscription_price_id
```

## Troubleshooting

**Database Connection Issues:**
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
psql postgresql://postgres:password@localhost:5432/deployment_platform
```

**Port Issues:**
- Default port is 5000
- Change in `server/index.ts` if needed

**File Upload Issues:**
- Ensure `uploads/` directory exists
- Check file size limits (default: 100MB)

## Testing the Setup

1. Visit `http://localhost:5000`
2. Upload a sample project (HTML/CSS/JS)
3. View optimized deployment at `/deployed/1`
4. Check dashboard for project management

The free AI optimization system works without any API keys and transforms uploaded code with production enhancements.