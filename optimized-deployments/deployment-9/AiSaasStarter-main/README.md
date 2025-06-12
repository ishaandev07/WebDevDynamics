# AI-Powered SaaS Platform

A sophisticated React-based SaaS application with AI chat capabilities, CRM functionality, and advanced RAG (Retrieval-Augmented Generation) system.

## Features

- **AI Chat Interface** with feedback system and session ratings
- **Advanced RAG System** with 9200+ records and vector search
- **Customer Relationship Management (CRM)**
- **Quote Management System**
- **Product Management**
- **Marketplace Integration**
- **Dataset Upload & Management**
- **Comprehensive Settings Panel**
- **Real-time Dashboard with Metrics**

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- Shadcn/ui component library
- TanStack Query for data fetching
- Wouter for routing
- Framer Motion for animations

### Backend
- Node.js with Express
- TypeScript
- SQLite with Drizzle ORM
- Advanced vector search with TF-IDF
- Session management
- File upload support

### AI & Data
- Advanced RAG system with contextual responses
- Vector similarity search
- Customer support dataset (9200+ records)
- Feedback collection and analytics

## Quick Start

See [SETUP.md](./SETUP.md) for detailed local setup instructions.
See [DEPLOYMENT.md](./DEPLOYMENT.md) for server deployment guide.

## Project Structure

```
├── client/                 # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend application
│   ├── advanced-rag.ts    # RAG system implementation
│   ├── db.ts             # Database configuration
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data access layer
├── shared/               # Shared types and schemas
└── attached_assets/      # AI training data and datasets
```

## API Endpoints

### Chat System
- `POST /api/chat` - Send message to AI assistant
- `POST /api/chat/feedback` - Submit message feedback
- `POST /api/chat/session-feedback` - Submit session rating
- `GET /api/chat/feedback-stats` - Get feedback statistics

### CRM & Business
- `GET /api/customers` - List customers
- `POST /api/customers` - Create customer
- `GET /api/quotes` - List quotes
- `POST /api/quotes` - Create quote
- `GET /api/dashboard/metrics` - Dashboard statistics

### Data Management
- `POST /api/upload-dataset` - Upload custom dataset
- `GET /api/datasets` - List available datasets
- `GET /api/search` - Search knowledge base

## Environment Variables

```bash
NODE_ENV=development|production
PORT=5000
DATABASE_URL=file:./database.sqlite
SESSION_SECRET=your-secret-key
```

## License

MIT License - see LICENSE file for details.