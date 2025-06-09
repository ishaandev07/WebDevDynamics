# Smart Deployment Dashboard - Technical Administrator Guide

## System Architecture Overview

The Smart Deployment Dashboard is a full-stack TypeScript application built with modern web technologies, designed for scalable deployment automation and project analysis.

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit OpenID Connect
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query (React Query v5)
- **File Processing**: Node.js file system + shell commands
- **AI Integration**: Rule-based analysis engine (OpenAI-compatible interface)

### Project Structure
```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── layout/        # Navigation, sidebar, chat
│   │   │   ├── projects/      # Project management components
│   │   │   ├── deployments/   # Deployment monitoring components
│   │   │   └── stats/         # Dashboard statistics
│   │   ├── pages/             # Route-level page components
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utility functions and configurations
│   │   └── App.tsx            # Main application component
│   └── index.html             # HTML entry point
├── server/                     # Backend Express application
│   ├── index.ts               # Main server entry point
│   ├── routes.ts              # API route definitions
│   ├── storage.ts             # Database abstraction layer
│   ├── db.ts                  # Database connection setup
│   ├── replitAuth.ts          # Authentication middleware
│   ├── deploymentEngine.ts    # Deployment orchestration
│   ├── fileStorage.ts         # File handling utilities
│   ├── openai.ts              # AI analysis engine
│   └── vite.ts                # Development server integration
├── shared/                     # Shared type definitions
│   └── schema.ts              # Database schema and types
├── uploads/                    # File upload storage directory
├── deployments/               # Deployment working directories
└── Documentation files
```

## Database Architecture

### Schema Design (shared/schema.ts)

#### Sessions Table
```typescript
export const sessions = pgTable("sessions", {
  sid: varchar("sid").primaryKey(),
  sess: jsonb("sess").notNull(),
  expire: timestamp("expire").notNull(),
});
```
- Stores user session data for Replit authentication
- Required for secure session management
- Automatically managed by connect-pg-simple

#### Users Table
```typescript
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```
- Stores user profile information from Replit OAuth
- Uses Replit user ID as primary key
- Automatically updated via upsert on login

#### Projects Table
```typescript
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: varchar("name").notNull(),
  description: text("description"),
  fileName: varchar("file_name").notNull(),
  fileSize: integer("file_size").notNull(),
  status: varchar("status").notNull().default("uploaded"),
  framework: varchar("framework"),
  buildCommand: text("build_command"),
  startCommand: text("start_command"),
  environmentVariables: text("environment_variables"),
  analysisResult: text("analysis_result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```
- Central project management with analysis results
- Status tracking: uploaded → analyzing → analyzed → failed
- JSON-serialized analysis results in analysisResult field

#### Deployments Table
```typescript
export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull().references(() => projects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  status: varchar("status").notNull().default("pending"),
  targetServer: varchar("target_server").notNull().default("replit"),
  deploymentUrl: varchar("deployment_url"),
  errorMessage: text("error_message"),
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```
- Tracks individual deployment attempts
- Real-time status updates and log storage
- Deployment URL storage for successful deployments

#### Chat Messages Table
```typescript
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  projectId: integer("project_id").references(() => projects.id),
  role: varchar("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
```
- AI assistant conversation history
- Project-specific and global chat contexts
- Role-based message threading (user/assistant)

### Database Operations (server/storage.ts)

#### Interface Design
```typescript
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: number): Promise<Project | undefined>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Deployment operations
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeployment(id: number): Promise<Deployment | undefined>;
  getDeploymentsByUser(userId: string): Promise<Deployment[]>;
  getDeploymentsByProject(projectId: number): Promise<Deployment[]>;
  updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined>;
  
  // Chat operations
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(userId: string, projectId?: number): Promise<ChatMessage[]>;
  
  // Statistics
  getUserStats(userId: string): Promise<Stats>;
}
```

#### Database Connection (server/db.ts)
```typescript
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";

neonConfig.webSocketConstructor = ws;
export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
```

## Authentication System (server/replitAuth.ts)

