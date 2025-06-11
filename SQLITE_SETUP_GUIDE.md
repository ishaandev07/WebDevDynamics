# Smart Deployment Platform - SQLite Setup Guide

## Complete Local Setup with SQLite Database

### Prerequisites

1. **Node.js 18+**
   ```bash
   node --version  # Should be 18+
   npm --version   # Should be 9+
   ```

2. **No external database required** - SQLite runs in-process

### Installation Steps

#### 1. Install Dependencies
```bash
npm install
```

#### 2. Environment Configuration
Create `.env` file in project root:

```env
# Session Configuration (Required)
SESSION_SECRET=your-super-secret-session-key-at-least-32-characters-long-here

# Replit Auth Configuration (Required for authentication)
REPL_ID=smart-deployment-platform
REPLIT_DOMAINS=localhost:5000
ISSUER_URL=https://replit.com/oidc

# Development Environment
NODE_ENV=development

# Optional: Enhanced AI Features
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Payment Processing
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_PRICE_ID=price_your_subscription_price_id
```

#### 3. Generate SQLite Database Schema
```bash
# Generate migrations using SQLite config
npx drizzle-kit generate --config=drizzle.sqlite.config.ts

# Run migrations to create SQLite database
npx tsx migrate-sqlite.ts
```

#### 4. Switch Project to SQLite Mode
Update the following files to use SQLite:

**server/index.ts** - Import SQLite modules:
```javascript
// Replace PostgreSQL imports with SQLite imports
import { storage } from "./storage.sqlite";
import { setupAuth, isAuthenticated } from "./replitAuth.sqlite";
```

**server/routes.ts** - Update storage import:
```javascript
// Replace
import { storage } from "./storage";
// With
import { storage } from "./storage.sqlite";
```

**server/deploymentEngine.ts** - Update storage import:
```javascript
// Replace
import { storage } from './storage';
// With
import { storage } from './storage.sqlite';
```

#### 5. Start the Application
```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

### SQLite Database Features

- **File-based database**: `database.sqlite` in project root
- **No server setup required**: SQLite runs in-process
- **WAL mode enabled**: Better performance and concurrency
- **Foreign keys enabled**: Data integrity enforcement
- **Optimized pragmas**: Enhanced performance settings

### Database Tables Created

1. **users** - User authentication and profiles
2. **projects** - Uploaded code projects
3. **deployments** - Deployment tracking and status
4. **chat_messages** - AI assistant conversation history
5. **transactions** - Payment and billing records
6. **sessions** - User session storage (memory-based)

### Available Features

- ✅ **Free AI Code Optimization** - No API keys required
- ✅ **Project Upload & Analysis** - ZIP files and folders
- ✅ **Live Deployments** - View optimized code at `/deployed/:id`
- ✅ **User Authentication** - Replit Auth integration
- ✅ **SQLite Database** - Local file-based storage
- ✅ **Payment System** - Stripe integration (with API keys)
- ✅ **AI Chat Assistant** - Deployment guidance and help

### Development Commands

```bash
# Start development server
npm run dev

# Generate new migrations
npx drizzle-kit generate --config=drizzle.sqlite.config.ts

# Apply migrations
npx tsx migrate-sqlite.ts

# View database in browser (optional)
npx drizzle-kit studio --config=drizzle.sqlite.config.ts
```

### File Structure

```
project/
├── database.sqlite              # SQLite database file
├── migrate-sqlite.ts           # Migration runner
├── drizzle.sqlite.config.ts    # SQLite Drizzle config
├── shared/
│   └── schema.sqlite.ts        # SQLite schema definitions
├── server/
│   ├── db.sqlite.ts           # SQLite connection
│   ├── storage.sqlite.ts      # SQLite storage layer
│   └── replitAuth.sqlite.ts   # Auth with SQLite support
└── migrations/                 # Generated migration files
```

### Testing the Setup

1. **Visit Application**: `http://localhost:5000`
2. **Upload Project**: Use the upload form to add a code project
3. **View Deployment**: Check optimized code at `/deployed/1`
4. **Test Database**: Verify data persistence across server restarts
5. **Check Chat**: Use AI assistant for deployment guidance

### Troubleshooting

**SQLite Database Issues:**
```bash
# Check if database file exists
ls -la database.sqlite

# Verify tables were created
sqlite3 database.sqlite ".tables"

# Check schema
sqlite3 database.sqlite ".schema"
```

**Migration Issues:**
```bash
# Clean migrations and regenerate
rm -rf migrations/
npx drizzle-kit generate --config=drizzle.sqlite.config.ts
npx tsx migrate-sqlite.ts
```

**File Permissions:**
```bash
# Ensure database file is writable
chmod 664 database.sqlite
```

### Production Deployment

For production deployment with SQLite:

1. Ensure `database.sqlite` file permissions are correct
2. Consider SQLite backup strategies
3. Monitor database file size and performance
4. Use WAL mode for better concurrency
5. Regular VACUUM operations for optimization

The Smart Deployment Platform with SQLite provides a complete, self-contained solution with no external database dependencies.