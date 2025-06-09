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
    // Simple rule-based responses
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('analyze') || lowerMessage.includes('upload')) {
      return "I can help analyze your uploaded projects! Upload a .zip file and I'll detect the framework, dependencies, and provide deployment recommendations.";
    }

    if (lowerMessage.includes('deploy') || lowerMessage.includes('deployment')) {
      return "For deployment, I recommend:\n1. Ensure your app binds to 0.0.0.0 and port 8080\n2. Include all dependency files\n3. Set environment variables properly\n4. Test locally before deploying";
    }

    if (lowerMessage.includes('error') || lowerMessage.includes('fail')) {
      return "Common deployment issues:\n• Port binding problems - use 0.0.0.0:8080\n• Missing dependencies - check package.json/requirements.txt\n• Environment variables not set\n• File permissions issues";
    }

    if (lowerMessage.includes('config') || lowerMessage.includes('setup')) {
      return "I can generate configuration files for your deployment. Upload your project and I'll create the necessary .replit, .env, and other config files automatically.";
    }

    if (context?.project) {
      return `Your ${context.project.framework || 'project'} "${context.project.name}" is currently ${context.project.status}. You can view deployment status in the deployments section.`;
    }

    return "I'm here to help with your deployment needs! I can analyze code, suggest configurations, and troubleshoot deployment issues. What would you like help with?";
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
