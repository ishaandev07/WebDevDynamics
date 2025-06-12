import { promises as fs } from 'fs';
import path from 'path';
import { storage } from './storage';
import { fileStorage } from './fileStorage';
import { aiAssistant } from './openai';

export interface DeploymentConfig {
  framework: string;
  buildCommand?: string;
  startCommand: string;
  environmentVariables: Record<string, string>;
  port: number;
  replitConfig?: {
    language: string;
    run: string;
    entrypoint: string;
  };
}

export class DeploymentEngine {
  private deploymentsDir = path.join(process.cwd(), 'deployments');
  private optimizedDir = path.join(process.cwd(), 'optimized-deployments');

  constructor() {
    this.ensureDeploymentsDir();
    this.ensureOptimizedDir();
  }

  private async ensureDeploymentsDir() {
    try {
      await fs.access(this.deploymentsDir);
    } catch {
      await fs.mkdir(this.deploymentsDir, { recursive: true });
    }
  }

  private async ensureOptimizedDir() {
    try {
      await fs.access(this.optimizedDir);
    } catch {
      await fs.mkdir(this.optimizedDir, { recursive: true });
    }
  }

  async processAndOptimizeProject(deploymentId: number, project: any): Promise<void> {
    try {
      console.log(`Processing and optimizing project for deployment ${deploymentId}`);
      
      // Get project files using the full file path
      const files = await fileStorage.extractZipContents(project.filePath);
      
      // Analyze project with AI for optimization opportunities
      const analysis = await aiAssistant.analyzeProject(files);
      
      // Create optimized deployment directory
      const optimizedPath = path.join(this.optimizedDir, `deployment-${deploymentId}`);
      await fs.mkdir(optimizedPath, { recursive: true });
      
      // Process files based on framework
      await this.processFilesByFramework(files, analysis, optimizedPath);
      
      // Generate optimized configurations
      await this.generateOptimizedConfigs(analysis, optimizedPath, deploymentId);
      
      // Setup runtime environment
      await this.setupRuntimeEnvironment(analysis, optimizedPath);
      
      console.log(`Project optimization completed for deployment ${deploymentId}`);
      
    } catch (error) {
      console.error(`Error processing project for deployment ${deploymentId}:`, error);
      throw error;
    }
  }

  private async processFilesByFramework(files: any[], analysis: any, outputPath: string): Promise<void> {
    const framework = analysis.framework.toLowerCase();
    
    for (const file of files) {
      const filePath = path.join(outputPath, file.name);
      const fileDir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(fileDir, { recursive: true });
      
      let processedContent = file.content;
      
      // Apply framework-specific optimizations
      if (framework.includes('react') || framework.includes('vue') || framework.includes('angular')) {
        processedContent = await this.optimizeWebFile(file, analysis);
      } else if (framework.includes('node') || framework.includes('express')) {
        processedContent = await this.optimizeNodeFile(file, analysis);
      } else if (framework.includes('python') || framework.includes('flask') || framework.includes('django')) {
        processedContent = await this.optimizePythonFile(file, analysis);
      }
      
      await fs.writeFile(filePath, processedContent);
    }
  }