### OpenID Connect Integration
```typescript
export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();
  // Configure Replit OAuth strategy for each domain
  for (const domain of process.env.REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy({
      name: `replitauth:${domain}`,
      config,
      scope: "openid email profile offline_access",
      callbackURL: `https://${domain}/api/callback`,
    }, verify);
    passport.use(strategy);
  }
}
```

### Session Management
```typescript
export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: true, maxAge: sessionTtl },
  });
}
```

### Authentication Middleware
```typescript
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Token refresh logic for expired tokens
  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  // Automatic token refresh
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
```

## File Processing System (server/fileStorage.ts)

### File Upload Handling
```typescript
export class FileStorageService {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDir();
  }

  async saveUploadedFile(fileName: string, buffer: Buffer): Promise<string> {
    const filePath = path.join(this.uploadsDir, fileName);
    await fs.promises.writeFile(filePath, buffer);
    return fileName;
  }
}
```

### ZIP File Extraction
```typescript
async extractZipContents(fileName: string): Promise<FileInfo[]> {
  const filePath = path.join(this.uploadsDir, fileName);
  const extractDir = path.join(this.uploadsDir, fileName.replace('.zip', '_extracted'));

  try {
    await fs.promises.mkdir(extractDir, { recursive: true });
    await fs.promises.access(filePath, fs.constants.R_OK);
    
    // Extract using system unzip command
    await execAsync(`unzip -q "${filePath}" -d "${extractDir}"`);
    
    // Read and process extracted files
    const files = await this.readDirectoryFiles(extractDir);
    await this.removeDirectory(extractDir);
    
    return files;
  } catch (error: any) {
    throw new Error(`Failed to extract zip file: ${error.message}`);
  }
}
```

### File Type Detection
```typescript
private isTextFile(fileName: string): boolean {
  const textExtensions = [
    '.js', '.ts', '.jsx', '.tsx', '.json', '.html', '.css', '.scss',
    '.py', '.java', '.cpp', '.c', '.h', '.php', '.rb', '.go',
    '.md', '.txt', '.yml', '.yaml', '.xml', '.sql', '.sh'
  ];
  
  return textExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}
