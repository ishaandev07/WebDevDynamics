# Application Architecture

This document provides a comprehensive overview of the AI-Powered SaaS Platform architecture.

## System Overview

The application follows a modern full-stack architecture with clear separation between frontend and backend components, integrated AI capabilities, and robust data management.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Data Layer    │
│   (React)       │◄──►│   (Express)     │◄──►│   (SQLite)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   AI/RAG        │
                       │   System        │
                       └─────────────────┘
```

## Frontend Architecture

### Technology Stack
- **React 18** - Modern component-based UI library
- **TypeScript** - Type-safe JavaScript development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/UI** - High-quality component library
- **TanStack Query** - Server state management
- **Wouter** - Lightweight client-side routing
- **Framer Motion** - Animation library

### Component Structure
```
client/src/
├── components/
│   ├── ui/                    # Base UI components (buttons, inputs, etc.)
│   ├── layout/                # Layout components (sidebar, header)
│   ├── message-feedback.tsx   # Chat feedback component
│   └── rating-popup.tsx       # Session rating component
├── pages/                     # Route components
│   ├── dashboard.tsx          # Main dashboard with metrics
│   ├── chat.tsx              # AI chat interface
│   ├── crm.tsx               # Customer management
│   ├── quotes.tsx            # Quote management
│   ├── settings.tsx          # Application settings
│   └── ...
├── hooks/                     # Custom React hooks
│   ├── use-chat.ts           # Chat functionality
│   └── use-toast.ts          # Toast notifications
└── lib/                       # Utilities and configurations
    ├── queryClient.ts        # TanStack Query setup
    └── utils.ts              # Helper functions
```

### State Management
- **Local State**: React useState for component-specific state
- **Server State**: TanStack Query for API data caching and synchronization
- **Global State**: Context API for shared application state (theme, user)

### Routing Strategy
```typescript
// Route configuration in App.tsx
<Switch>
  <Route path="/" component={Dashboard} />
  <Route path="/chat" component={Chat} />
  <Route path="/crm" component={CRM} />
  <Route path="/quotes" component={Quotes} />
  <Route path="/settings" component={Settings} />
</Switch>
```

## Backend Architecture

### Technology Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Type-safe database operations
- **SQLite** - Lightweight database
- **Session-based Authentication** - Secure user sessions

### API Structure
```
server/
├── index.ts              # Main server entry point
├── routes.ts             # API route definitions
├── storage.ts            # Data access layer
├── db.ts                 # Database configuration
├── advanced-rag.ts       # AI/RAG system
└── vite.ts              # Frontend integration
```

### API Endpoints
```
Authentication & Users
├── POST /api/auth/login
├── POST /api/auth/logout
└── GET  /api/auth/user

Chat System
├── POST /api/chat
├── POST /api/chat/feedback
├── POST /api/chat/session-feedback
└── GET  /api/chat/feedback-stats

CRM & Business
├── GET  /api/customers
├── POST /api/customers
├── PUT  /api/customers/:id
├── GET  /api/quotes
├── POST /api/quotes
└── GET  /api/dashboard/metrics

Data Management
├── POST /api/upload-dataset
├── GET  /api/datasets
└── GET  /api/search
```

## Database Architecture

### Schema Design
```sql
-- Core Tables
users (id, username, email, password_hash, created_at)
customers (id, name, email, phone, status, created_at)
quotes (id, customer_id, amount, status, description, created_at)

-- Chat System
chat_sessions (id, session_id, user_id, created_at)
chat_messages (id, session_id, content, is_user, created_at)

-- Command System
commands (id, user_id, command, status, output, created_at)
```

### Relationships
- **Users** ← 1:N → **Chat Sessions**
- **Chat Sessions** ← 1:N → **Chat Messages**
- **Customers** ← 1:N → **Quotes**
- **Users** ← 1:N → **Commands**

### Data Access Pattern
```typescript
// Repository pattern with Drizzle ORM
interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getQuotes(): Promise<QuoteWithCustomer[]>;
  // ... other methods
}
```

## AI/RAG System Architecture

### Components
```
┌─────────────────┐
│   Query Input   │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Text Processing │
│ & Normalization │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Vector Search   │
│ (TF-IDF Index)  │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Result Ranking  │
│ & Filtering     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Response        │
│ Generation      │
└─────────────────┘
```

### Data Sources
1. **Internal Dataset** - Mistral fine-tuning data (JSONL format)
2. **Customer Support Dataset** - 9200+ support conversations
3. **Custom Datasets** - User-uploaded training data

### Search Algorithm
```typescript
// TF-IDF Vector Search Implementation
class VectorSearch {
  private tfidfIndex: Map<string, Map<number, number>>;
  private documents: DatasetItem[];
  
