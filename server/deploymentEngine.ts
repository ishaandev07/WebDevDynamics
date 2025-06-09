import { storage } from "./storage";
import { fileStorage } from "./fileStorage";
import { aiAssistant } from "./openai";
import fs from "fs/promises";
import path from "path";

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

  constructor() {
    this.ensureDeploymentsDir();
  }

  private async ensureDeploymentsDir() {
    try {
      await fs.access(this.deploymentsDir);
    } catch {
      await fs.mkdir(this.deploymentsDir, { recursive: true });
    }
  }

  async generateDeploymentConfig(projectId: number): Promise<DeploymentConfig> {
    const project = await storage.getProject(projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (project.status !== 'analyzed' || !project.analysisResult) {
      throw new Error('Project must be analyzed before deployment');
    }

    const analysis = typeof project.analysisResult === 'string' 
      ? JSON.parse(project.analysisResult) 
      : project.analysisResult;

    const config: DeploymentConfig = {
      framework: analysis.framework,
      buildCommand: analysis.buildCommand,
      startCommand: analysis.startCommand || 'npm start',
      environmentVariables: {
        NODE_ENV: 'production',
        PORT: '8080',
        ...this.getFrameworkEnvVars(analysis.framework)
      },
      port: 8080,
      replitConfig: this.generateReplitConfig(analysis)
    };

    return config;
  }

  private getFrameworkEnvVars(framework: string): Record<string, string> {
    const envVars: Record<string, string> = {};

    if (framework.includes('React') || framework.includes('Vue') || framework.includes('Angular')) {
      envVars.CI = 'false';
      envVars.GENERATE_SOURCEMAP = 'false';
    }

    if (framework.includes('Next.js')) {
      envVars.NEXT_TELEMETRY_DISABLED = '1';
    }

    if (framework.includes('Python') || framework.includes('FastAPI') || framework.includes('Django')) {
      envVars.PYTHONUNBUFFERED = '1';
      envVars.PYTHONPATH = '.';
    }

    return envVars;
  }

  private generateReplitConfig(analysis: any): DeploymentConfig['replitConfig'] {
    const framework = analysis.framework.toLowerCase();

    if (framework.includes('python') || framework.includes('fastapi') || framework.includes('django')) {
      return {
        language: 'python3',
        run: analysis.startCommand || 'python main.py',
        entrypoint: analysis.entryPoint || 'main.py'
      };
    }

    if (framework.includes('node') || framework.includes('react') || framework.includes('express')) {
      return {
        language: 'nodejs',
        run: analysis.startCommand || 'npm start',
        entrypoint: analysis.entryPoint || 'index.js'
      };
    }

    if (framework.includes('java') || framework.includes('spring')) {
      return {
        language: 'java',
        run: analysis.startCommand || 'java -jar target/*.jar',
        entrypoint: analysis.entryPoint || 'src/main/java/Main.java'
      };
    }

    return {
      language: 'bash',
      run: analysis.startCommand || 'echo "Unknown framework"',
      entrypoint: analysis.entryPoint || 'main.sh'
    };
  }

  async createDeploymentFiles(deploymentId: number): Promise<void> {
    const deployment = await storage.getDeployment(deploymentId);
    if (!deployment) {
      throw new Error('Deployment not found');
    }

    const project = await storage.getProject(deployment.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const config = await this.generateDeploymentConfig(deployment.projectId);
    const deploymentPath = path.join(this.deploymentsDir, `deployment-${deploymentId}`);

    await fs.mkdir(deploymentPath, { recursive: true });

    // Generate .replit file
    await this.generateReplitFile(deploymentPath, config);

    // Generate .env file
    await this.generateEnvFile(deploymentPath, config);

    // Generate deployment script
    await this.generateDeploymentScript(deploymentPath, config);

    // Generate Dockerfile
    await this.generateDockerfile(deploymentPath, config);

    // Copy project files if needed
    await this.prepareProjectFiles(deploymentPath, project);

    console.log(`Deployment files created for deployment ${deploymentId}`);
  }

  private async generateReplitFile(deploymentPath: string, config: DeploymentConfig): Promise<void> {
    const replitConfig = {
      language: config.replitConfig?.language || 'nodejs',
      run: config.replitConfig?.run || config.startCommand,
      entrypoint: config.replitConfig?.entrypoint || 'index.js',
      hidden: ['.config', 'node_modules', '.git'],
      compile: config.buildCommand || '',
      env: config.environmentVariables
    };

    const replitContent = Object.entries(replitConfig)
      .filter(([_, value]) => value !== '')
      .map(([key, value]) => {
        if (typeof value === 'object') {
          return `${key} = ${JSON.stringify(value, null, 2)}`;
        }
        return `${key} = "${value}"`;
      })
      .join('\n');

    await fs.writeFile(path.join(deploymentPath, '.replit'), replitContent);
  }

  private async generateEnvFile(deploymentPath: string, config: DeploymentConfig): Promise<void> {
    const envContent = Object.entries(config.environmentVariables)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    await fs.writeFile(path.join(deploymentPath, '.env'), envContent);
  }

  private async generateDeploymentScript(deploymentPath: string, config: DeploymentConfig): Promise<void> {
    let scriptContent = '#!/bin/bash\n\n';
    scriptContent += '# Deployment script generated by Smart Deployment Dashboard\n\n';

    if (config.buildCommand) {
      scriptContent += `echo "Building application..."\n`;
      scriptContent += `${config.buildCommand}\n\n`;
    }

    scriptContent += `echo "Starting application..."\n`;
    scriptContent += `${config.startCommand}\n`;

    await fs.writeFile(path.join(deploymentPath, 'deploy.sh'), scriptContent);
    await fs.chmod(path.join(deploymentPath, 'deploy.sh'), 0o755);
  }

  private async generateDockerfile(deploymentPath: string, config: DeploymentConfig): Promise<void> {
    let dockerfile = '';

    if (config.framework.includes('Node') || config.framework.includes('React') || config.framework.includes('Express')) {
      dockerfile = `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

${config.buildCommand ? `RUN ${config.buildCommand}` : ''}

EXPOSE ${config.port}

CMD ["${config.startCommand.split(' ')[0]}", "${config.startCommand.split(' ').slice(1).join('", "')}"]`;

    } else if (config.framework.includes('Python') || config.framework.includes('FastAPI')) {
      dockerfile = `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE ${config.port}

CMD ["${config.startCommand.split(' ')[0]}", "${config.startCommand.split(' ').slice(1).join('", "')}"]`;

    } else {
      dockerfile = `FROM alpine:latest

WORKDIR /app

COPY . .

RUN chmod +x deploy.sh

EXPOSE ${config.port}

CMD ["./deploy.sh"]`;
    }

    await fs.writeFile(path.join(deploymentPath, 'Dockerfile'), dockerfile);
  }

  private async prepareProjectFiles(deploymentPath: string, project: any): Promise<void> {
    // Extract project files to deployment directory
    try {
      const files = await fileStorage.extractZipContents(project.filePath);
      
      for (const file of files) {
        const filePath = path.join(deploymentPath, file.name);
        const fileDir = path.dirname(filePath);
        
        await fs.mkdir(fileDir, { recursive: true });
        await fs.writeFile(filePath, file.content);
      }
    } catch (error) {
      console.error('Error preparing project files:', error);
      throw new Error('Failed to prepare project files for deployment');
    }
  }

  async simulateDeployment(deploymentId: number): Promise<void> {
    // Simulate deployment process with realistic steps
    const steps = [
      { name: 'Preparing deployment environment', duration: 2000 },
      { name: 'Extracting project files', duration: 3000 },
      { name: 'Installing dependencies', duration: 8000 },
      { name: 'Running build process', duration: 10000 },
      { name: 'Starting application server', duration: 5000 },
      { name: 'Verifying deployment', duration: 3000 }
    ];

    await storage.updateDeployment(deploymentId, { 
      status: 'building',
      logs: 'Starting deployment process...\n'
    });

    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, step.duration));
      
      const deployment = await storage.getDeployment(deploymentId);
      const currentLogs = deployment?.logs || '';
      
      await storage.updateDeployment(deploymentId, {
        logs: `${currentLogs}✓ ${step.name}\n`
      });
    }

    // Generate mock deployment URL
    const deploymentUrl = `https://deployment-${deploymentId}-${Date.now()}.replit.app`;
    
    // Simulate success or failure (90% success rate)
    const isSuccess = Math.random() > 0.1;
    
    if (isSuccess) {
      await storage.updateDeployment(deploymentId, {
        status: 'deployed',
        deploymentUrl,
        logs: `${(await storage.getDeployment(deploymentId))?.logs || ''}✓ Deployment completed successfully!\nApplication available at: ${deploymentUrl}\n`
      });
    } else {
      await storage.updateDeployment(deploymentId, {
        status: 'failed',
        errorMessage: 'Port binding failed: EADDRINUSE',
        logs: `${(await storage.getDeployment(deploymentId))?.logs || ''}✗ Deployment failed: Port 8080 is already in use\n`
      });
    }
  }

  async getDeploymentLogs(deploymentId: number): Promise<string> {
    const deployment = await storage.getDeployment(deploymentId);
    return deployment?.logs || 'No logs available';
  }

  async getDeploymentStatus(deploymentId: number): Promise<string> {
    const deployment = await storage.getDeployment(deploymentId);
    return deployment?.status || 'unknown';
  }

  async retryDeployment(deploymentId: number): Promise<void> {
    await storage.updateDeployment(deploymentId, {
      status: 'pending',
      errorMessage: null,
      logs: 'Retrying deployment...\n',
      updatedAt: new Date()
    });

    // Restart deployment process
    this.simulateDeployment(deploymentId);
  }

  async generateDeploymentGuidance(projectId: number): Promise<string> {
    const project = await storage.getProject(projectId);
    if (!project || !project.analysisResult) {
      return 'Project analysis required before generating deployment guidance.';
    }

    const analysis = typeof project.analysisResult === 'string' 
      ? JSON.parse(project.analysisResult) 
      : project.analysisResult;

    return await aiAssistant.getDeploymentGuidance(
      analysis.framework,
      'replit',
      analysis.issues || []
    ).then(guidance => {
      let guide = `# Deployment Guide for ${project.name}\n\n`;
      guide += `**Framework:** ${analysis.framework}\n`;
      guide += `**Confidence:** ${(analysis.confidence * 100).toFixed(0)}%\n\n`;
      
      guide += `## Deployment Steps\n`;
      guidance.steps.forEach((step, i) => {
        guide += `${i + 1}. ${step}\n`;
      });
      
      guide += `\n## Required Commands\n`;
      guidance.commands.forEach(cmd => {
        guide += `\`\`\`bash\n${cmd}\n\`\`\`\n`;
      });
      
      if (guidance.warnings.length > 0) {
        guide += `\n## Warnings\n`;
        guidance.warnings.forEach(warning => {
          guide += `⚠️ ${warning}\n`;
        });
      }
      
      return guide;
    });
  }
}

export const deploymentEngine = new DeploymentEngine();