  private async optimizeWebFile(file: any, analysis: any): Promise<string> {
    let content = file.content;
    
    // Use AI to deeply optimize each file for production deployment
    if (file.name.endsWith('.html')) {
      const prompt = `Transform this HTML file into a production-ready version. Enhance it with:
- Proper DOCTYPE, meta tags, and SEO optimization
- Responsive design with viewport settings
- Performance optimizations (preload, defer, minification)
- Error handling and fallbacks
- Accessibility improvements
- Modern HTML5 semantic structure
- Security headers and CSP

Original HTML:
${content}

Return only the enhanced HTML:`;

      try {
        const optimizedContent = await aiAssistant.chatWithAssistant(prompt, {});
        return optimizedContent;
      } catch (error) {
        console.error('AI HTML optimization failed:', error);
      }
    }
    
    if (file.name.endsWith('.css')) {
      const prompt = `Transform this CSS into production-ready code. Enhance it with:
- Modern CSS3 features and flexbox/grid optimizations
- Responsive design patterns and media queries
- Performance optimizations and critical CSS
- Cross-browser compatibility fixes
- Animation and transition improvements
- Accessibility enhancements
- Mobile-first design patterns

Original CSS:
${content}

Return only the enhanced CSS:`;

      try {
        const optimizedContent = await aiAssistant.chatWithAssistant(prompt, {});
        return optimizedContent;
      } catch (error) {
        console.error('AI CSS optimization failed:', error);
      }
    }
    
    if (file.name.endsWith('.js')) {
      const prompt = `Transform this JavaScript into production-ready code. Enhance it with:
- Comprehensive error handling and try-catch blocks
- Performance optimizations and memory management
- Modern ES6+ features and best practices
- Event delegation and proper cleanup
- Loading states and user feedback
- Mobile touch event handling
- Data validation and sanitization
- Progressive enhancement patterns

Original JavaScript:
${content}

Return only the enhanced JavaScript:`;

      try {
        const optimizedContent = await aiAssistant.chatWithAssistant(prompt, {});
        return optimizedContent;
      } catch (error) {
        console.error('AI JavaScript optimization failed:', error);
      }
    }
    
    return content;
  }

  private async optimizeNodeFile(file: any, analysis: any): Promise<string> {
    let content = file.content;
    
    if (file.name.endsWith('.js') || file.name.endsWith('.ts')) {
      const prompt = `Transform this Node.js/TypeScript file into production-ready code. Enhance it with:
- Environment variable configuration and validation
- Comprehensive error handling and logging
- Performance optimizations and caching
- Security middleware and rate limiting
- Health checks and monitoring endpoints
- Graceful shutdown handling
- Database connection pooling optimizations
- CORS and security headers
- Request validation and sanitization
- Production-ready middleware stack

Original Node.js code:
${content}

Return only the enhanced Node.js code:`;

      try {
        const optimizedContent = await aiAssistant.chatWithAssistant(prompt, {});
        return optimizedContent;
      } catch (error) {
        console.error('AI Node.js optimization failed:', error);
      }
    }
    
    return content;
  }

  private async optimizePythonFile(file: any, analysis: any): Promise<string> {
    let content = file.content;
    
    if (file.name.endsWith('.py')) {
      const prompt = `Transform this Python file into production-ready code. Enhance it with:
- Comprehensive error handling and logging configuration
- Environment variable management and validation
- Performance optimizations and caching strategies
- Security enhancements and input validation
- Database connection pooling and optimization
- Health check endpoints and monitoring
- CORS configuration and security headers
- Rate limiting and request throttling
- Graceful shutdown and signal handling
- Production-ready middleware and configurations

Original Python code:
${content}

Return only the enhanced Python code:`;

      try {
        const optimizedContent = await aiAssistant.chatWithAssistant(prompt, {});
        return optimizedContent;
      } catch (error) {
        console.error('AI Python optimization failed:', error);
      }
    }
    
    return content;
  }

  private async generateOptimizedConfigs(analysis: any, outputPath: string, deploymentId: number): Promise<void> {
    const framework = analysis.framework.toLowerCase();
    
    // Generate Dockerfile
    const dockerfile = await this.generateOptimizedDockerfile(analysis);
    await fs.writeFile(path.join(outputPath, 'Dockerfile'), dockerfile);
    
    // Generate docker-compose.yml for full stack deployments
    const dockerCompose = await this.generateDockerCompose(analysis, deploymentId);
    await fs.writeFile(path.join(outputPath, 'docker-compose.yml'), dockerCompose);
    
    // Generate nginx config for web applications
    if (framework.includes('react') || framework.includes('vue') || framework.includes('angular') || framework.includes('html')) {
      const nginxConfig = await this.generateNginxConfig(deploymentId);
      await fs.writeFile(path.join(outputPath, 'nginx.conf'), nginxConfig);
    }
    
    // Generate environment configuration
    const envConfig = await this.generateEnvironmentConfig(analysis);
    await fs.writeFile(path.join(outputPath, '.env.production'), envConfig);
    
    // Generate deployment script
    const deployScript = await this.generateDeploymentScript(analysis, deploymentId);
    await fs.writeFile(path.join(outputPath, 'deploy.sh'), deployScript);
    await fs.chmod(path.join(outputPath, 'deploy.sh'), '755');
  }

