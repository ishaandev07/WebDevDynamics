# Smart Deployment Dashboard - API Documentation

## Overview
The Smart Deployment Dashboard provides a comprehensive REST API for managing projects, deployments, and AI-assisted analysis. All endpoints require authentication via Replit OpenID Connect.

## Base URL
```
https://your-domain.replit.app/api
```

## Authentication

### Authentication Flow
1. Navigate to `/api/login` to initiate OAuth flow
2. User authenticates with Replit
3. Callback to `/api/callback` establishes session
4. Session cookie automatically included in subsequent requests
5. Navigate to `/api/logout` to terminate session

### Authentication Endpoints

#### GET /api/login
Initiates Replit OAuth authentication flow.
```http
GET /api/login
```
**Response:** Redirects to Replit authentication page

#### GET /api/callback
OAuth callback endpoint (handled automatically).
```http
GET /api/callback?code=...&state=...
```
**Response:** Redirects to application dashboard

#### GET /api/logout
Terminates user session and logs out.
```http
GET /api/logout
```
**Response:** Redirects to Replit logout page

#### GET /api/auth/user
Returns current authenticated user information.
```http
GET /api/auth/user
```
**Response:**
```json
{
  "id": "43504263",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://replit.com/public/images/user.png",
  "createdAt": "2024-06-09T10:30:00.000Z",
  "updatedAt": "2024-06-09T10:30:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized`: User not logged in

## Project Management

### GET /api/projects
Retrieves all projects for the authenticated user.
```http
GET /api/projects
```
**Response:**
```json
[
  {
    "id": 1,
    "userId": "43504263",
    "name": "My React App",
    "description": "A sample React application",
    "fileName": "react-app-1234567890.zip",
    "fileSize": 2048576,
    "status": "analyzed",
    "framework": "React",
    "buildCommand": "npm run build",
    "startCommand": "npm start",
    "environmentVariables": null,
    "analysisResult": "{\"framework\":\"React\",\"confidence\":95,\"dependencies\":[\"react\",\"react-dom\"]}",
    "createdAt": "2024-06-09T10:30:00.000Z",
    "updatedAt": "2024-06-09T10:35:00.000Z"
  }
]
```

### POST /api/projects
Creates a new project by uploading a file.
```http
POST /api/projects
Content-Type: multipart/form-data

file: [ZIP file or folder]
name: "Project Name"
description: "Optional project description"
```

