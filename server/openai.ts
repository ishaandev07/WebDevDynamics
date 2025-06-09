// Local rule-based analysis system - no API keys required
export interface ProjectAnalysis {
  framework: string;
  dependencies: string[];
  entryPoint: string;
  buildCommand?: string;
  startCommand?: string;
  port?: number;
  environmentVariables?: string[];
  issues: string[];
  recommendations: string[];
  confidence: number;
}

export interface DeploymentGuidance {
  steps: string[];
  configFiles: Array<{
    filename: string;
    content: string;
  }>;
  commands: string[];
  warnings: string[];
}

export class AIAssistant {
  private detectFramework(files: Array<{ name: string; content: string }>): { framework: string; confidence: number } {
    const fileNames = files.map(f => f.name.toLowerCase());
    const allContent = files.map(f => f.content).join('\n').toLowerCase();

    // React detection
    if (fileNames.some(name => name.includes('package.json'))) {
      const packageJson = files.find(f => f.name.toLowerCase().includes('package.json'));
      if (packageJson?.content.includes('"react"')) {
        return { framework: 'React', confidence: 0.9 };
      }
      if (packageJson?.content.includes('"vue"')) {
        return { framework: 'Vue.js', confidence: 0.9 };
      }
      if (packageJson?.content.includes('"angular"')) {
        return { framework: 'Angular', confidence: 0.9 };
      }
      if (packageJson?.content.includes('"express"')) {
        return { framework: 'Express.js', confidence: 0.8 };
      }
      if (packageJson?.content.includes('"next"')) {
        return { framework: 'Next.js', confidence: 0.9 };
      }
      return { framework: 'Node.js', confidence: 0.7 };
    }

    // Python detection
    if (fileNames.some(name => name.includes('requirements.txt') || name.includes('pyproject.toml'))) {
      if (allContent.includes('fastapi') || allContent.includes('from fastapi')) {
        return { framework: 'FastAPI', confidence: 0.9 };
      }
      if (allContent.includes('django') || allContent.includes('from django')) {
        return { framework: 'Django', confidence: 0.9 };
      }
      if (allContent.includes('flask') || allContent.includes('from flask')) {
        return { framework: 'Flask', confidence: 0.9 };
      }
      return { framework: 'Python', confidence: 0.7 };
    }

    // Java detection
    if (fileNames.some(name => name.includes('pom.xml') || name.includes('build.gradle'))) {
      if (allContent.includes('spring-boot') || allContent.includes('@springbootapplication')) {
        return { framework: 'Spring Boot', confidence: 0.9 };
      }
      return { framework: 'Java', confidence: 0.7 };
    }

    // PHP detection
    if (fileNames.some(name => name.includes('composer.json'))) {
      if (allContent.includes('laravel')) {
        return { framework: 'Laravel', confidence: 0.9 };
      }
      return { framework: 'PHP', confidence: 0.7 };
    }

    return { framework: 'Unknown', confidence: 0.1 };
  }

  private extractDependencies(files: Array<{ name: string; content: string }>): string[] {
    const deps: string[] = [];
    
    files.forEach(file => {
      if (file.name.toLowerCase().includes('package.json')) {
        try {
          const pkg = JSON.parse(file.content);
          if (pkg.dependencies) {
            deps.push(...Object.keys(pkg.dependencies));
          }
          if (pkg.devDependencies) {
            deps.push(...Object.keys(pkg.devDependencies));
          }
        } catch (e) {
          // Invalid JSON, skip
        }
      }
      
      if (file.name.toLowerCase().includes('requirements.txt')) {
        const lines = file.content.split('\n');
        lines.forEach(line => {
          const dep = line.trim().split(/[>=<]/)[0];
          if (dep && !dep.startsWith('#')) {
            deps.push(dep);
          }
        });
      }
    });

    return Array.from(new Set(deps)).slice(0, 10); // Limit to 10 key dependencies
  }

