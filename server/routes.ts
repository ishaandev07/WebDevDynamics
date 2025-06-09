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

    // Simulate deployment process (in real implementation, this would deploy to actual servers)
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate build time

    await storage.updateDeployment(deploymentId, { 
      status: 'deploying',
      logs: deployment.logs + 'Build completed. Deploying to server...\n'
    });

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate deploy time

    // For demo purposes, randomly succeed or fail
    const success = Math.random() > 0.3; // 70% success rate

    // Use deployment engine for realistic deployment simulation
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
