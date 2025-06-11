# Smart Deployment Platform - Complete SQLite Setup Guide

## Overview
This guide provides complete instructions to run the Smart Deployment Platform with SQLite database on your local machine.

## Prerequisites
- Node.js 18+ installed
- No external database required (SQLite included)

## Complete Setup Instructions

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Create `.env` file in project root:

```env
# Required: Session Security
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long

# Required: Authentication
REPL_ID=smart-deployment-platform
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc

# Development Mode
NODE_ENV=development

# Optional: Enhanced AI Features
OPENAI_API_KEY=your-openai-api-key

# Optional: Payment Processing
STRIPE_SECRET_KEY=your-stripe-secret-key
VITE_STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_PRICE_ID=your-price-id
```

### Step 3: Database Setup
```bash
# Generate SQLite migrations
npx drizzle-kit generate --config=drizzle.sqlite.config.ts

# Create and setup SQLite database
npx tsx migrate-sqlite.ts

# Verify database setup
npx tsx verify-sqlite.ts
```

### Step 4: Update Application Files
Replace PostgreSQL imports with SQLite imports in these files:

#### server/index.ts
```javascript
// Replace these imports:
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

// With these SQLite imports:
import { storage } from "./storage.sqlite";
import { setupAuth, isAuthenticated } from "./replitAuth.sqlite";
```

#### server/routes.ts
```javascript
// Replace:
import { storage } from "./storage";

// With:
import { storage } from "./storage.sqlite";
```

#### server/deploymentEngine.ts
```javascript
// Replace:
import { storage } from './storage';

// With:
import { storage } from './storage.sqlite';
```

### Step 5: Start Application
```bash
npm run dev
```

Application runs at: `http://localhost:5000`

## What You Get

### Core Features (No API Keys Required)
- **Free AI Code Optimization** - Transforms uploaded code with production enhancements
- **Project Upload & Management** - Supports ZIP files and folder uploads  
- **Live Deployments** - View optimized applications at `/deployed/:id`
- **SQLite Database** - File-based storage with full data persistence
- **User Authentication** - Complete auth system with Replit integration

### Enhanced Features (With API Keys)
- **Advanced AI Analysis** - OpenAI-powered project insights (requires OPENAI_API_KEY)
- **Payment Processing** - Stripe integration for monetization (requires Stripe keys)
- **Production Deployments** - Enhanced deployment options

## Database Details

### Created Tables
1. **users** - User profiles and authentication
2. **projects** - Uploaded code projects and analysis
3. **deployments** - Deployment tracking and status
4. **chat_messages** - AI assistant conversations
5. **transactions** - Payment records and billing
6. **sessions** - User session management

### Database File
- Location: `./database.sqlite`
- WAL mode enabled for performance
- Foreign keys enforced for data integrity
- Optimized pragmas configured

## Testing Your Setup

### 1. Basic Functionality Test
1. Visit `http://localhost:5000`
2. Upload a sample HTML/CSS/JS project
3. View the optimized deployment at `/deployed/1`
4. Confirm data persists after server restart

### 2. Database Verification
```bash
# Check database file exists
ls -la database.sqlite

# Verify all tables created
npx tsx verify-sqlite.ts
```

### 3. Free AI Optimization Test
Upload a simple HTML project and verify these enhancements are applied:
- SEO meta tags added
- Performance optimizations
- Error handling improvements
- Responsive design enhancements
- Accessibility features

## File Structure
```
project/
├── database.sqlite                 # SQLite database file
├── migrate-sqlite.ts              # Migration runner
├── verify-sqlite.ts               # Database verification
├── drizzle.sqlite.config.ts       # SQLite Drizzle config
├── shared/
│   └── schema-clean.sqlite.ts     # SQLite schema
├── server/
│   ├── db.sqlite.ts              # SQLite connection
│   ├── storage.sqlite.ts         # SQLite storage layer
│   └── replitAuth.sqlite.ts      # Auth with SQLite
├── migrations-sqlite/             # Generated migrations
└── .env                          # Environment configuration
```

## Development Commands

```bash
# Start development server
npm run dev

# Generate new migrations
npx drizzle-kit generate --config=drizzle.sqlite.config.ts

# Apply migrations
npx tsx migrate-sqlite.ts

# Verify database
npx tsx verify-sqlite.ts

# View database in browser (optional)
npx drizzle-kit studio --config=drizzle.sqlite.config.ts
```

## Troubleshooting

### Database Issues
```bash
# Recreate database from scratch
rm database.sqlite
npx tsx migrate-sqlite.ts
npx tsx verify-sqlite.ts
```

### Migration Issues
```bash
# Clean and regenerate migrations
rm -rf migrations-sqlite/
npx drizzle-kit generate --config=drizzle.sqlite.config.ts
npx tsx migrate-sqlite.ts
```

### File Upload Issues
- Ensure `uploads/` directory exists and is writable
- Check file size limits (default: 100MB)
- Verify disk space availability

### Port Conflicts
- Default port is 5000
- Change in `server/index.ts` if needed
- Ensure no other services use port 5000

## Production Considerations

### Performance
- SQLite handles up to 100,000 requests/day efficiently
- Consider PostgreSQL for high-traffic applications
- Regular VACUUM operations for optimization

### Backup Strategy
```bash
# Create database backup
cp database.sqlite database.backup.sqlite

# Scheduled backup (add to crontab)
0 2 * * * cp /path/to/database.sqlite /path/to/backups/database-$(date +\%Y\%m\%d).sqlite
```

### Security
- Ensure database file permissions are restrictive
- Regular security updates for dependencies
- Use HTTPS in production environments

## Key Benefits of SQLite Setup

1. **Zero Configuration** - No external database server required
2. **Portable** - Single file contains entire database
3. **Fast Development** - Instant setup and testing
4. **Production Ready** - Suitable for small to medium applications
5. **Backup Simple** - Just copy the database file

The Smart Deployment Platform with SQLite provides a complete, self-contained solution perfect for local development and small to medium-scale deployments.