  private findEntryPoint(files: Array<{ name: string; content: string }>, framework: string): string {
    const fileNames = files.map(f => f.name);
    
    // Common entry points by framework
    const entryPoints = {
      'React': ['src/index.js', 'src/index.tsx', 'src/main.jsx', 'index.html'],
      'Vue.js': ['src/main.js', 'src/main.ts', 'index.html'],
      'Angular': ['src/main.ts', 'src/index.html'],
      'Express.js': ['index.js', 'server.js', 'app.js', 'src/index.js'],
      'FastAPI': ['main.py', 'app.py', 'src/main.py'],
      'Django': ['manage.py', 'wsgi.py'],
      'Flask': ['app.py', 'main.py', 'run.py'],
      'Spring Boot': ['Application.java', 'Main.java'],
      'Laravel': ['index.php', 'public/index.php']
    };

    const possibleEntries = entryPoints[framework as keyof typeof entryPoints] || ['index.js', 'main.py', 'app.py'];
    
    for (const entry of possibleEntries) {
      if (fileNames.some(name => name.toLowerCase().includes(entry.toLowerCase()))) {
        return fileNames.find(name => name.toLowerCase().includes(entry.toLowerCase())) || entry;
      }
    }

    return fileNames[0] || 'main.js';
  }

  private generateCommands(framework: string): { buildCommand?: string; startCommand: string } {
    const commands = {
      'React': { buildCommand: 'npm run build', startCommand: 'npm start' },
      'Vue.js': { buildCommand: 'npm run build', startCommand: 'npm run serve' },
      'Angular': { buildCommand: 'npm run build', startCommand: 'npm start' },
      'Express.js': { startCommand: 'npm start' },
      'Node.js': { startCommand: 'node index.js' },
      'FastAPI': { startCommand: 'uvicorn main:app --host 0.0.0.0 --port 8080' },
      'Django': { startCommand: 'python manage.py runserver 0.0.0.0:8080' },
      'Flask': { startCommand: 'python app.py' },
      'Spring Boot': { buildCommand: 'mvn package', startCommand: 'java -jar target/*.jar' },
      'Laravel': { startCommand: 'php artisan serve --host=0.0.0.0 --port=8080' }
    };

    return commands[framework as keyof typeof commands] || { startCommand: 'echo "Unknown framework"' };
  }

  async analyzeProject(files: Array<{ name: string; content: string }>): Promise<ProjectAnalysis> {
    try {
      const { framework, confidence } = this.detectFramework(files);
      const dependencies = this.extractDependencies(files);
      const entryPoint = this.findEntryPoint(files, framework);
      const { buildCommand, startCommand } = this.generateCommands(framework);

      const issues: string[] = [];
      const recommendations: string[] = [];

      // Basic issue detection
      if (framework === 'Unknown') {
        issues.push('Could not detect framework automatically');
        recommendations.push('Add a package.json, requirements.txt, or other dependency file');
      }

      if (dependencies.length === 0) {
        issues.push('No dependencies found');
        recommendations.push('Ensure dependency files are included in your upload');
      }

      // Framework-specific recommendations
      if (framework.includes('React') || framework.includes('Vue') || framework.includes('Angular')) {
        recommendations.push('Consider using environment variables for API URLs');
        recommendations.push('Ensure build output is configured for production');
      }

      if (framework.includes('Python')) {
        recommendations.push('Include requirements.txt with exact versions');
        recommendations.push('Set up proper WSGI server for production');
      }

      return {
        framework,
        dependencies,
        entryPoint,
        buildCommand,
        startCommand,
        port: 8080,
        environmentVariables: ['PORT', 'NODE_ENV'],
        issues,
        recommendations,
        confidence
      };
    } catch (error) {
      throw new Error(`Failed to analyze project: ${(error as Error).message}`);
    }
  }

