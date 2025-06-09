# Smart Deployment Dashboard

A comprehensive web-based platform for AI-assisted code deployment with automatic framework detection, deployment guidance, and real-time monitoring.

## Features

### 🚀 Smart Code Analysis
- **Folder & Zip Upload**: Upload entire project folders or zip files
- **Automatic Framework Detection**: Detects React, Vue, Angular, Node.js, Python, Java, PHP frameworks
- **Dependency Analysis**: Extracts and analyzes project dependencies
- **Entry Point Detection**: Identifies main application files

### 🤖 AI-Powered Assistant
- **Local Analysis Engine**: No external API keys required
- **Deployment Recommendations**: Framework-specific deployment guidance
- **Configuration Generation**: Automatic .replit, .env, and config file creation
- **Real-time Chat Support**: Interactive deployment assistance

### 📊 Deployment Management
- **Multi-Target Support**: Deploy to Replit, VPS, Docker containers
- **Real-time Monitoring**: Live deployment status and logs
- **Progress Tracking**: Step-by-step deployment progress
- **Error Analysis**: Intelligent error detection and solutions

### 🔐 Security & Authentication
- **Replit Auth Integration**: Seamless authentication with Replit accounts
- **Session Management**: Secure user sessions with PostgreSQL storage
- **Project Isolation**: User-specific project and deployment management

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Shadcn/UI** component library
- **Wouter** for routing
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database with Drizzle ORM
- **Passport.js** for authentication
- **Multer** for file uploads

### Deployment
- **Replit** compatible configuration
- **Vite** development server
- **Environment-based configuration**

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL database
- Replit account (for authentication)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Database (automatically configured on Replit)
   DATABASE_URL=postgresql://...
   
   # Session security
   SESSION_SECRET=your-session-secret
   
   # Replit domains (automatically set)
   REPLIT_DOMAINS=your-replit-domain.replit.app
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
│   └── index.html
├── server/                # Backend Express server
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   ├── openai.ts          # Local AI analysis engine
│   ├── fileStorage.ts     # File handling utilities
│   └── replitAuth.ts      # Authentication setup
├── shared/                # Shared TypeScript types
│   └── schema.ts          # Database schema & types
└── uploads/               # Temporary file storage
```

## API Endpoints

### Authentication
- `GET /api/login` - Initiate login flow
- `GET /api/logout` - User logout
- `GET /api/auth/user` - Get current user

### Projects
- `POST /api/projects` - Upload and create project
- `GET /api/projects` - List user projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects/:id/analyze` - Trigger project analysis

### Deployments
- `POST /api/deployments` - Create new deployment
- `GET /api/deployments` - List user deployments
- `GET /api/deployments/:id` - Get deployment details

### Chat Assistant
- `POST /api/chat` - Send message to AI assistant
- `GET /api/chat` - Get chat history

### Statistics
- `GET /api/stats` - Get user deployment statistics

## Supported Frameworks

### Frontend Frameworks
- React (Create React App, Vite, Next.js)
- Vue.js (Vue CLI, Vite, Nuxt.js)
- Angular (Angular CLI)
- Svelte/SvelteKit

### Backend Frameworks
- Node.js (Express, Fastify, Koa)
- Python (FastAPI, Django, Flask)
- Java (Spring Boot)
- PHP (Laravel)

### Build Tools
- Vite, Webpack, Parcel
- npm, yarn, pnpm
- Maven, Gradle
- Composer

## Deployment Guides

### Replit Deployment
1. Upload your project folder or zip file
2. Framework detection runs automatically
3. Generated `.replit` configuration file
4. One-click deployment to Replit

### VPS Deployment
1. Analysis generates deployment scripts
2. SSH connection setup guidance
3. Environment configuration
4. Process management (PM2, systemd)

### Docker Deployment
1. Automatic Dockerfile generation
2. Multi-stage build optimization
3. Container orchestration setup
4. Environment variable management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Check the AI assistant in the application
- Review deployment logs and error messages
- Consult framework-specific documentation