# Backend Code Architecture Tutorial

## System Architecture Overview

The backend follows a layered architecture pattern with clear separation of concerns:

```
┌─────────────────┐
│   Client Layer  │ (React Frontend)
├─────────────────┤
│   API Layer     │ (Express Routes)
├─────────────────┤
│ Business Logic  │ (AI Assistant, File Processing)
├─────────────────┤
│ Storage Layer   │ (Database & File Storage)
└─────────────────┘
```

## Core Components Deep Dive

### 1. Server Entry Point (`server/index.ts`)

```typescript
import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";

const app = express();

// Middleware setup
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Route registration and server startup
async function startServer() {
  const server = await registerRoutes(app);
  
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }
  
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

**Key Design Decisions:**
- Single entry point for both development and production
- Automatic Vite integration for development
- Static file serving for production builds
- Large payload support for file uploads

### 2. Authentication System (`server/replitAuth.ts`)

```typescript
export async function setupAuth(app: Express) {
  // Session configuration with PostgreSQL store
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Dynamic strategy registration for multiple domains
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

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Token refresh logic for expired sessions
  if (now > user.expires_at && user.refresh_token) {
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
  }
  next();
};
```

**Key Features:**
- OpenID Connect integration with Replit
- Automatic token refresh
- Multi-domain support
- Secure session management with PostgreSQL

### 3. Database Layer (`server/storage.ts`)

```typescript
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProjectsByUser(userId: string): Promise<Project[]>;
  updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined>;
  
  // Deployment operations
  createDeployment(deployment: InsertDeployment): Promise<Deployment>;
  getDeploymentsByUser(userId: string): Promise<Deployment[]>;
  updateDeployment(id: number, updates: Partial<Deployment>): Promise<Deployment | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createProject(project: InsertProject): Promise<Project> {
    const [createdProject] = await db
      .insert(projects)
      .values(project)
      .returning();
    return createdProject;
  }
  
  async updateProject(id: number, updates: Partial<Project>): Promise<Project | undefined> {
    const [updatedProject] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updatedProject;
  }
}
```

**Key Design Patterns:**
- Interface segregation for testability
- Repository pattern implementation
- Type-safe database operations with Drizzle ORM
- Automatic timestamp management

### 4. File Processing System (`server/fileStorage.ts`)

```typescript
export class FileStorageService {
  async saveUploadedFile(fileName: string, buffer: Buffer): Promise<string> {
    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = path.join(this.uploadsDir, safeFileName);
    
    await fs.writeFile(filePath, buffer);
    return safeFileName;
  }

  async extractZipContents(fileName: string): Promise<FileInfo[]> {
    const zipPath = this.getFilePath(fileName);
    const extractPath = path.join(this.uploadsDir, `extracted-${Date.now()}`);
    
    // Extract ZIP file
    await extract(zipPath, { dir: extractPath });
    
    // Read all files recursively
    const files = await this.readDirectoryFiles(extractPath);
    
    // Cleanup extracted directory
    await this.removeDirectory(extractPath);
    
    return files;
  }
}
```

**Key Features:**
- Safe file name sanitization
- ZIP extraction with cleanup
- Recursive directory reading
- Binary and text file detection
- Automatic temporary file cleanup

### 5. AI Analysis Engine (`server/openai.ts`)

```typescript
export class AIAssistant {
  private detectFramework(files: Array<{ name: string; content: string }>): 
    { framework: string; confidence: number } {
    
    const packageJson = files.find(f => f.name.toLowerCase().includes('package.json'));
    if (packageJson?.content.includes('"react"')) {
      return { framework: 'React', confidence: 0.9 };
    }
    
    const requirementsTxt = files.find(f => f.name.toLowerCase().includes('requirements.txt'));
    if (requirementsTxt?.content.includes('fastapi')) {
      return { framework: 'FastAPI', confidence: 0.9 };
    }
    
    return { framework: 'Unknown', confidence: 0.1 };
  }