```

## AI Analysis Engine (server/openai.ts)

### Framework Detection Algorithm
```typescript
private detectFramework(files: Array<{ name: string; content: string }>): { framework: string; confidence: number } {
  const indicators = {
    'React': { patterns: ['react', 'jsx', 'tsx'], files: ['package.json'], weight: 0.3 },
    'Vue.js': { patterns: ['vue', '@vue'], files: ['package.json'], weight: 0.3 },
    'Angular': { patterns: ['@angular', 'ng '], files: ['angular.json'], weight: 0.4 },
    'Next.js': { patterns: ['next'], files: ['next.config'], weight: 0.4 },
    'Express.js': { patterns: ['express'], files: ['package.json'], weight: 0.3 },
    'FastAPI': { patterns: ['fastapi', 'uvicorn'], files: ['main.py', 'requirements.txt'], weight: 0.4 },
    'Spring Boot': { patterns: ['spring-boot'], files: ['pom.xml', 'build.gradle'], weight: 0.4 },
    'Python': { patterns: ['python'], files: ['requirements.txt', 'setup.py'], weight: 0.2 }
  };

  let bestMatch = { framework: 'Unknown', confidence: 0 };

  for (const [framework, config] of Object.entries(indicators)) {
    let score = 0;
    let totalWeight = 0;

    // Check for framework-specific files
    for (const requiredFile of config.files) {
      if (files.some(f => f.name.includes(requiredFile))) {
        score += config.weight;
      }
      totalWeight += config.weight;
    }

    // Check for patterns in file contents
    for (const pattern of config.patterns) {
      const patternCount = files.reduce((count, file) => {
        return count + (file.content.toLowerCase().includes(pattern.toLowerCase()) ? 1 : 0);
      }, 0);
      
      if (patternCount > 0) {
        score += Math.min(patternCount * 0.1, 0.3);
        totalWeight += 0.3;
      }
    }

    const confidence = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
    
    if (confidence > bestMatch.confidence) {
      bestMatch = { framework, confidence };
    }
  }

  return bestMatch;
}
```

### Command Generation
```typescript
private generateCommands(framework: string): { buildCommand?: string; startCommand: string } {
  const commandMap: Record<string, { buildCommand?: string; startCommand: string }> = {
    'React': { buildCommand: 'npm run build', startCommand: 'npm start' },
    'Next.js': { buildCommand: 'npm run build', startCommand: 'npm run start' },
    'Vue.js': { buildCommand: 'npm run build', startCommand: 'npm run serve' },
    'Angular': { buildCommand: 'npm run build', startCommand: 'npm start' },
    'Express.js': { startCommand: 'node index.js' },
    'FastAPI': { startCommand: 'uvicorn main:app --host 0.0.0.0 --port $PORT' },
    'Python': { startCommand: 'python main.py' },
    'Spring Boot': { buildCommand: 'mvn clean package', startCommand: 'java -jar target/*.jar' }
  };

  return commandMap[framework] || { startCommand: 'npm start' };
}
```

## Deployment Engine (server/deploymentEngine.ts)

### Deployment Configuration Generation
```typescript
async generateDeploymentConfig(projectId: number): Promise<DeploymentConfig> {
  const project = await storage.getProject(projectId);
  if (!project) throw new Error('Project not found');

  const analysis = project.analysisResult 
    ? JSON.parse(project.analysisResult) 
    : null;

  const config: DeploymentConfig = {
    framework: analysis?.framework || 'Unknown',
    buildCommand: analysis?.buildCommand,
    startCommand: analysis?.startCommand || 'npm start',
    environmentVariables: this.getFrameworkEnvVars(analysis?.framework || 'Unknown'),
    port: analysis?.port || 8080,
    replitConfig: this.generateReplitConfig(analysis)
  };

  return config;
}
```

### File Preparation Process
```typescript
private async prepareProjectFiles(deploymentPath: string, project: any): Promise<void> {
  try {
    // Verify project file exists
    const projectFilePath = fileStorage.getFilePath(project.fileName);
    await fs.access(projectFilePath);
    
    // Extract and organize files
    const files = await fileStorage.extractZipContents(project.fileName);
    
    for (const file of files) {
      const filePath = path.join(deploymentPath, file.name);
      const fileDir = path.dirname(filePath);
      
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content);
    }
  } catch (error) {
    throw new Error(`Failed to prepare project files: ${error.message}`);
  }
}
```

### Configuration File Generation
```typescript
private async generateReplitFile(deploymentPath: string, config: DeploymentConfig): Promise<void> {
  const replitConfig = `
language = "${config.replitConfig?.language || 'nodejs'}"
run = "${config.startCommand}"
entrypoint = "${config.replitConfig?.entrypoint || 'index.js'}"
hidden = [".config", "node_modules", ".git", "uploads", "deployments"]

[env]
${Object.entries(config.environmentVariables)
  .map(([key, value]) => `${key} = "${value}"`)
  .join('\n')}
`.trim();

  await fs.writeFile(path.join(deploymentPath, '.replit'), replitConfig);
}
```

## API Routes Architecture (server/routes.ts)

### Route Organization
```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication setup
  await setupAuth(app);

  // Authentication routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    const userId = req.user.claims.sub;
    const user = await storage.getUser(userId);
    res.json(user);
  });

  // Project management routes
  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    const projects = await storage.getProjectsByUser(req.user.claims.sub);
    res.json(projects);
  });

  app.post('/api/projects', isAuthenticated, upload.single('file'), async (req: any, res) => {
    // File upload and project creation logic
  });

  // Deployment routes
  app.post('/api/deployments', isAuthenticated, async (req: any, res) => {
    // Deployment initiation logic
  });

  app.get('/api/deployments/:id/logs', isAuthenticated, async (req, res) => {
    // Real-time log retrieval
  });
}
```

### Async Task Handling
```typescript
async function analyzeProjectAsync(projectId: number, folderFiles?: any[]) {
  try {
    await storage.updateProject(projectId, { status: 'analyzing' });
    
    let files;
    if (folderFiles) {
      files = folderFiles;
    } else {
      const project = await storage.getProject(projectId);
      files = await fileStorage.extractZipContents(project!.fileName);
    }

    const analysis = await aiAssistant.analyzeProject(files);
    
    await storage.updateProject(projectId, {
      status: 'analyzed',
      framework: analysis.framework,
      buildCommand: analysis.buildCommand,
      startCommand: analysis.startCommand,
      analysisResult: JSON.stringify(analysis)
    });
  } catch (error) {
    await storage.updateProject(projectId, { 
      status: 'failed',
      analysisResult: JSON.stringify({ error: error.message })
    });
  }
}
```

## Frontend Architecture

### State Management (TanStack Query)
```typescript
// Query client configuration (client/src/lib/queryClient.ts)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error as Error)) return false;
        return failureCount < 3;
      },
    },
  },
});