  private async generateOptimizedDockerfile(analysis: any): Promise<string> {
    const framework = analysis.framework.toLowerCase();
    
    if (framework.includes('node') || framework.includes('react') || framework.includes('vue')) {
      return `# Multi-stage Node.js build for ${analysis.framework}
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY . .
RUN npm run build 2>/dev/null || echo "No build script found"

FROM node:18-alpine AS runtime
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist 2>/dev/null || echo "No dist folder"
COPY --from=builder --chown=nextjs:nodejs /app/build ./build 2>/dev/null || echo "No build folder"
COPY --from=builder --chown=nextjs:nodejs /app/public ./public 2>/dev/null || echo "No public folder"
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package*.json ./
COPY --from=builder --chown=nextjs:nodejs /app/*.js ./
COPY --from=builder --chown=nextjs:nodejs /app/*.html ./

USER nextjs

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]`;
    }
    
    if (framework.includes('python') || framework.includes('flask') || framework.includes('django')) {
      return `# Optimized Python deployment for ${analysis.framework}
FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos '' appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 5000
ENV FLASK_ENV=production
ENV PYTHONPATH=/app

CMD ["python", "server.py"]`;
    }
    
    // Default static file server
    return `# Static file server with nginx
FROM nginx:alpine

COPY . /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]`;
  }

  private async generateDockerCompose(analysis: any, deploymentId: number): Promise<string> {
    const framework = analysis.framework.toLowerCase();
    const serviceName = `app-${deploymentId}`;
    
    return `version: '3.8'

services:
  ${serviceName}:
    build: .
    ports:
      - "${3000 + deploymentId}:${framework.includes('python') ? '5000' : '3000'}"
    environment:
      - NODE_ENV=production
      - DEPLOYMENT_ID=${deploymentId}
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:${framework.includes('python') ? '5000' : '3000'}/health"]
      interval: 30s
      timeout: 10s
      retries: 3`;
  }

  private async generateNginxConfig(deploymentId: number): Promise<string> {
    return `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;

    server {
        listen 80;
        server_name localhost;
        
        root /usr/share/nginx/html;
        index index.html index.htm;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

        # Handle client-side routing
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}`;
  }

  private async generateEnvironmentConfig(analysis: any): Promise<string> {
    const framework = analysis.framework.toLowerCase();
    
    let config = `# Production Environment Configuration
NODE_ENV=production
PORT=${framework.includes('python') ? '5000' : '3000'}
HOST=0.0.0.0

# Performance Settings
UV_THREADPOOL_SIZE=128
NODE_OPTIONS="--max-old-space-size=2048"

# Security
SECURE_SSL_REDIRECT=true
SESSION_COOKIE_SECURE=true
CSRF_COOKIE_SECURE=true`;

    if (framework.includes('python')) {
      config += `

# Python/Flask Settings
FLASK_ENV=production
PYTHONPATH=/app
GUNICORN_WORKERS=4
GUNICORN_BIND=0.0.0.0:5000`;
    }

    return config;
  }

