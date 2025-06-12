# Local Development Setup Guide

This guide will help you set up the AI-Powered SaaS Platform on your local machine.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** for version control
- **SQLite** (usually pre-installed on most systems)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd ai-saas-platform
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or if you prefer yarn
yarn install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```bash
# Copy the example environment file
cp .env.example .env
```

Edit the `.env` file with your configuration:

```env
# Application Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DATABASE_URL=file:./database.sqlite

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Optional: AI Configuration (if using external AI services)
# OPENAI_API_KEY=your-openai-api-key-here
```

### 4. Database Setup

Initialize the SQLite database:

```bash
# Push the schema to create tables
npm run db:push
```

The application will automatically create the SQLite database file and populate it with sample data on first run.

### 5. Start Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

## Development Workflow

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run check        # Run TypeScript type checking
npm run db:push      # Push schema changes to database

# Production
npm run build        # Build for production
npm run start        # Start production server
```

### Project Structure Explanation

```
├── client/                    # Frontend React application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── ui/          # Base UI components (buttons, inputs, etc.)
│   │   │   ├── layout/      # Layout components (sidebar, header)
│   │   │   └── ...          # Feature-specific components
│   │   ├── pages/           # Application pages/routes
│   │   │   ├── dashboard.tsx
│   │   │   ├── chat.tsx
│   │   │   ├── crm.tsx
│   │   │   └── ...
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and configurations
│   │   └── index.css        # Global styles
│   └── index.html           # HTML template
├── server/                   # Backend Express application
│   ├── advanced-rag.ts      # AI RAG system implementation
│   ├── db.ts                # Database connection and initialization
│   ├── index.ts             # Main server entry point
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data access layer
│   └── vite.ts              # Vite integration for serving frontend
├── shared/                   # Shared TypeScript types and schemas
│   └── schema.ts            # Database schema definitions
├── attached_assets/          # AI training data and datasets
│   ├── customer_support_data_*.json
│   ├── mistral_finetune_*.jsonl
│   └── ...
├── uploads/                  # User-uploaded files
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── vite.config.ts           # Vite build configuration
└── drizzle.config.ts        # Database ORM configuration
```

## Features Overview

### 1. AI Chat System
- Advanced RAG system with 9200+ records
- Real-time chat interface with AI responses
- Feedback system (thumbs up/down, session ratings)
- Suggested commands for better user experience

### 2. Customer Relationship Management
- Customer creation and management
- Contact information tracking
- Customer status management

### 3. Quote Management
- Create and manage business quotes
- Link quotes to customers
- Track quote status and amounts

### 4. Settings Management
- User profile configuration
- Notification preferences
- AI configuration options
- System settings
- Security settings

### 5. Dashboard
- Real-time metrics and analytics
- Customer statistics
- Quote summaries
- Chat session insights

## Database Schema

The application uses SQLite with Drizzle ORM. Key tables include:

- **users** - User accounts and authentication
- **customers** - Customer information
- **quotes** - Business quotes and proposals
- **chat_sessions** - AI chat conversation sessions
- **chat_messages** - Individual chat messages
- **commands** - System command execution logs

## API Documentation

### Authentication
The application uses session-based authentication. All API routes are protected except public endpoints.

### Chat API
```typescript
// Send message to AI
POST /api/chat
{
  "message": "How do I reset my password?",
  "sessionId": "optional-session-id"
}

// Submit feedback for AI response
POST /api/chat/feedback
{
  "sessionId": "session-id",
  "messageId": "message-id", 
  "rating": 5,
  "feedback": "Helpful response"
}
```

### CRM API
```typescript
// Get customers
GET /api/customers?search=query&status=active

// Create customer
POST /api/customers
{
  "name": "Company Name",
  "email": "contact@company.com",
  "phone": "+1234567890"
}
```

## Troubleshooting

### Common Issues

1. **Port 5000 already in use**
   ```bash
   # Kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Or use a different port
   PORT=3000 npm run dev
   ```

2. **Database connection issues**
   ```bash
   # Delete and recreate database
   rm database.sqlite
   npm run db:push
   ```

3. **Node modules issues**
   ```bash
   # Clear and reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **TypeScript errors**
   ```bash
   # Run type checking
   npm run check
   ```

### Development Tips

1. **Hot Reload**: The development server supports hot reload for both frontend and backend changes.

2. **Database Inspection**: You can use any SQLite browser to inspect the database file `database.sqlite`.

3. **API Testing**: Use tools like Postman or curl to test API endpoints:
   ```bash
   curl -X GET http://localhost:5000/api/dashboard/metrics
   ```

4. **Logs**: Check the console output for detailed logs about RAG system initialization and API requests.

## Next Steps

After successful local setup:

1. Test all features to ensure everything works
2. Customize the AI responses and datasets
3. Configure your preferred AI service (if needed)
4. Set up your production environment (see [DEPLOYMENT.md](./DEPLOYMENT.md))

## Support

If you encounter any issues during setup:

1. Check the console logs for error messages
2. Ensure all prerequisites are installed correctly
3. Verify your environment variables are set properly
4. Check that port 5000 is available

The application includes comprehensive error handling and logging to help diagnose issues quickly.