// API request wrapper
export async function apiRequest(
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  url: string,
  body?: any
): Promise<any> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });

  await throwIfResNotOk(response);
  return response.json();
}
```

### Component Architecture
```typescript
// Example: Project List Component
export default function ProjectList() {
  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/projects/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: "Project deleted successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        // Handle authentication errors
        window.location.href = "/api/login";
        return;
      }
      toast({ title: "Failed to delete project", variant: "destructive" });
    },
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(project => (
        <ProjectCard 
          key={project.id} 
          project={project} 
          onDelete={() => deleteMutation.mutate(project.id)}
        />
      ))}
    </div>
  );
}
```

### Authentication Integration
```typescript
// Authentication hook (client/src/hooks/useAuth.ts)
export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

// Route protection
function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/upload" component={Upload} />
          <Route path="/projects/:id" component={ProjectDetails} />
          <Route path="/deployments" component={Deployments} />
          <Route path="/settings" component={Settings} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}
```

## Development and Deployment

### Environment Configuration
```bash
# Required Environment Variables
DATABASE_URL=postgresql://user:password@host:port/database
SESSION_SECRET=your-session-secret-key
REPLIT_DOMAINS=your-domain.replit.app
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc

# Optional Environment Variables
OPENAI_API_KEY=your-openai-api-key  # For enhanced AI features
NODE_ENV=development|production
PORT=5000
```

### Database Migrations
```bash
# Push schema changes to database
npm run db:push

# Generate migration files (when needed)
npm run db:generate

# View database schema
npm run db:studio
```

### Development Workflow
```bash
# Start development server
npm run dev

# Run type checking
npm run type-check

# Build for production
npm run build

# Start production server
npm start
```

### System Dependencies
```bash
# Required system packages
unzip          # For ZIP file extraction
nodejs-20      # Node.js runtime
postgresql     # Database server
```

## Performance Optimization

### Database Optimization
- Indexed foreign keys for fast joins
- Query optimization with select projections
- Connection pooling for concurrent requests
- Session storage optimization

### File Processing Optimization
- Streaming file uploads for large projects
- Parallel file processing during analysis
- Temporary file cleanup automation
- Memory-efficient file reading

### Frontend Optimization
- Code splitting with React.lazy
- Image optimization and compression
- Bundle size analysis and optimization
- Efficient re-rendering with React Query

## Security Considerations

### Authentication Security
- Secure session management with httpOnly cookies
- CSRF protection via SameSite cookie attributes
- Token refresh automation
- Secure OAuth integration

### File Upload Security
- File type validation and sanitization
- Size limits and resource protection
- Sandboxed file extraction
- Path traversal prevention

### API Security
- Request rate limiting
- Input validation with Zod schemas
- SQL injection prevention with parameterized queries
- Error message sanitization

## Monitoring and Logging

### Application Logging
```typescript
// Structured logging implementation
export function log(message: string, source = "express") {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${timestamp} [${source}] ${message}`);
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log(`${req.method} ${req.path} ${res.statusCode} in ${duration}ms`);
  });
  next();
});
```

### Error Handling
```typescript
// Global error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ message: 'Invalid CSRF token' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(statusCode).json({ message });
});
```

## Troubleshooting Guide

### Common Issues

#### Database Connection Issues
```bash
# Check database connectivity
psql $DATABASE_URL -c "SELECT 1;"

# Verify environment variables
echo $DATABASE_URL
echo $SESSION_SECRET
```

#### File Processing Errors
```bash
# Check system dependencies
which unzip
unzip -v

# Verify upload directory permissions
ls -la uploads/
mkdir -p uploads && chmod 755 uploads
```

#### Authentication Problems
```bash
# Verify Replit configuration
echo $REPL_ID
echo $REPLIT_DOMAINS
echo $ISSUER_URL
```

### Log Analysis
- Monitor Express request logs for API issues
- Check deployment logs for build failures
- Review file extraction logs for upload problems
- Analyze authentication logs for login issues

### Performance Monitoring
- Database query performance analysis
- File upload/processing time tracking
- Memory usage monitoring during large deployments
- Frontend loading time optimization

This comprehensive technical guide covers all aspects of the Smart Deployment Dashboard system, from architecture and implementation details to deployment and maintenance procedures. Use this documentation for system administration, development, and troubleshooting.