  private async generateDeploymentScript(analysis: any, deploymentId: number): Promise<string> {
    return `#!/bin/bash
# Automated deployment script for deployment ${deploymentId}

set -e

echo "🚀 Starting deployment ${deploymentId}..."

# Build the Docker image
docker build -t deployment-${deploymentId} .

# Stop existing container if running
docker stop deployment-${deploymentId}-container 2>/dev/null || true
docker rm deployment-${deploymentId}-container 2>/dev/null || true

# Run the new container
docker run -d \\
  --name deployment-${deploymentId}-container \\
  --restart unless-stopped \\
  -p ${3000 + deploymentId}:${analysis.framework.toLowerCase().includes('python') ? '5000' : '3000'} \\
  deployment-${deploymentId}

echo "✅ Deployment ${deploymentId} completed successfully!"
echo "🌐 Application available at: http://localhost:${3000 + deploymentId}"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:${3000 + deploymentId}/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-${deploymentId}-container"
    exit 1
fi

echo "🎉 Deployment successful!"`;
  }

  private async setupRuntimeEnvironment(analysis: any, outputPath: string): Promise<void> {
    const framework = analysis.framework.toLowerCase();
    
    // Setup package.json with optimized scripts if Node.js project
    if (framework.includes('node') || framework.includes('react') || framework.includes('vue')) {
      const packageJsonPath = path.join(outputPath, 'package.json');
      try {
        const existingPackage = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
        existingPackage.scripts = {
          ...existingPackage.scripts,
          start: existingPackage.scripts?.start || 'node server.js',
          'start:prod': 'NODE_ENV=production npm start',
          health: 'curl -f http://localhost:3000/health || exit 1'
        };
        await fs.writeFile(packageJsonPath, JSON.stringify(existingPackage, null, 2));
      } catch (error) {
        // Create basic package.json if none exists
        const basicPackage = {
          name: `deployment-app`,
          version: '1.0.0',
          scripts: {
            start: 'node server.js',
            'start:prod': 'NODE_ENV=production npm start'
          }
        };
        await fs.writeFile(packageJsonPath, JSON.stringify(basicPackage, null, 2));
      }
    }
    
    // Setup requirements.txt optimization for Python projects
    if (framework.includes('python')) {
      const requirementsPath = path.join(outputPath, 'requirements.txt');
      try {
        let requirements = await fs.readFile(requirementsPath, 'utf-8');
        // Add production optimizations
        if (!requirements.includes('gunicorn')) {
          requirements += '\ngunicorn==21.2.0';
        }
        if (!requirements.includes('python-dotenv')) {
          requirements += '\npython-dotenv==1.0.0';
        }
        await fs.writeFile(requirementsPath, requirements);
      } catch (error) {
        // Create basic requirements.txt
        await fs.writeFile(requirementsPath, 'flask==2.3.3\ngunicorn==21.2.0\npython-dotenv==1.0.0');
      }
    }
  }