  async getDeploymentGuidance(
    framework: string, 
    targetServer: string, 
    issues: string[]
  ): Promise<DeploymentGuidance> {
    const steps: string[] = [
      'Upload and extract your project files',
      'Install dependencies',
      'Configure environment variables',
      'Build the application (if required)',
      'Start the application server',
      'Verify deployment is accessible'
    ];

    const commands: string[] = [];
    const configFiles: Array<{ filename: string; content: string }> = [];
    const warnings: string[] = [];

    // Generate framework-specific guidance
    if (framework.includes('Node') || framework.includes('React') || framework.includes('Express')) {
      commands.push('npm install');
      if (framework.includes('React')) {
        commands.push('npm run build');
      }
      commands.push('npm start');
      
      configFiles.push({
        filename: '.env',
        content: 'NODE_ENV=production\nPORT=8080\n'
      });
    }

    if (framework.includes('Python') || framework.includes('FastAPI') || framework.includes('Django')) {
      commands.push('pip install -r requirements.txt');
      if (framework.includes('FastAPI')) {
        commands.push('uvicorn main:app --host 0.0.0.0 --port 8080');
      } else if (framework.includes('Django')) {
        commands.push('python manage.py migrate');
        commands.push('python manage.py runserver 0.0.0.0:8080');
      }

      configFiles.push({
        filename: '.env',
        content: 'DEBUG=False\nALLOWED_HOSTS=*\n'
      });
    }

    // Add Replit-specific configuration
    if (targetServer === 'replit') {
      configFiles.push({
        filename: '.replit',
        content: `run = "${commands[commands.length - 1] || 'echo "Configure run command"'}"\n`
      });
      
      warnings.push('Ensure your app binds to 0.0.0.0 and uses PORT environment variable');
      warnings.push('Replit may restart your application periodically');
    }

    return {
      steps,
      configFiles,
      commands,
      warnings
    };
  }

  async chatWithAssistant(
    message: string, 
    context?: { project?: any; deployments?: any[] }
  ): Promise<string> {
    const lowerMessage = message.toLowerCase();

    // Project-specific responses
    if (context?.project) {
      const project = context.project;
      const deployments = context.deployments || [];
      
      if (lowerMessage.includes('status') || lowerMessage.includes('how is')) {
        const latestDeployment = deployments[0];
        let statusInfo = `Your ${project.framework || 'project'} "${project.name}" is currently ${project.status}.`;
        
        if (latestDeployment) {
          statusInfo += ` Latest deployment is ${latestDeployment.status}.`;
          if (latestDeployment.deploymentUrl) {
            statusInfo += ` Available at: ${latestDeployment.deploymentUrl}`;
          }
        }
        
        if (project.status === 'analyzed' && project.analysisResult) {
          const analysis = typeof project.analysisResult === 'string' 
            ? JSON.parse(project.analysisResult) 
            : project.analysisResult;
          statusInfo += `\n\nFramework: ${analysis.framework}\nConfidence: ${(analysis.confidence * 100).toFixed(0)}%`;
          
          if (analysis.issues && analysis.issues.length > 0) {
            statusInfo += `\nIssues found: ${analysis.issues.join(', ')}`;
          }
        }
        
        return statusInfo;
      }
      
      if (lowerMessage.includes('deploy') && project.status === 'analyzed') {
        return `Ready to deploy "${project.name}"! Based on analysis:\n• Framework: ${project.framework}\n• Build: ${project.buildCommand || 'Not required'}\n• Start: ${project.startCommand || 'Auto-detected'}\n\nClick "Create Deployment" to proceed.`;
      }
      
      if (lowerMessage.includes('issues') || lowerMessage.includes('problems')) {
        if (project.analysisResult) {
          const analysis = typeof project.analysisResult === 'string' 
            ? JSON.parse(project.analysisResult) 
            : project.analysisResult;
          
          if (analysis.issues && analysis.issues.length > 0) {
            return `Issues detected in "${project.name}":\n${analysis.issues.map((issue: string, i: number) => `${i + 1}. ${issue}`).join('\n')}\n\nRecommendations:\n${analysis.recommendations?.map((rec: string, i: number) => `${i + 1}. ${rec}`).join('\n') || 'No specific recommendations available.'}`;
          }
          return `No issues detected in "${project.name}". Project looks good for deployment!`;
        }
        return `Analysis pending for "${project.name}". Please wait for analysis to complete.`;
      }
    }

    // General help responses
    if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
      return "I can help you with:\n• Analyzing uploaded projects (ZIP files or folders)\n• Detecting frameworks and dependencies\n• Providing deployment guidance\n• Troubleshooting deployment issues\n• Generating configuration files\n• Monitoring deployment status\n\nJust ask me about any of these topics!";
    }

    if (lowerMessage.includes('analyze') || lowerMessage.includes('upload')) {
      return "Upload your project as a ZIP file or drag & drop a folder! I'll analyze it to:\n• Detect the framework (React, Python, Node.js, etc.)\n• Extract dependencies\n• Identify entry points\n• Generate build/start commands\n• Suggest deployment configurations\n\nSupported formats: ZIP files up to 100MB, or complete project folders.";
    }

