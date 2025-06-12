import type { Express } from "express";
import { createServer, type Server } from "http";
import { promises as fs } from "fs";
import path from "path";
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
  }).single('file');

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
      const { name, description } = req.body;
      
      console.log('Upload request received:', { name, description, file: req.file ? 'present' : 'missing' });
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const uploadedFile = req.file;
      let fileName, fileSize, files = [];

      // Handle both ZIP and individual files
      if (uploadedFile.originalname.toLowerCase().endsWith('.zip') || 
          uploadedFile.originalname.toLowerCase().endsWith('.tar') || 
          uploadedFile.originalname.toLowerCase().endsWith('.gz')) {
        // Handle archive files (ZIP, TAR, etc.)
        try {
          fileName = await fileStorage.saveUploadedFile(uploadedFile.originalname, uploadedFile.buffer);
          fileSize = uploadedFile.size;
          
          // Try to extract the archive
          files = await fileStorage.extractZipContents(fileName);
          console.log(`Extracted ${files.length} files from archive`);
        } catch (extractError) {
          console.error('Error extracting archive:', extractError);
          // If extraction fails, treat as single file
          files = [{
            name: uploadedFile.originalname,
            content: uploadedFile.buffer.toString('utf8'),
            size: uploadedFile.size
          }];
        }
      } else {
        // Handle individual files
        try {
          const content = uploadedFile.buffer.toString('utf8');
          files = [{
            name: uploadedFile.originalname,
            content: content,
            size: uploadedFile.size
          }];
          fileName = uploadedFile.originalname;
          fileSize = uploadedFile.size;
          console.log(`Processing individual file: ${uploadedFile.originalname}`);
        } catch (error) {
          console.error('Error processing file:', error);
          return res.status(400).json({ message: "Could not process the uploaded file" });
        }
      }

      // Create project record
      const projectData = insertProjectSchema.parse({
        userId,
        name: name || fileName || 'Uploaded Project',
        description: description || `Uploaded file: ${uploadedFile.originalname}`,
        fileName: uploadedFile.originalname,
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

  // Deploy project
  app.post('/api/projects/:id/deploy', isAuthenticated, async (req: any, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const userId = req.user.claims.sub;

      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }

      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      console.log(`Starting deployment for project ${projectId} by user ${userId}`);

      // Create deployment record
      const deploymentData = insertDeploymentSchema.parse({
        projectId,
        userId,
        targetServer: 'replit',
        status: 'building',
        logs: 'Starting deployment process...\nExtracting optimized files...\n',
        tier: 'free',
        paymentStatus: 'pending',
        cost: '0.00'
      });

      const deployment = await storage.createDeployment(deploymentData);
      console.log(`Created deployment record: ${deployment.id}`);

      // Start deployment process in background
      startDeploymentAsync(deployment.id).catch(error => {
        console.error(`Deployment ${deployment.id} failed:`, error);
        storage.updateDeployment(deployment.id, {
          status: 'failed',
          logs: `Deployment failed: ${error.message}\n`
        });
      });

      res.json(deployment);
    } catch (error) {
      console.error("Error creating deployment:", error);
      res.status(500).json({ message: "Failed to start deployment" });
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

  // Add comprehensive deployment serving route
  app.get('/deployed/:id', async (req, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      
      if (isNaN(deploymentId)) {
        return res.status(400).send('Invalid deployment ID');
      }
      
      // Check if optimized deployment exists
      const optimizedPath = path.join(process.cwd(), 'optimized-deployments', `deployment-${deploymentId}`, 'index.html');
      
      try {
        await fs.access(optimizedPath);
        // Serve the optimized HTML file
        const htmlContent = await fs.readFile(optimizedPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(htmlContent);
        return;
      } catch (err) {
        // Fall back to database lookup and processing
      }
      
      const deployment = await storage.getDeployment(deploymentId);
      
      if (!deployment) {
        return res.status(404).send('Deployment not found');
      }

      const project = await storage.getProject(deployment.projectId);
      if (!project) {
        return res.status(404).send('Project not found');
      }

      // Process and optimize the deployment
      await deploymentEngine.processAndOptimizeProject(deploymentId, project);
      
      // Serve the optimized deployment
      await deploymentEngine.serveDeployment(deploymentId, req, res);
      
    } catch (error) {
      console.error('Error serving deployment:', error);
      res.status(500).send('Error loading deployment');
    }
  });

  // Serve React source files directly
  app.get('/deployed/:id/src/:filename', async (req, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const filename = req.params.filename;
      
      if (isNaN(deploymentId)) {
        return res.status(400).send('Invalid deployment ID');
      }
      
      // Look for the file in the deployment's client/src directory
      const possiblePaths = [
        path.join(process.cwd(), 'optimized-deployments', `deployment-${deploymentId}`, 'AiSaasStarter-main', 'client', 'src', filename),
        path.join(process.cwd(), 'optimized-deployments', `deployment-${deploymentId}`, 'client', 'src', filename),
        path.join(process.cwd(), 'optimized-deployments', `deployment-${deploymentId}`, 'src', filename)
      ];
      
      for (const filePath of possiblePaths) {
        try {
          await fs.access(filePath);
          const content = await fs.readFile(filePath, 'utf8');
          
          res.setHeader('Content-Type', 'application/javascript');
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.send(content);
          return;
        } catch (err) {
          continue;
        }
      }
      
      res.status(404).send('Source file not found');
    } catch (error) {
      console.error('Error serving React module:', error);
      res.status(500).send('Error loading module');
    }
  });

  // Add direct asset serving for CSS, JS, and other files
  app.get('/deployed/:id/:filename', async (req, res, next) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const filename = req.params.filename;
      
      if (isNaN(deploymentId)) {
        return res.status(400).send('Invalid deployment ID');
      }
      
      // Check for optimized asset files first
      const optimizedAssetPath = path.join(process.cwd(), 'optimized-deployments', `deployment-${deploymentId}`, filename);
      
      try {
        await fs.access(optimizedAssetPath);
        const content = await fs.readFile(optimizedAssetPath, 'utf8');
        
        // Set appropriate content type
        if (filename.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (filename.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filename.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html');
        }
        
        // Set no-cache headers to bypass Vite
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        res.send(content);
        return;
      } catch (err) {
        // Fall back to deployment engine
      }
      
      // Check if it's an asset file (has extension)
      if (filename && filename.includes('.')) {
        // Set no-cache headers to bypass Vite
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        
        await deploymentEngine.serveAsset(deploymentId, filename, res);
      } else {
        // If not an asset, serve the main deployment page
        await deploymentEngine.serveDeployment(deploymentId, req, res);
      }
    } catch (error) {
      console.error('Error serving deployment file:', error);
      res.status(404).send('File not found');
    }
  });

  // Add static file serving for deployments in assets subfolder
  app.get('/deployed/:id/assets/*', async (req, res) => {
    try {
      const deploymentId = parseInt(req.params.id);
      const assetPath = req.url.split('/assets/')[1] || '';
      
      if (isNaN(deploymentId)) {
        return res.status(400).send('Invalid deployment ID');
      }
      
      await deploymentEngine.serveAsset(deploymentId, assetPath, res);
    } catch (error) {
      console.error('Error serving asset:', error);
      res.status(404).send('Asset not found');
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

  // Payment routes for monetization system
  app.post('/api/payments/create-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { type, amount } = req.body;
      const userId = req.user.claims.sub;
      
      // Create transaction record
      const transaction = await storage.createTransaction({
        userId,
        type,
        amount,
        status: 'pending',
        description: `${type === 'deployment' ? 'Pay-as-you-deploy' : type === 'escalation' ? 'Human expert escalation' : 'Subscription'} payment`
      });

      // Simulate payment success for demo
      await storage.updateTransaction(transaction.id, { status: 'completed' });
      
      if (type === 'deployment') {
        const user = await storage.getUser(userId);
        await storage.updateUser(userId, { deploymentCredits: (user?.deploymentCredits || 0) + 1 });
      } else if (type === 'escalation') {
        const user = await storage.getUser(userId);
        await storage.updateUser(userId, { escalationCredits: (user?.escalationCredits || 0) + 1 });
      }

      res.json({ 
        success: true, 
        transactionId: transaction.id,
        message: `Payment of $${amount} processed successfully`
      });
    } catch (error) {
      console.error('Payment error:', error);
      res.status(500).json({ error: 'Payment processing failed' });
    }
  });

  app.post('/api/payments/subscribe', isAuthenticated, async (req: any, res) => {
    try {
      const { plan } = req.body;
      const userId = req.user.claims.sub;
      
      if (plan === 'pro') {
        const subscriptionEndsAt = new Date();
        subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1);
        
        await storage.updateUser(userId, { 
          subscriptionTier: 'pro',
          subscriptionEndsAt 
        });

        await storage.createTransaction({
          userId,
          type: 'subscription',
          amount: '15.00',
          status: 'completed',
          description: 'Pro subscription monthly payment'
        });

        res.json({ success: true, message: 'Upgraded to Pro subscription' });
      } else {
        res.status(400).json({ error: 'Invalid plan type' });
      }
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ error: 'Subscription failed' });
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
      logs: 'Starting deployment process...\nAnalyzing project structure...\n'
    });

    // Get project details
    const project = await storage.getProject(deployment.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    console.log(`Processing project ${project.id} for deployment ${deploymentId}`);

    // Process and optimize the project files
    await deploymentEngine.processAndOptimizeProject(deploymentId, project);

    await storage.updateDeployment(deploymentId, { 
      status: 'deploying',
      logs: 'Building optimized application...\nGenerating production assets...\nConfiguring runtime environment...\n'
    });

    // Simulate build process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mark as deployed
    await storage.updateDeployment(deploymentId, { 
      status: 'deployed',
      logs: 'Deployment successful!\nApplication is now live and accessible.\nOptimizations applied for production performance.\n'
    });

    console.log(`Deployment ${deploymentId} completed successfully`);

  } catch (error) {
    console.error(`Deployment failed for deployment ${deploymentId}:`, error);
    const currentDeployment = await storage.getDeployment(deploymentId);
    await storage.updateDeployment(deploymentId, { 
      status: 'failed',
      errorMessage: (error as Error).message,
      logs: (currentDeployment?.logs || '') + `Error: ${(error as Error).message}\nPlease check your project files and try again.\n`
    });
  }
}