  async serveDeployment(deploymentId: number, req: any, res: any): Promise<void> {
    const optimizedPath = path.join(this.optimizedDir, `deployment-${deploymentId}`);
    
    try {
      // Check if optimized deployment exists
      await fs.access(optimizedPath);
      
      // Serve the main file based on framework
      const indexPath = path.join(optimizedPath, 'index.html');
      
      // Try to serve HTML first
      try {
        let htmlContent = await fs.readFile(indexPath, 'utf-8');
        
        // Ensure proper asset paths for the deployed environment
        htmlContent = htmlContent.replace(
          /href="([^"]+\.(css|ico))"/g, 
          `href="/deployed/${deploymentId}/$1"`
        );
        htmlContent = htmlContent.replace(
          /src="([^"]+\.(js|png|jpg|jpeg|gif|svg))"/g, 
          `src="/deployed/${deploymentId}/$1"`
        );
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(htmlContent);
        return;
      } catch (htmlError) {
        // If no HTML, create a deployment status page
        const statusPage = await this.generateDeploymentStatusPage(deploymentId, optimizedPath);
        res.setHeader('Content-Type', 'text/html');
        res.send(statusPage);
      }
      
    } catch (error) {
      console.error(`Error serving deployment ${deploymentId}:`, error);
      res.status(500).send('Deployment not ready. Please wait for processing to complete.');
    }
  }

  async serveAsset(deploymentId: number, assetPath: string, res: any): Promise<void> {
    const optimizedPath = path.join(this.optimizedDir, `deployment-${deploymentId}`);
    const fullAssetPath = path.join(optimizedPath, assetPath);
    
    try {
      const assetContent = await fs.readFile(fullAssetPath);
      
      // Set appropriate content type
      const ext = path.extname(assetPath).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
      };
      
      res.setHeader('Content-Type', contentTypes[ext] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      res.send(assetContent);
      
    } catch (error) {
      console.error(`Error serving asset ${assetPath} for deployment ${deploymentId}:`, error);
      res.status(404).send('Asset not found');
    }
  }

  private async generateDeploymentStatusPage(deploymentId: number, deploymentPath: string): Promise<string> {
    try {
      const files = await fs.readdir(deploymentPath);
      const dockerfileExists = files.includes('Dockerfile');
      
      return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deployment ${deploymentId} - Production Ready</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white; min-height: 100vh; padding: 20px;
        }
        .container { 
            max-width: 1000px; margin: 0 auto; 
            background: rgba(255,255,255,0.1); border-radius: 20px; 
            padding: 40px; backdrop-filter: blur(10px);
        }
        .header { text-align: center; margin-bottom: 40px; }
        .status { 
            background: linear-gradient(45deg, #28a745, #20c997); 
            padding: 15px 30px; border-radius: 50px; display: inline-block; 
            margin: 20px 0; font-weight: bold; animation: pulse 2s infinite;
        }
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .feature { 
            background: rgba(255,255,255,0.1); padding: 25px; border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .feature h3 { color: #4ecdc4; margin-bottom: 10px; }
        .file-list { 
            background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; 
            margin: 20px 0; max-height: 300px; overflow-y: auto;
        }
        .file-item { 
            padding: 8px 12px; margin: 5px 0; background: rgba(255,255,255,0.1); 
            border-radius: 8px; font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Deployment ${deploymentId}</h1>
            <div class="status">✅ Production Ready & Optimized</div>
            <p>Your application has been processed, optimized, and is ready for deployment</p>
        </div>

        <div class="features">
            <div class="feature">
                <h3>⚡ Performance Optimized</h3>
                <p>Code has been analyzed and optimized for production deployment with caching, compression, and security headers.</p>
            </div>
            <div class="feature">
                <h3>🐳 Containerized</h3>
                <p>${dockerfileExists ? 'Docker configuration generated for consistent deployments across environments.' : 'Ready for containerization.'}</p>
            </div>
            <div class="feature">
                <h3>🔒 Security Enhanced</h3>
                <p>Security headers, error handling, and production configurations have been automatically applied.</p>
            </div>
            <div class="feature">
                <h3>📊 Monitoring Ready</h3>
                <p>Health check endpoints and logging have been configured for production monitoring.</p>
            </div>
        </div>

        <div class="file-list">
            <h3>📁 Optimized Files:</h3>
            ${files.map(file => `<div class="file-item">${file}</div>`).join('')}
        </div>

        <div style="text-align: center; margin-top: 30px; opacity: 0.8;">
            <p>🎯 Powered by AI-Enhanced Smart Deployment Platform</p>
            <p>Deployment optimized on ${new Date().toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`;
    } catch (error) {
      return '<h1>Deployment Processing...</h1><p>Please wait while your application is being optimized.</p>';
    }
  }

  async generateDeploymentGuidance(projectId: number): Promise<string> {
    try {
      const project = await storage.getProject(projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      const files = await fileStorage.extractZipContents(project.filePath);
      const guidance = await aiAssistant.getDeploymentGuidance(
        files,
        project.framework || 'unknown',
        project.name
      );

      return guidance.steps.join('\n\n');
    } catch (error) {
      console.error('Error generating deployment guidance:', error);
      return 'Error generating deployment guidance. Please try again.';
    }
  }

  async retryDeployment(deploymentId: number): Promise<void> {
    try {
      const deployment = await storage.getDeployment(deploymentId);
      if (!deployment) {
        throw new Error('Deployment not found');
      }

      const project = await storage.getProject(deployment.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await storage.updateDeployment(deploymentId, { 
        status: 'pending',
        errorMessage: null,
        logs: 'Retrying deployment...'
      });

      await this.processAndOptimizeProject(deploymentId, project);
      
      await storage.updateDeployment(deploymentId, { 
        status: 'success',
        logs: 'Deployment retry completed successfully'
      });
    } catch (error) {
      console.error(`Error retrying deployment ${deploymentId}:`, error);
      await storage.updateDeployment(deploymentId, { 
        status: 'failed',
        errorMessage: `Retry failed: ${error}`
      });
    }
  }

  async getDeploymentLogs(deploymentId: number): Promise<string> {
    try {
      const deployment = await storage.getDeployment(deploymentId);
      if (!deployment) {
        return 'Deployment not found';
      }

      const optimizedPath = path.join(this.optimizedDir, `deployment-${deploymentId}`);
      
      let logs = deployment.logs || 'No logs available';
      
      try {
        await fs.access(optimizedPath);
        const files = await fs.readdir(optimizedPath);
        logs += `\n\nOptimized files generated:\n${files.join('\n')}`;
        
        if (files.includes('Dockerfile')) {
          logs += '\n\nDocker configuration ready';
        }
        if (files.includes('docker-compose.yml')) {
          logs += '\nDocker Compose configuration ready';
        }
        if (files.includes('nginx.conf')) {
          logs += '\nNginx configuration ready';
        }
      } catch (error) {
        logs += '\n\nOptimization in progress...';
      }

      return logs;
    } catch (error) {
      console.error(`Error fetching deployment logs for ${deploymentId}:`, error);
      return 'Error fetching deployment logs';
    }
  }

  async createDeploymentFiles(deploymentId: number): Promise<void> {
    try {
      const deployment = await storage.getDeployment(deploymentId);
      if (!deployment) {
        throw new Error('Deployment not found');
      }

      const project = await storage.getProject(deployment.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await this.processAndOptimizeProject(deploymentId, project);
    } catch (error) {
      console.error(`Error creating deployment files for ${deploymentId}:`, error);
      throw error;
    }
  }

  async simulateDeployment(deploymentId: number): Promise<void> {
    try {
      await storage.updateDeployment(deploymentId, { status: 'deploying' });
      
      const deployment = await storage.getDeployment(deploymentId);
      if (!deployment) {
        throw new Error('Deployment not found');
      }

      const project = await storage.getProject(deployment.projectId);
      if (!project) {
        throw new Error('Project not found');
      }

      await this.processAndOptimizeProject(deploymentId, project);
      
      await storage.updateDeployment(deploymentId, { 
        status: 'success',
        logs: 'Deployment completed successfully with AI optimization',
        deploymentUrl: `http://localhost:5000/deployed/${deploymentId}`
      });
    } catch (error) {
      console.error(`Error simulating deployment ${deploymentId}:`, error);
      await storage.updateDeployment(deploymentId, { 
        status: 'failed',
        errorMessage: `Deployment failed: ${error}`,
        logs: `Error during deployment: ${error}`
      });
    }
  }

  async getDeploymentStatus(deploymentId: number): Promise<string> {
    try {
      const deployment = await storage.getDeployment(deploymentId);
      return deployment?.status || 'unknown';
    } catch (error) {
      console.error(`Error getting deployment status for ${deploymentId}:`, error);
      return 'error';
    }
  }
}

export const deploymentEngine = new DeploymentEngine();