    if (lowerMessage.includes('folder') || lowerMessage.includes('drag')) {
      return "Folder uploads now supported! You can:\n• Drag & drop entire project folders\n• Preserve directory structure\n• Upload multiple files at once\n• Get better analysis than ZIP files\n\nJust click 'Upload Folder' or drag your project folder to the upload area.";
    }

    if (lowerMessage.includes('deploy') || lowerMessage.includes('deployment')) {
      return "Deployment best practices:\n• Ensure your app binds to 0.0.0.0:8080\n• Include all dependency files (package.json, requirements.txt)\n• Set environment variables correctly\n• Use production-ready server configurations\n• Test locally before deploying\n\nI'll analyze your project and provide specific deployment guidance!";
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('fail') || lowerMessage.includes('broken')) {
      return "Common deployment issues:\n• Port binding: Use 0.0.0.0:8080, not localhost\n• Dependencies: Ensure package.json/requirements.txt is complete\n• Environment variables: Check all required vars are set\n• File permissions: Verify execute permissions on scripts\n• Build process: Make sure build completes successfully\n\nShare your error logs for specific troubleshooting!";
    }

    if (lowerMessage.includes('config') || lowerMessage.includes('setup') || lowerMessage.includes('replit')) {
      return "I can generate configuration files for your deployment:\n• .replit file for Replit deployment\n• .env for environment variables\n• Dockerfile for containerization\n• package.json scripts optimization\n• Server configuration files\n\nUpload your project and I'll create the necessary configs automatically!";
    }

    if (lowerMessage.includes('framework') || lowerMessage.includes('detect')) {
      return "I can detect these frameworks:\n• JavaScript: React, Vue, Angular, Node.js, Express, Next.js\n• Python: FastAPI, Django, Flask\n• Java: Spring Boot\n• PHP: Laravel\n• And more!\n\nDetection is based on dependency files, imports, and project structure.";
    }

    if (lowerMessage.includes('tutorial') || lowerMessage.includes('guide') || lowerMessage.includes('how to')) {
      return "Complete deployment guides available:\n• Check DEPLOYMENT_TUTORIAL.md for step-by-step instructions\n• BACKEND_CODE_TUTORIAL.md explains the architecture\n• Each analyzed project gets custom deployment guidance\n\nWhat specific aspect would you like help with?";
    }

    return "I'm your deployment assistant! I can analyze projects, detect frameworks, provide deployment guidance, and troubleshoot issues. Upload a project to get started, or ask me about:\n• Project analysis\n• Framework detection\n• Deployment best practices\n• Error troubleshooting\n• Configuration generation\n\nWhat would you like help with?";
  }

  async debugDeploymentError(errorLogs: string, framework: string): Promise<string> {
    const lowerLogs = errorLogs.toLowerCase();

    if (lowerLogs.includes('port') || lowerLogs.includes('eaddrinuse')) {
      return `Port binding issue detected. For ${framework}, ensure you're using:\n• Host: 0.0.0.0 (not localhost)\n• Port: process.env.PORT || 8080\n• Check if another process is using the port`;
    }

    if (lowerLogs.includes('module not found') || lowerLogs.includes('modulenotfounderror')) {
      return `Missing dependencies detected. Try:\n• npm install (for Node.js projects)\n• pip install -r requirements.txt (for Python)\n• Verify all dependencies are listed in package.json/requirements.txt`;
    }

    if (lowerLogs.includes('permission') || lowerLogs.includes('eacces')) {
      return `Permission error detected. This usually means:\n• File permissions are incorrect\n• Trying to bind to privileged port (<1024)\n• Missing execution permissions on scripts`;
    }

    if (lowerLogs.includes('syntax') || lowerLogs.includes('syntaxerror')) {
      return `Syntax error in your code. Check:\n• File encoding (should be UTF-8)\n• Code syntax matches the framework version\n• No missing brackets, quotes, or semicolons`;
    }

    return `Deployment error analysis for ${framework}:\n• Check application logs for specific error messages\n• Verify environment variables are set correctly\n• Ensure all files were uploaded properly\n• Test the application locally first`;
  }
}

export const aiAssistant = new AIAssistant();
