import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiAssistant } from "./openai";
import { fileStorage } from "./fileStorage";
import { deploymentEngine } from "./deploymentEngine";
import { insertProjectSchema, insertDeploymentSchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup file upload middleware
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB limit
    },
  }).fields([
    { name: 'file', maxCount: 1 },
    { name: 'files', maxCount: 1000 }
  ]);

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.post('/api/projects', isAuthenticated, upload, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, description, uploadType, paths } = req.body;
      
      if (!name) {
        return res.status(400).json({ message: "Project name is required" });
      }

      let fileName, fileSize, files = [];

      if (uploadType === 'zip' && req.files?.file?.[0]) {
        // Handle ZIP file upload
        const zipFile = req.files.file[0];
        fileName = await fileStorage.saveUploadedFile(zipFile.originalname, zipFile.buffer);
        fileSize = zipFile.size;
      } else if (uploadType === 'folder' && req.files?.files) {
        // Handle folder upload - create files array with paths
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
        
        fileName = `folder-${Date.now()}`;
        fileSize = files.reduce((acc, file) => acc + file.size, 0);
      } else {
        return res.status(400).json({ message: "No files uploaded" });
      }

      // Create project record
      const projectData = insertProjectSchema.parse({
        userId,
        name,
        description: description || '',
        fileName: uploadType === 'zip' ? req.files.file[0].originalname : `${name}-folder`,
        filePath: fileName,
        fileSize: fileSize,
        status: 'uploaded'
      });

      const project = await storage.createProject(projectData);

      // Start analysis in background
      analyzeProjectAsync(project.id, files);

      res.json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.get('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projects = await storage.getProjectsByUser(userId);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  app.get('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      // Check if user owns the project
      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Deployment routes
  app.post('/api/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deploymentData = insertDeploymentSchema.parse({
        ...req.body,
        userId
      });

      const deployment = await storage.createDeployment(deploymentData);

      // Start deployment process in background
      startDeploymentAsync(deployment.id);

      res.json(deployment);
    } catch (error) {
      console.error("Error creating deployment:", error);
      res.status(500).json({ message: "Failed to create deployment" });
    }
  });

  app.get('/api/deployments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const deployments = await storage.getDeploymentsByUser(userId);
      res.json(deployments);
    } catch (error) {
      console.error("Error fetching deployments:", error);
      res.status(500).json({ message: "Failed to fetch deployments" });
    }
  });

  app.get('/api/deployments/:id', isAuthenticated, async (req: any, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      // Check if user owns the deployment
      if (deployment.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(deployment);
    } catch (error) {
      console.error("Error fetching deployment:", error);
      res.status(500).json({ message: "Failed to fetch deployment" });
    }
  });

  // Chat routes
  app.post('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { message, projectId } = req.body;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      // Save user message
      await storage.createChatMessage({
        userId,
        projectId: projectId || null,
        role: 'user',
        content: message
      });

      // Get context if projectId is provided
      let context = {};
      if (projectId) {
        const project = await storage.getProject(projectId);
        if (project && project.userId === userId) {
          const deployments = await storage.getDeploymentsByProject(projectId);
          context = { project, deployments };
        }
      }

      // Get AI response
      const aiResponse = await aiAssistant.chatWithAssistant(message, context);

      // Save AI response
      const assistantMessage = await storage.createChatMessage({
        userId,
        projectId: projectId || null,
        role: 'assistant',
        content: aiResponse
      });

      res.json({ message: assistantMessage });
    } catch (error) {
      console.error("Error in chat:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  app.get('/api/chat', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      const messages = await storage.getChatMessages(userId, projectId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  // Stats route
  app.get('/api/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Analysis route
  app.post('/api/projects/:id/analyze', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Trigger analysis
      await analyzeProjectAsync(projectId);
      
      res.json({ message: "Analysis started" });
    } catch (error) {
      console.error("Error starting analysis:", error);
      res.status(500).json({ message: "Failed to start analysis" });
    }
  });

  // Deployment guidance route
  app.get('/api/projects/:id/deployment-guide', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const guide = await deploymentEngine.generateDeploymentGuidance(projectId);
      res.json({ guide });
    } catch (error) {
      console.error("Error generating deployment guide:", error);
      res.status(500).json({ message: "Failed to generate deployment guide" });
    }
  });

  // Deployment retry route
  app.post('/api/deployments/:id/retry', isAuthenticated, async (req: any, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      if (deployment.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      await deploymentEngine.retryDeployment(deploymentId);
      startDeploymentAsync(deploymentId);
      
      res.json({ message: "Deployment retry started" });
    } catch (error) {
      console.error("Error retrying deployment:", error);
      res.status(500).json({ message: "Failed to retry deployment" });
    }
  });

  // Deployment logs route
  app.get('/api/deployments/:id/logs', isAuthenticated, async (req: any, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).json({ message: "Deployment not found" });
      }

      if (deployment.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }

      const logs = await deploymentEngine.getDeploymentLogs(deploymentId);
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching deployment logs:", error);
      res.status(500).json({ message: "Failed to fetch deployment logs" });
    }
  });

  // Add deployment preview route for demonstration  
  app.get('/deployed/:id', async (req, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).send('Deployment not found');
      }

      const project = await storage.getProject(deployment.projectId);
      if (!project) {
        return res.status(404).send('Project not found');
      }

      // Get actual project files and serve them
      const files = await fileStorage.extractZipContents(project.fileName);
      
      if (files.length === 0) {
        return res.status(404).send('No project files found');
      }

      // Find the main file (index.html, app.js, main.py, etc.)
      const indexFile = files.find(f => 
        f.name.toLowerCase() === 'index.html' || 
        f.name.toLowerCase() === 'app.html' ||
        f.name.toLowerCase() === 'home.html'
      );

      if (indexFile) {
        // If HTML file exists, serve it directly
        res.setHeader('Content-Type', 'text/html');
        return res.send(indexFile.content);
      }

      // Otherwise, create a file browser interface
      const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Project Files</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace; 
            background: #0d1117; color: #c9d1d9; 
            line-height: 1.6; padding: 20px; min-height: 100vh;
        }
        .header { 
            background: #161b22; padding: 24px; border-radius: 8px; margin-bottom: 24px;
            border: 1px solid #30363d; box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        .project-title { 
            font-size: 2rem; color: #58a6ff; margin-bottom: 8px; 
            display: flex; align-items: center; gap: 12px;
        }
        .project-info { color: #7c3aed; font-size: 14px; margin-bottom: 16px; }
        .nav-btn { 
            background: #238636; color: white; padding: 8px 16px; 
            border: none; border-radius: 6px; cursor: pointer; margin-right: 8px;
            transition: background 0.2s ease;
        }
        .nav-btn:hover { background: #2ea043; }
        .file-list { 
            background: #161b22; padding: 24px; border-radius: 8px; margin-bottom: 24px;
            border: 1px solid #30363d;
        }
        .file-list h3 { color: #f0f6fc; margin-bottom: 16px; font-size: 18px; }
        .file-item { 
            padding: 12px 16px; border-bottom: 1px solid #21262d; cursor: pointer;
            transition: background 0.2s ease; border-radius: 6px; margin-bottom: 4px;
            display: flex; justify-content: space-between; align-items: center;
        }
        .file-item:hover { background: #21262d; }
        .file-item:last-child { border-bottom: none; }
        .file-name { color: #58a6ff; font-weight: 500; }
        .file-size { color: #7d8590; font-size: 12px; }
        .file-content { 
            background: #0d1117; padding: 24px; border-radius: 8px; margin-top: 24px;
            white-space: pre-wrap; font-size: 14px; max-height: 600px; overflow-y: auto;
            border: 1px solid #30363d; font-family: 'Monaco', 'Menlo', monospace;
        }
        .file-viewer { 
            background: #161b22; padding: 24px; border-radius: 8px;
            border: 1px solid #30363d;
        }
        .file-viewer h3 { color: #f0f6fc; margin-bottom: 16px; }
        .hidden { display: none; }
        .file-extension { 
            background: #1f2937; color: #9ca3af; padding: 2px 6px; 
            border-radius: 4px; font-size: 11px; margin-left: 8px;
        }
        .deploy-info { 
            background: linear-gradient(45deg, rgba(76, 175, 80, 0.1), rgba(33, 150, 243, 0.1));
            padding: 20px; border-radius: 10px; margin: 20px 0;
            border: 1px solid rgba(76, 175, 80, 0.3);
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="project-title">📁 ${project.name}</div>
        <div class="project-info">Framework: ${project.framework || 'Unknown'} • Files: ${files.length} • Status: Deployed</div>
        <button class="nav-btn" onclick="window.close()">← Back to Dashboard</button>
    </div>

    <div class="file-list">
        <h3>Project Files:</h3>
        ${files.map((file, index) => `
        <div class="file-item" onclick="showFile(${index})">
            <div>
                <div class="file-name">${file.name}</div>
                <span class="file-extension">${file.name.split('.').pop()?.toUpperCase() || 'FILE'}</span>
            </div>
            <div class="file-size">${(file.size / 1024).toFixed(1)} KB</div>
        </div>
        `).join('')}
    </div>

    <div id="file-viewer" class="file-viewer hidden">
        <h3>File Content:</h3>
        <div id="file-content" class="file-content"></div>
    </div>

    <script>
        const files = ${JSON.stringify(files)};
        
        function showFile(index) {
            const file = files[index];
            const viewer = document.getElementById('file-viewer');
            const content = document.getElementById('file-content');
            
            content.textContent = file.content;
            viewer.classList.remove('hidden');
            
            // Scroll to viewer
            viewer.scrollIntoView({ behavior: 'smooth' });
        }
    </script>
</body>
</html>`;

      res.send(html);
    } catch (error) {
      console.error('Error serving deployment preview:', error);
      res.status(500).send('Error loading deployment');
    }
  });

  // Health check for deployed applications
  app.get('/api/deployment/:id/health', async (req, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).json({ error: 'Deployment not found' });
      }

      const project = await storage.getProject(deployment.projectId);
      
      res.json({
        status: 'OK',
        deployment: {
          id: deploymentId,
          status: deployment.status,
          project: project?.name,
          framework: project?.framework,
          deployed_at: deployment.createdAt,
          uptime: Math.floor((Date.now() - new Date(deployment.createdAt || Date.now()).getTime()) / 1000),
        },
        server: {
          timestamp: new Date().toISOString(),
          environment: 'production',
          version: '1.0.0'
        }
      });
    } catch (error) {
      console.error('Error in deployment health check:', error);
      res.status(500).json({ error: 'Health check failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Background analysis function
async function analyzeProjectAsync(projectId: number, folderFiles?: any[]) {
  try {
    const project = await storage.getProject(projectId);
    if (!project) return;

    // Update status to analyzing
    await storage.updateProject(projectId, { status: 'analyzing' });

    let files;
    
    if (folderFiles && folderFiles.length > 0) {
      // Use provided folder files
      files = folderFiles.map(f => ({
        name: f.name,
        content: f.content,
        size: f.size
      }));
    } else {
      // Extract files from the uploaded zip
      files = await fileStorage.extractZipContents(project.filePath);
    }

    const analysis = await aiAssistant.analyzeProject(files);

    // Update project with analysis results
    await storage.updateProject(projectId, {
      status: 'analyzed',
      framework: analysis.framework,
      analysisResult: analysis
    });

  } catch (error) {
    console.error(`Analysis failed for project ${projectId}:`, error);
    await storage.updateProject(projectId, { 
      status: 'failed',
      analysisResult: { error: (error as Error).message }
    });
  }
}

// Background deployment function
async function startDeploymentAsync(deploymentId: number) {
  try {
    const deployment = await storage.getDeployment(deploymentId);
    if (!deployment) return;

    // Update status to building
    await storage.updateDeployment(deploymentId, { 
      status: 'building',
      logs: 'Starting deployment process...\n'
    });

    // Get project details
    const project = await storage.getProject(deployment.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Use deployment engine for complete deployment process
    await deploymentEngine.createDeploymentFiles(deploymentId);
    await deploymentEngine.simulateDeployment(deploymentId);

  } catch (error) {
    console.error(`Deployment failed for deployment ${deploymentId}:`, error);
    const currentDeployment = await storage.getDeployment(deploymentId);
    await storage.updateDeployment(deploymentId, { 
      status: 'failed',
      errorMessage: (error as Error).message,
      logs: (currentDeployment?.logs || '') + `Error: ${(error as Error).message}\n`
    });
  }
}