  calculateSimilarity(query: string, docId: number): number {
    // Cosine similarity calculation
    // Returns similarity score 0-1
  }
  
  search(query: string, topK: number): SearchResult[] {
    // Returns ranked results with similarity scores
  }
}
```

### Response Generation
```typescript
// Advanced response generation with context
generateAdvancedResponse(query: string, results: SearchResult[]): string {
  const category = this.categorizeQuery(query);
  const baseResponse = this.selectBestResponse(results);
  return this.refineResponse(baseResponse, query, category);
}
```

## Security Architecture

### Authentication & Authorization
- **Session-based Authentication** with secure cookies
- **Password Hashing** using bcrypt
- **CSRF Protection** via session validation
- **Rate Limiting** on API endpoints

### Data Security
- **Input Validation** using Zod schemas
- **SQL Injection Prevention** via parameterized queries
- **XSS Protection** through proper encoding
- **File Upload Security** with type validation

### Infrastructure Security
- **HTTPS Enforcement** via SSL certificates
- **Security Headers** (CSP, HSTS, etc.)
- **Firewall Configuration** for production
- **Regular Security Updates** for dependencies

## Performance Architecture

### Frontend Optimization
- **Code Splitting** with dynamic imports
- **Lazy Loading** for routes and components
- **Asset Optimization** (images, fonts, etc.)
- **Caching Strategy** via TanStack Query

### Backend Optimization
- **Database Indexing** on frequently queried columns
- **Connection Pooling** for database connections
- **Response Compression** (gzip)
- **Static Asset Serving** via Nginx

### AI System Optimization
- **TF-IDF Indexing** for fast vector search
- **Result Caching** for repeated queries
- **Batch Processing** for dataset updates
- **Memory Management** for large datasets

## Deployment Architecture

### Development Environment
```
┌─────────────────┐
│ Vite Dev Server │ ← Frontend (React)
│ Port 5000       │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Express Server  │ ← Backend (Node.js)
│ Port 5000       │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ SQLite Database │ ← Data Layer
│ File System     │
└─────────────────┘
```

### Production Environment
```
┌─────────────────┐
│     Nginx       │ ← Reverse Proxy / SSL
│ Port 80/443     │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ PM2 Cluster     │ ← Process Manager
│ Multiple Workers│
└─────────┬───────┘
          │
┌─────────▼───────┐
│ Express App     │ ← Application Server
│ Port 5000       │
└─────────┬───────┘
          │
┌─────────▼───────┐
│ SQLite Database │ ← Persistent Storage
│ + File Uploads  │
└─────────────────┘
```

## Monitoring & Logging

### Application Monitoring
- **PM2 Monitoring** for process health
- **Error Logging** with structured logs
- **Performance Metrics** collection
- **Health Check Endpoints**

### System Monitoring
- **Server Resources** (CPU, Memory, Disk)
- **Database Performance** monitoring
- **Network Traffic** analysis
- **SSL Certificate** expiration tracking

## Scalability Considerations

### Horizontal Scaling
- **Load Balancer** configuration ready
- **Stateless Application** design
- **Session Store** externalization options
- **Database** migration path to PostgreSQL

### Vertical Scaling
- **PM2 Cluster Mode** for multi-core usage
- **Memory Optimization** for AI datasets
- **Database** connection pooling
- **Caching Layers** implementation ready

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (`npm install`)
3. Setup environment (`.env` file)
4. Start development server (`npm run dev`)

### Production Deployment
1. Server preparation (Node.js, Nginx, PM2)
2. Application deployment (`deploy.sh` script)
3. SSL certificate setup
4. Monitoring configuration

### CI/CD Pipeline (Future)
```
GitHub Actions Workflow:
├── Code Quality Checks (ESLint, TypeScript)
├── Automated Testing (Unit, Integration)
├── Build Process (Frontend + Backend)
├── Security Scanning
└── Deployment to Staging/Production
```

This architecture provides a solid foundation for a scalable, maintainable, and secure AI-powered SaaS platform.