**Response:**
```json
{
  "id": 2,
  "userId": "43504263",
  "name": "New Project",
  "description": "Project description",
  "fileName": "project-1234567890.zip",
  "fileSize": 1024000,
  "status": "uploaded",
  "framework": null,
  "buildCommand": null,
  "startCommand": null,
  "environmentVariables": null,
  "analysisResult": null,
  "createdAt": "2024-06-09T11:00:00.000Z",
  "updatedAt": "2024-06-09T11:00:00.000Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file format or missing required fields
- `413 Payload Too Large`: File size exceeds limit

### GET /api/projects/:id
Retrieves a specific project by ID.
```http
GET /api/projects/1
```
**Response:**
```json
{
  "id": 1,
  "userId": "43504263",
  "name": "My React App",
  "description": "A sample React application",
  "fileName": "react-app-1234567890.zip",
  "fileSize": 2048576,
  "status": "analyzed",
  "framework": "React",
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "environmentVariables": null,
  "analysisResult": "{\"framework\":\"React\",\"confidence\":95,\"dependencies\":[\"react\",\"react-dom\"],\"entryPoint\":\"src/index.js\",\"issues\":[],\"recommendations\":[\"Consider adding TypeScript\"]}",
  "createdAt": "2024-06-09T10:30:00.000Z",
  "updatedAt": "2024-06-09T10:35:00.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Project not found or not owned by user

### PUT /api/projects/:id
Updates a specific project.
```http
PUT /api/projects/1
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description",
  "buildCommand": "npm run build:prod",
  "startCommand": "npm run start:prod"
}
```
**Response:** Updated project object (same format as GET)

### DELETE /api/projects/:id
Deletes a specific project.
```http
DELETE /api/projects/1
```
**Response:**
```json
{
  "message": "Project deleted successfully"
}
```

### POST /api/projects/:id/analyze
Triggers re-analysis of a project.
```http
POST /api/projects/1/analyze
```
**Response:**
```json
{
  "message": "Analysis started",
  "projectId": 1
}
```

### GET /api/projects/:id/deployment-guide
Generates deployment guidance for a project.
```http
GET /api/projects/1/deployment-guide
```
**Response:**
```json
{
  "guide": "# Deployment Guide for React Project\n\n## Prerequisites\n- Node.js 18 or higher\n- npm or yarn package manager\n\n## Steps\n1. Install dependencies: `npm install`\n2. Build the project: `npm run build`\n3. Start the server: `npm start`\n\n## Environment Variables\n- PORT: Application port (default: 3000)\n- NODE_ENV: Set to 'production' for production builds"
}
```

## Deployment Management

### GET /api/deployments
Retrieves all deployments for the authenticated user.
```http
GET /api/deployments
```
**Response:**
```json
[
  {
    "id": 1,
    "projectId": 1,
    "userId": "43504263",
    "status": "success",
    "targetServer": "replit",
    "deploymentUrl": "https://my-app.replit.app",
    "errorMessage": null,
    "logs": "Build completed successfully\nDeployment URL: https://my-app.replit.app",
    "createdAt": "2024-06-09T11:00:00.000Z",
    "updatedAt": "2024-06-09T11:05:00.000Z"
  }
]
```

### POST /api/deployments
Creates a new deployment for a project.
```http
POST /api/deployments
Content-Type: application/json

{
  "projectId": 1,
  "targetServer": "replit"
}
```
**Response:**
```json
{
  "id": 2,
  "projectId": 1,
  "userId": "43504263",
  "status": "pending",
  "targetServer": "replit",
  "deploymentUrl": null,
  "errorMessage": null,
  "logs": null,
  "createdAt": "2024-06-09T12:00:00.000Z",
  "updatedAt": "2024-06-09T12:00:00.000Z"
}
```

### GET /api/deployments/:id
Retrieves a specific deployment by ID.
```http
GET /api/deployments/1
```
**Response:** Single deployment object (same format as array item above)

### GET /api/deployments/:id/logs
Retrieves real-time logs for a deployment.
```http
GET /api/deployments/1/logs
```
**Response:**
```json
{
  "logs": "Starting deployment process...\nExtracting project files...\nInstalling dependencies...\nnpm install completed\nBuilding project...\nnpm run build completed\nStarting application server...\nApplication started on port 8080\nDeployment completed successfully\nDeployment URL: https://my-app.replit.app"
}
```

### GET /api/deployments/:id/status
Retrieves current status of a deployment.
```http
GET /api/deployments/1/status
```
**Response:**
```json
{
  "status": "success",
  "progress": 100,
  "currentStep": "completed",
  "deploymentUrl": "https://my-app.replit.app"
}
```

**Status Values:**
- `pending`: Deployment queued
- `building`: Installation and build in progress
- `success`: Deployment completed successfully
- `failed`: Deployment failed
- `cancelled`: Deployment manually cancelled

### POST /api/deployments/:id/retry
Retries a failed deployment.
```http
POST /api/deployments/1/retry
```
**Response:**
```json
{
  "message": "Deployment retry initiated",
  "deploymentId": 1
}
```

## AI Chat Assistant

### GET /api/chat
Retrieves chat message history for the user.
```http
GET /api/chat?projectId=1
```
**Query Parameters:**
- `projectId` (optional): Filter messages for specific project

**Response:**
```json
[
  {
    "id": 1,
    "userId": "43504263",
    "projectId": 1,
    "role": "user",
    "content": "How do I fix the build error?",
    "createdAt": "2024-06-09T10:30:00.000Z"
  },
  {
    "id": 2,
    "userId": "43504263",
    "projectId": 1,
    "role": "assistant",
    "content": "Based on your React project analysis, the build error is likely due to missing dependencies. Try running `npm install` to ensure all packages are properly installed.",
    "createdAt": "2024-06-09T10:30:15.000Z"
  }
]
```

### POST /api/chat
Sends a message to the AI assistant.
```http
POST /api/chat
Content-Type: application/json

{
  "message": "How do I deploy my React app?",
  "projectId": 1
}
```
**Response:**
```json
{
  "id": 3,
  "userId": "43504263",
  "projectId": 1,
  "role": "assistant",
  "content": "To deploy your React app, follow these steps:\n\n1. Ensure your project is analyzed and shows 'React' as the framework\n2. Review the generated deployment configuration\n3. Click 'Deploy Project' on your project details page\n4. Monitor the deployment progress in real-time\n\nYour React app will be automatically built using `npm run build` and started with `npm start`. The system will provide a live URL once deployment is complete.",
  "createdAt": "2024-06-09T10:31:00.000Z"
}
```

## Statistics and Analytics

### GET /api/stats
Retrieves user statistics and analytics.
```http
GET /api/stats
```
**Response:**
```json
{
  "totalProjects": 5,
  "successfulDeployments": 3,
  "failedDeployments": 1,
  "inProgressDeployments": 1
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `413 Payload Too Large`: File size exceeds limit
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

### Authentication Errors
All protected endpoints return `401 Unauthorized` when:
- User is not logged in
- Session has expired
- Invalid authentication token

**Example:**
```json
{
  "message": "Unauthorized"
}
```

## Rate Limiting
API requests are rate-limited to prevent abuse:
- **Upload endpoints**: 10 requests per minute
- **Analysis endpoints**: 20 requests per minute
- **Chat endpoints**: 30 requests per minute
- **Other endpoints**: 100 requests per minute

When rate limit is exceeded:
```json
{
  "message": "Too many requests",
  "retryAfter": 60
}
```

## File Upload Specifications

### Supported File Types
- **ZIP Files**: `.zip` archives containing project code
- **Folder Uploads**: Direct folder selection (browser-dependent)

### File Size Limits
- Maximum single file: 50 MB
- Maximum extracted size: 100 MB
- Maximum files per project: 1000

### File Processing
1. **Upload**: File saved to secure storage
2. **Extraction**: ZIP contents extracted and analyzed
3. **Filtering**: Excludes `node_modules`, `.git`, `dist`, `build` directories
4. **Analysis**: Text files scanned for framework detection
5. **Cleanup**: Temporary files removed after processing

## Framework Detection Details

### Supported Frameworks
| Framework | Detection Method | Confidence Factors |
|-----------|------------------|-------------------|
| React | package.json dependencies, JSX files | react, react-dom packages |
| Vue.js | package.json dependencies, .vue files | vue, @vue packages |
| Angular | angular.json, package.json | @angular packages |
| Next.js | next.config.js, package.json | next package |
| Express.js | package.json dependencies | express package |
| FastAPI | Python files, requirements.txt | fastapi, uvicorn imports |
| Spring Boot | pom.xml, build.gradle | spring-boot dependencies |
| Python | .py files, requirements.txt | Python file extensions |

### Analysis Results
```json
{
  "framework": "React",
  "confidence": 95,
  "dependencies": ["react", "react-dom", "react-scripts"],
  "entryPoint": "src/index.js",
  "buildCommand": "npm run build",
  "startCommand": "npm start",
  "port": 3000,
  "environmentVariables": ["PORT", "NODE_ENV"],
  "issues": [],
  "recommendations": [
    "Consider adding TypeScript for better type safety",
    "Add error boundary components for better error handling"
  ]
}
```

## Integration Examples

### JavaScript/TypeScript Client
```javascript
class DeploymentDashboardAPI {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
  }

  async uploadProject(file, name, description) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) formData.append('description', description);

    const response = await fetch(`${this.baseURL}/projects`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getProjects() {
    const response = await fetch(`${this.baseURL}/projects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    return response.json();
  }

  async deployProject(projectId) {
    const response = await fetch(`${this.baseURL}/deployments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, targetServer: 'replit' }),
    });

    if (!response.ok) {
      throw new Error(`Deployment failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getDeploymentLogs(deploymentId) {
    const response = await fetch(`${this.baseURL}/deployments/${deploymentId}/logs`);
    if (!response.ok) {
      throw new Error(`Failed to fetch logs: ${response.statusText}`);
    }
    return response.json();
  }

  async chatWithAssistant(message, projectId = null) {
    const response = await fetch(`${this.baseURL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, projectId }),
    });

    if (!response.ok) {
      throw new Error(`Chat failed: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage example
const api = new DeploymentDashboardAPI();

// Upload a project
const fileInput = document.querySelector('#file-input');
const file = fileInput.files[0];
const project = await api.uploadProject(file, 'My App', 'Description');

// Deploy the project
const deployment = await api.deployProject(project.id);

// Monitor deployment logs
const logs = await api.getDeploymentLogs(deployment.id);
console.log(logs.logs);
```

### Python Client
```python
import requests
import json

class DeploymentDashboardAPI:
    def __init__(self, base_url='/api'):
        self.base_url = base_url
        self.session = requests.Session()
    
    def upload_project(self, file_path, name, description=None):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'name': name}
            if description:
                data['description'] = description
            
            response = self.session.post(
                f'{self.base_url}/projects',
                files=files,
                data=data
            )
            response.raise_for_status()
            return response.json()
    
    def get_projects(self):
        response = self.session.get(f'{self.base_url}/projects')
        response.raise_for_status()
        return response.json()
    
    def deploy_project(self, project_id):
        data = {'projectId': project_id, 'targetServer': 'replit'}
        response = self.session.post(
            f'{self.base_url}/deployments',
            json=data
        )
        response.raise_for_status()
        return response.json()
    
    def get_deployment_logs(self, deployment_id):
        response = self.session.get(
            f'{self.base_url}/deployments/{deployment_id}/logs'
        )
        response.raise_for_status()
        return response.json()

# Usage example
api = DeploymentDashboardAPI()

# Upload project
project = api.upload_project('my-app.zip', 'My Python App')

# Deploy project
deployment = api.deploy_project(project['id'])

# Get logs
logs = api.get_deployment_logs(deployment['id'])
print(logs['logs'])
```

## WebSocket Support (Future Enhancement)
Real-time features are currently implemented via polling. WebSocket support for live updates is planned for future releases:

```javascript
// Planned WebSocket API
const ws = new WebSocket('wss://your-domain.replit.app/ws');

ws.on('deployment-update', (data) => {
  console.log('Deployment status:', data.status);
  console.log('Progress:', data.progress);
});

ws.on('log-update', (data) => {
  console.log('New log entry:', data.message);
});
```

## Changelog and Versioning
API versioning follows semantic versioning. Current version: `v1.0.0`

### Version History
- **v1.0.0** (2024-06-09): Initial API release
  - Project management endpoints
  - Deployment orchestration
  - AI assistant integration
  - Real-time monitoring

### Breaking Changes
No breaking changes in current version. Future breaking changes will be communicated with advance notice and migration guides.

## Support and Resources
- **Technical Documentation**: See `TECHNICAL_ADMIN_GUIDE.md`
- **User Guide**: See `COMPLETE_USER_GUIDE.md`
- **Deployment Guide**: See `DEPLOYMENT_TUTORIAL.md`
- **Issue Reporting**: Use the AI chat assistant for immediate help