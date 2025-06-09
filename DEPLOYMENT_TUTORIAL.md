# Smart Deployment Dashboard - Complete Deployment Tutorial

## Table of Contents
1. [System Overview](#system-overview)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Setup](#database-setup)
5. [Environment Configuration](#environment-configuration)
6. [Troubleshooting Guide](#troubleshooting-guide)

## System Overview

The Smart Deployment Dashboard is a full-stack application that helps users deploy their code with AI assistance. It consists of:

- **Frontend**: React with TypeScript, Vite, TailwindCSS, shadcn/ui
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OAuth integration
- **AI Engine**: Local rule-based analysis (no API keys required)

## Frontend Deployment

### 1. Build Process
```bash
# Install dependencies
npm install

# Build the frontend
npm run build

# The built files will be in the 'dist' directory
```

### 2. Static File Serving
The backend automatically serves the frontend files in production:
```typescript
// server/vite.ts handles this automatically
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
```

### 3. Environment Variables for Frontend
```env
VITE_API_URL=https://your-domain.com/api
```

## Backend Deployment

### 1. Server Configuration
The Express server is configured to:
- Serve static files in production
- Handle API routes
- Manage authentication
- Process file uploads

### 2. Key Server Files
- `server/index.ts` - Main server entry point
- `server/routes.ts` - API endpoints
- `server/storage.ts` - Database operations
- `server/replitAuth.ts` - Authentication middleware

### 3. Production Settings
```typescript
// server/index.ts
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Database Setup

### 1. PostgreSQL Requirements
- PostgreSQL 12+ recommended
- Connection string format: `postgresql://user:password@host:port/database`

### 2. Schema Migration
```bash
# Push schema to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate
```

### 3. Required Tables
The application creates these tables automatically:
- `users` - User profiles and authentication data
- `sessions` - Session storage for authentication
- `projects` - Uploaded projects and analysis results
- `deployments` - Deployment tracking and status
- `chat_messages` - AI assistant conversations

## Environment Configuration

### Required Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=database_name

# Authentication (Replit OAuth)
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.com

# Server
NODE_ENV=production
PORT=5000
```

### Optional Environment Variables
```env
# OpenAI (if you want to use real AI instead of local analysis)
OPENAI_API_KEY=your-openai-key
```

## Deployment Steps

### 1. Replit Deployment
```bash
# The application is already configured for Replit
# Simply click the "Deploy" button in Replit

# Or use Replit CLI
replit deploy
```

### 2. Manual Server Deployment
```bash
# 1. Clone the repository
git clone your-repo-url
cd smart-deployment-dashboard

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.example .env
# Edit .env with your values

# 4. Setup database
npm run db:push

# 5. Build and start
npm run build
npm start
```

### 3. Docker Deployment
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000
CMD ["npm", "start"]
```

## File Upload Configuration

### 1. Upload Limits
```typescript
// server/routes.ts
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});
```

### 2. Supported Formats
- ZIP files (traditional upload)
- Folder uploads (drag & drop)
- Individual files up to 100MB

### 3. File Processing Flow
1. User uploads files via frontend
2. Backend processes and stores files
3. AI analysis extracts framework information
4. Results displayed in dashboard

## AI Analysis Engine

### 1. Framework Detection
The system detects frameworks by analyzing:
- `package.json` for Node.js projects
- `requirements.txt` for Python projects
- `pom.xml` for Java projects
- File patterns and directory structure

### 2. Analysis Results
```typescript
interface ProjectAnalysis {
  framework: string;
  dependencies: string[];
  entryPoint: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
  environmentVariables?: string[];
  issues: string[];
  recommendations: string[];
  confidence: number;
}
```

### 3. Deployment Guidance Generation
Based on detected framework, the system provides:
- Step-by-step deployment instructions
- Required configuration files
- Environment variable recommendations
- Common issue warnings

## Troubleshooting Guide

### Common Issues

#### 1. Database Connection Errors
```bash
# Check database URL format
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL

# Reset database schema
npm run db:push
```

#### 2. Authentication Issues
```bash
# Verify Replit OAuth settings
echo $REPL_ID
echo $REPLIT_DOMAINS

# Check session secret
echo $SESSION_SECRET
```

#### 3. File Upload Problems
- Check file size limits (100MB max)
- Verify upload directory permissions
- Ensure multer is properly configured

#### 4. Frontend Build Issues
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Performance Optimization

#### 1. Database Optimization
- Use connection pooling
- Add database indices for frequently queried fields
- Regular database maintenance

#### 2. File Upload Optimization
- Implement chunked uploads for large files
- Add compression for file storage
- Use CDN for static file serving

#### 3. Frontend Optimization
- Code splitting with React.lazy()
- Image optimization
- Bundle size analysis

## Monitoring and Logging

### 1. Application Logs
```typescript
// Add structured logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### 2. Health Checks
```typescript
// Add health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 3. Error Tracking
- Implement error boundaries in React
- Add server-side error handling
- Monitor database connection health

## Security Considerations

### 1. File Upload Security
- Validate file types and sizes
- Scan uploaded files for malware
- Implement rate limiting

### 2. Authentication Security
- Use secure session configuration
- Implement CSRF protection
- Regular security updates

### 3. Database Security
- Use parameterized queries (Drizzle ORM handles this)
- Regular security patches
- Backup and recovery procedures

## Scaling Considerations

### 1. Horizontal Scaling
- Stateless server design
- Load balancer configuration
- Session store externalization

### 2. Database Scaling
- Read replicas for query performance
- Connection pooling optimization
- Database sharding strategies

### 3. File Storage Scaling
- Cloud storage integration (AWS S3, etc.)
- CDN implementation
- File cleanup strategies

This tutorial provides a comprehensive guide for deploying and maintaining the Smart Deployment Dashboard. For specific deployment platforms, refer to their documentation for additional configuration requirements.