  async analyzeProject(files: Array<{ name: string; content: string }>): 
    Promise<ProjectAnalysis> {
    
    const { framework, confidence } = this.detectFramework(files);
    const dependencies = this.extractDependencies(files);
    const entryPoint = this.findEntryPoint(files, framework);
    const { buildCommand, startCommand } = this.generateCommands(framework);
    
    return {
      framework,
      dependencies,
      entryPoint,
      buildCommand,
      startCommand,
      port: 8080,
      environmentVariables: ['PORT', 'NODE_ENV'],
      issues: this.detectIssues(files, framework),
      recommendations: this.generateRecommendations(framework),
      confidence
    };
  }
}
```

**Analysis Capabilities:**
- Multi-language framework detection
- Dependency extraction from various file types
- Entry point identification
- Command generation for deployment
- Issue detection and recommendations

### 6. API Routes Architecture (`server/routes.ts`)

```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  // File upload configuration
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 100 * 1024 * 1024 }
  }).fields([
    { name: 'file', maxCount: 1 },      // ZIP files
    { name: 'files', maxCount: 1000 }   // Folder uploads
  ]);

  // Project creation with dual upload support
  app.post('/api/projects', isAuthenticated, upload, async (req: any, res) => {
    const { name, description, uploadType, paths } = req.body;
    
    let files = [];
    if (uploadType === 'zip' && req.files?.file?.[0]) {
      // Handle ZIP file upload
      const zipFile = req.files.file[0];
      fileName = await fileStorage.saveUploadedFile(zipFile.originalname, zipFile.buffer);
    } else if (uploadType === 'folder' && req.files?.files) {
      // Handle folder upload with path preservation
      const uploadedFiles = req.files.files;
      const pathsArray = Array.isArray(paths) ? paths : [paths];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const relativePath = pathsArray[i] || file.originalname;
        files.push({
          name: file.originalname,
          path: relativePath,
          content: file.buffer.toString('utf8'),
          size: file.size
        });
      }
    }
    
    // Start analysis in background
    analyzeProjectAsync(project.id, files);
  });
}
```

**Route Design Patterns:**
- Middleware chain for authentication and file upload
- Background processing for long-running tasks
- Type-safe request validation with Zod schemas
- Comprehensive error handling

### 7. Background Processing

```typescript
async function analyzeProjectAsync(projectId: number, folderFiles?: any[]) {
  try {
    await storage.updateProject(projectId, { status: 'analyzing' });
    
    let files;
    if (folderFiles && folderFiles.length > 0) {
      files = folderFiles.map(f => ({
        name: f.name,
        content: f.content,
        size: f.size
      }));
    } else {
      files = await fileStorage.extractZipContents(project.filePath);
    }
    
    const analysis = await aiAssistant.analyzeProject(files);
    
    await storage.updateProject(projectId, {
      status: 'analyzed',
      framework: analysis.framework,
      analysisResult: analysis
    });
    
  } catch (error) {
    await storage.updateProject(projectId, { 
      status: 'failed',
      analysisResult: { error: (error as Error).message }
    });
  }
}
```

**Background Processing Features:**
- Asynchronous analysis to prevent request timeouts
- Status tracking throughout the process
- Error handling with detailed logging
- Support for both ZIP and folder analysis

### 8. Database Schema (`shared/schema.ts`)

```typescript
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  fileName: varchar("file_name").notNull(),
  filePath: varchar("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  status: varchar("status").default("uploaded"),
  framework: varchar("framework"),
  buildCommand: varchar("build_command"),
  startCommand: varchar("start_command"),
  environmentVariables: varchar("environment_variables"),
  analysisResult: jsonb("analysis_result"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deployments = pgTable("deployments", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: varchar("user_id").notNull(),
  status: varchar("status").default("pending"),
  targetServer: varchar("target_server").notNull(),
  deploymentUrl: varchar("deployment_url"),
  errorMessage: text("error_message"),
  logs: text("logs"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

**Schema Design Principles:**
- Normalized data structure
- JSON fields for flexible analysis results
- Foreign key relationships with proper references
- Timestamp tracking for audit trails

## Request Flow Analysis

### 1. Project Upload Flow
```
Client Upload → Multer Middleware → Route Handler → File Storage → 
Background Analysis → Database Update → WebSocket Notification (future)
```

### 2. Authentication Flow
```
Client Request → Session Check → Token Validation → Token Refresh (if needed) → 
Route Handler → Database Query → Response
```

### 3. Chat Interaction Flow
```
User Message → Route Handler → Context Gathering → AI Analysis → 
Response Generation → Database Storage → Client Update
```

## Error Handling Strategy

### 1. Layered Error Handling
```typescript
// Route level
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Business logic level
try {
  const analysis = await aiAssistant.analyzeProject(files);
} catch (error) {
  console.error(`Analysis failed for project ${projectId}:`, error);
  await storage.updateProject(projectId, { 
    status: 'failed',
    analysisResult: { error: error.message }
  });
}

// Database level
async getProject(id: number): Promise<Project | undefined> {
  try {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch project');
  }
}
```

### 2. Client Error Communication
```typescript
if (isUnauthorizedError(error)) {
  toast({
    title: "Unauthorized",
    description: "You are logged out. Logging in again...",
    variant: "destructive",
  });
  setTimeout(() => {
    window.location.href = "/api/login";
  }, 500);
  return;
}
```

## Performance Optimizations

### 1. Database Query Optimization
```typescript
// Efficient user stats calculation
async getUserStats(userId: string): Promise<UserStats> {
  const [stats] = await db
    .select({
      totalProjects: count(projects.id),
      successfulDeployments: count(
        case().when(eq(deployments.status, 'deployed'), 1)
      ),
      failedDeployments: count(
        case().when(eq(deployments.status, 'failed'), 1)
      )
    })
    .from(projects)
    .leftJoin(deployments, eq(projects.id, deployments.projectId))
    .where(eq(projects.userId, userId));
  
  return stats;
}
```

### 2. File Processing Optimization
```typescript
// Streaming file processing for large uploads
private async readDirectoryFiles(dirPath: string, basePath = ''): Promise<FileInfo[]> {
  const files: FileInfo[] = [];
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    if (item.isFile() && this.isTextFile(item.name)) {
      const content = await fs.readFile(fullPath, 'utf8');
      files.push({
        name: item.name,
        content: content.slice(0, 50000), // Limit content size
        size: stats.size
      });
    }
  }
  
  return files;
}
```

## Security Implementations

### 1. File Upload Security
```typescript
// File type validation
private isTextFile(fileName: string): boolean {
  const textExtensions = ['.js', '.ts', '.json', '.py', '.java', '.cpp', '.md'];
  const ext = path.extname(fileName).toLowerCase();
  return textExtensions.includes(ext);
}

// File name sanitization
const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
```

### 2. SQL Injection Prevention
```typescript
// Parameterized queries with Drizzle ORM
const projects = await db
  .select()
  .from(projects)
  .where(eq(projects.userId, userId)); // Automatically parameterized
```

### 3. Session Security
```typescript
export function getSession() {
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}
```

This backend architecture provides a robust, scalable foundation for the Smart Deployment Dashboard with clear separation of concerns, comprehensive error handling, and security best practices.