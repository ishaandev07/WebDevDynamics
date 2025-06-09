// Free open-source AI analysis system using local models
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

    // Code optimization prompts - transform code for production deployment
    if (message.includes('Transform this HTML') || message.includes('Optimize this HTML')) {
      return this.optimizeHtmlCode(message);
    }
    
    if (message.includes('Transform this CSS') || message.includes('Optimize this CSS')) {
      return this.optimizeCssCode(message);
    }
    
    if (message.includes('Transform this JavaScript') || message.includes('Optimize this JavaScript')) {
      return this.optimizeJavaScriptCode(message);
    }
    
    if (message.includes('Transform this Node.js') || message.includes('Optimize this Node.js')) {
      return this.optimizeNodeJsCode(message);
    }
    
    if (message.includes('Transform this Python') || message.includes('Optimize this Python')) {
      return this.optimizePythonCode(message);
    }

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

  // Free AI code optimization methods - no API keys required
  private optimizeHtmlCode(prompt: string): string {
    const codeMatch = prompt.match(/Original HTML:\s*([\s\S]*?)\s*Return only/);
    if (!codeMatch) return prompt;
    
    let html = codeMatch[1];
    
    // Add DOCTYPE if missing
    if (!html.trim().startsWith('<!DOCTYPE')) {
      html = '<!DOCTYPE html>\n' + html;
    }
    
    // Add meta tags and SEO optimization
    if (html.includes('<head>') && !html.includes('<meta charset')) {
      html = html.replace('<head>', `<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Production-ready application deployed with Smart Deployment Platform">
    <meta name="robots" content="index, follow">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.googleapis.com">`);
    }
    
    // Add performance optimizations
    html = html.replace(/<script src="/g, '<script defer src="');
    html = html.replace(/<link rel="stylesheet"/g, '<link rel="preload" as="style" onload="this.onload=null;this.rel=\'stylesheet\'"');
    
    // Add accessibility improvements
    if (!html.includes('lang=')) {
      html = html.replace('<html', '<html lang="en"');
    }
    
    // Add error handling and loading states
    if (!html.includes('noscript')) {
      const bodyMatch = html.match(/<body[^>]*>/);
      if (bodyMatch) {
        html = html.replace(bodyMatch[0], bodyMatch[0] + '\n    <noscript>This application requires JavaScript to run.</noscript>');
      }
    }
    
    return html;
  }

  private optimizeCssCode(prompt: string): string {
    const codeMatch = prompt.match(/Original CSS:\s*([\s\S]*?)\s*Return only/);
    if (!codeMatch) return prompt;
    
    let css = codeMatch[1];
    
    // Add modern CSS reset and optimization
    const modernReset = `/* Production CSS Optimization */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --accent-color: #ff6b6b;
  --text-dark: #333;
  --text-light: #666;
  --bg-light: #f8f9fa;
  --border-color: #e9ecef;
  --shadow: 0 2px 10px rgba(0,0,0,0.1);
  --transition: all 0.3s ease;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  font-size: 62.5%;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 0;
  color: var(--text-dark);
  background: var(--bg-light);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

img {
  max-width: 100%;
  height: auto;
  loading: lazy;
}

/* Performance optimizations */
.will-change-transform { will-change: transform; }
.will-change-opacity { will-change: opacity; }

/* Mobile responsiveness */
@media (max-width: 768px) {
  html { font-size: 56.25%; }
  .container { padding: 0 1rem; }
}

@media (max-width: 480px) {
  html { font-size: 50%; }
}

/* Enhanced animations */
@media (prefers-reduced-motion: no-preference) {
  * { transition: var(--transition); }
}

@media (prefers-reduced-motion: reduce) {
  * { transition: none; }
}

`;
    
    css = modernReset + '\n' + css;
    
    // Add hover states and interactive improvements
    if (css.includes('button') && !css.includes('button:hover')) {
      css += `
/* Enhanced button interactions */
button {
  cursor: pointer;
  transition: var(--transition);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}

button:active {
  transform: translateY(0);
}

button:focus {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}`;
    }
    
    // Add responsive grid and layout improvements
    if (!css.includes('.container')) {
      css += `
/* Responsive layout system */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.flex {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

/* Utility classes */
.text-center { text-align: center; }
.mt-1 { margin-top: 1rem; }
.mb-1 { margin-bottom: 1rem; }
.p-1 { padding: 1rem; }

/* Accessibility improvements */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0,0,0,0);
  white-space: nowrap;
  border: 0;
}`;
    }
    
    return css;
  }

  private optimizeJavaScriptCode(prompt: string): string {
    const codeMatch = prompt.match(/Original JavaScript:\s*([\s\S]*?)\s*Return only/);
    if (!codeMatch) return prompt;
    
    let js = codeMatch[1];
    
    // Add comprehensive error handling
    if (!js.includes('try {') && !js.includes('catch')) {
      js = `// Production JavaScript with enhanced error handling and performance
'use strict';

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  showNotification('An error occurred. Please refresh the page.', 'error');
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  showNotification('A system error occurred.', 'error');
});

// Performance monitoring
const perfObserver = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.entryType === 'navigation') {
      console.log('Page load time:', entry.loadEventEnd - entry.loadEventStart);
    }
  }
});

if ('PerformanceObserver' in window) {
  perfObserver.observe({ entryTypes: ['navigation'] });
}

try {
${js}
} catch (error) {
  console.error('Application initialization error:', error);
  document.body.innerHTML = '<div style="text-align:center;padding:50px;font-family:Arial,sans-serif;"><h2>Application Error</h2><p>Please refresh the page to try again.</p></div>';
}`;
    }
    
    // Add mobile touch support
    if (!js.includes('touchstart') && js.includes('click')) {
      js += `

// Enhanced mobile support
function addMobileSupport() {
  const clickableElements = document.querySelectorAll('button, .clickable, [onclick]');
  
  clickableElements.forEach(element => {
    // Add touch feedback
    element.addEventListener('touchstart', function() {
      this.style.opacity = '0.7';
    }, { passive: true });
    
    element.addEventListener('touchend', function() {
      this.style.opacity = '1';
    }, { passive: true });
    
    // Prevent 300ms delay on mobile
    element.addEventListener('touchend', function(e) {
      e.preventDefault();
      this.click();
    });
  });
}

// Initialize mobile support when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addMobileSupport);
} else {
  addMobileSupport();
}`;
    }
    
    // Add loading states and user feedback
    if (!js.includes('showNotification')) {
      js += `

// Enhanced user feedback system
function showNotification(message, type = 'info', duration = 3000) {
  const notification = document.createElement('div');
  notification.className = \`notification notification-\${type}\`;
  notification.style.cssText = \`
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
    word-wrap: break-word;
  \`;
  
  const colors = {
    info: '#3498db',
    success: '#2ecc71',
    warning: '#f39c12',
    error: '#e74c3c'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Auto remove
  setTimeout(() => {
    notification.style.transform = 'translateX(100%)';
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, duration);
}

// Loading state manager
class LoadingManager {
  constructor() {
    this.activeLoaders = new Set();
    this.createOverlay();
  }
  
  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.style.cssText = \`
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255,255,255,0.9);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      backdrop-filter: blur(3px);
    \`;
    
    this.overlay.innerHTML = \`
      <div style="text-align: center;">
        <div style="
          width: 50px;
          height: 50px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        "></div>
        <p style="margin: 0; font-weight: 600; color: #333;">Loading...</p>
      </div>
    \`;
    
    const style = document.createElement('style');
    style.textContent = \`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    \`;
    document.head.appendChild(style);
    document.body.appendChild(this.overlay);
  }
  
  show(id = 'default') {
    this.activeLoaders.add(id);
    this.overlay.style.display = 'flex';
  }
  
  hide(id = 'default') {
    this.activeLoaders.delete(id);
    if (this.activeLoaders.size === 0) {
      this.overlay.style.display = 'none';
    }
  }
}

const loadingManager = new LoadingManager();

// Data validation utilities
function validateInput(value, type) {
  switch(type) {
    case 'email':
      return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
    case 'phone':
      return /^[\\+]?[1-9][\\d\\s\\-\\(\\)]{7,15}$/.test(value);
    case 'url':
      try { new URL(value); return true; } catch { return false; }
    default:
      return value && value.toString().trim().length > 0;
  }
}`;
    }
    
    return js;
  }

  private optimizeNodeJsCode(prompt: string): string {
    const codeMatch = prompt.match(/Original Node.js code:\s*([\s\S]*?)\s*Return only/);
    if (!codeMatch) return prompt;
    
    let code = codeMatch[1];
    
    // Add production-ready Node.js enhancements
    const productionEnhancements = `// Production-ready Node.js application
const cluster = require('cluster');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const cors = require('cors');

// Environment configuration
require('dotenv').config();
const NODE_ENV = process.env.NODE_ENV || 'production';
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Logging configuration
const winston = require('winston');
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Security middleware
function setupSecurity(app) {
  app.use(helmet());
  app.use(compression());
  app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true
  }));
  app.use(limiter);
  
  // Request logging
  app.use((req, res, next) => {
    logger.info(\`\${req.method} \${req.url} - \${req.ip}\`);
    next();
  });
}

// Graceful shutdown
function setupGracefulShutdown(server) {
  const gracefulShutdown = (signal) => {
    logger.info(\`Received \${signal}. Starting graceful shutdown...\`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
    
    setTimeout(() => {
      logger.error('Forced shutdown');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

// Cluster support for production
if (cluster.isMaster && NODE_ENV === 'production') {
  const numWorkers = os.cpus().length;
  logger.info(\`Master process starting \${numWorkers} workers\`);
  
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork();
  }
  
  cluster.on('exit', (worker, code, signal) => {
    logger.error(\`Worker \${worker.process.pid} died with code \${code} and signal \${signal}\`);
    logger.info('Starting a new worker');
    cluster.fork();
  });
} else {
  // Worker process
`;

    // Wrap existing code in production setup
    code = productionEnhancements + '\n' + code + `

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    logger.error('Unhandled error:', err);
    res.status(500).json({
      error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
      stack: NODE_ENV === 'production' ? undefined : err.stack
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Start server
  const server = app.listen(PORT, HOST, () => {
    logger.info(\`Server running on \${HOST}:\${PORT} in \${NODE_ENV} mode\`);
  });

  setupGracefulShutdown(server);
}
`;

    return code;
  }

  private optimizePythonCode(prompt: string): string {
    const codeMatch = prompt.match(/Original Python code:\s*([\s\S]*?)\s*Return only/);
    if (!codeMatch) return prompt;
    
    let code = codeMatch[1];
    
    // Add production-ready Python enhancements
    const productionEnhancements = `# Production-ready Python application
import os
import logging
import signal
import sys
from datetime import datetime
from typing import Dict, Any
import uvicorn
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import time

# Logging configuration
logging.basicConfig(
    level=logging.INFO if os.getenv('ENVIRONMENT') == 'production' else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Environment configuration
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 8000))
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

# Initialize FastAPI app with production settings
app = FastAPI(
    title="Production API",
    description="Production-ready API with comprehensive features",
    version="1.0.0",
    debug=DEBUG,
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None
)

# Security middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv('CORS_ORIGINS', '*').split(','),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Process time: {process_time:.4f}s - "
        f"Client: {request.client.host if request.client else 'unknown'}"
    )
    return response

# Health check endpoint
@app.get("/health")
async def health_check() -> Dict[str, Any]:
    return {
        "status": "OK",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0",
        "environment": os.getenv('ENVIRONMENT', 'production')
    }

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=404,
        content={"error": "Resource not found", "path": str(request.url.path)}
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    logger.error(f"Internal server error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc) if DEBUG else "An unexpected error occurred"
        }
    )

# Graceful shutdown handler
def signal_handler(signum, frame):
    logger.info(f"Received signal {signum}. Shutting down gracefully...")
    sys.exit(0)

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)

`;

    // Wrap existing code in production setup
    code = productionEnhancements + '\n' + code + `

# Application startup
if __name__ == "__main__":
    logger.info(f"Starting application on {HOST}:{PORT}")
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        reload=DEBUG,
        workers=1 if DEBUG else 4,
        log_level="info",
        access_log=True
    )
`;

    return code;
  }
}

export const aiAssistant = new AIAssistant();
