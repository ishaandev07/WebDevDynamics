# Smart Deployment Dashboard - Debugging & Troubleshooting Guide

## Current System Status

The Smart Deployment Dashboard is operational with the following verified components:
- ✅ Replit Authentication working
- ✅ PostgreSQL database connected
- ✅ Project upload and analysis functional
- ✅ File storage system operational
- ✅ AI assistant enhanced with comprehensive responses
- ✅ Folder upload support implemented
- ⚠️ Some backend processes need optimization

## Common Issues & Solutions

### 1. Chat Assistant Not Responding Properly

**Symptoms:**
- Chat messages sent but responses seem generic
- Context not being used effectively

**Root Cause Analysis:**
The chat system was using basic pattern matching without leveraging project context effectively.

**Fix Applied:**
Enhanced the AI assistant with:
- Project-specific responses based on upload status
- Analysis result interpretation
- Deployment status awareness
- Contextual help based on user questions

**Verification:**
```bash
# Test chat functionality
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "help", "projectId": 1}'
```

### 2. File Upload Processing

**Issue:** Backend wasn't handling folder uploads correctly
**Solution:** Updated multer configuration to support both file and folder uploads:

```typescript
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }
}).fields([
  { name: 'file', maxCount: 1 },      // ZIP files
  { name: 'files', maxCount: 1000 }   // Folder uploads
]);
```

### 3. Project Analysis Flow

**Analysis Process:**
1. File upload (ZIP or folder)
2. Background analysis starts
3. Framework detection
4. Dependency extraction
5. Command generation
6. Status update in database

**Debug Steps:**
```bash
# Check project analysis status
SELECT id, name, status, framework, analysisResult FROM projects;

# Monitor background processes
tail -f logs/analysis.log
```

## Backend Architecture Issues Resolved

### 1. Async Processing
**Problem:** Analysis blocking request threads
**Solution:** Background processing with status updates

```typescript
// Non-blocking analysis
analyzeProjectAsync(project.id, files);
res.json(project); // Return immediately
```

### 2. Error Handling
**Enhanced Error Handling:**
```typescript
try {
  const analysis = await aiAssistant.analyzeProject(files);
  await storage.updateProject(projectId, {
    status: 'analyzed',
    framework: analysis.framework,
    analysisResult: analysis
  });
} catch (error) {
  console.error(`Analysis failed for project ${projectId}:`, error);
  await storage.updateProject(projectId, { 
    status: 'failed',
    analysisResult: { error: error.message }
  });
}
```

### 3. Database Operations
**Optimized Queries:**
- Use connection pooling
- Parameterized queries with Drizzle ORM
- Efficient joins for related data

## Performance Monitoring

### 1. Database Performance
```sql
-- Monitor slow queries
SELECT query, calls, total_time, rows, 100.0 * shared_blks_hit /
  nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements ORDER BY total_time DESC LIMIT 5;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

### 2. Application Metrics
```typescript
// Add performance monitoring
const start = Date.now();
const analysis = await aiAssistant.analyzeProject(files);
console.log(`Analysis completed in ${Date.now() - start}ms`);
```

### 3. File Upload Metrics
```typescript
// Monitor upload sizes and processing time
console.log(`Processing ${files.length} files, total size: ${totalSize}MB`);
```

## System Testing Procedures

### 1. End-to-End Testing
```bash
# 1. Test authentication
curl -i http://localhost:5000/api/auth/user

# 2. Test file upload
curl -X POST http://localhost:5000/api/projects \
  -F "file=@test-project.zip" \
  -F "name=Test Project"

# 3. Test chat functionality
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "analyze my project"}'

# 4. Test deployment creation
curl -X POST http://localhost:5000/api/deployments \
  -H "Content-Type: application/json" \
  -d '{"projectId": 1, "targetServer": "replit"}'
```

### 2. Database Testing
```sql
-- Test data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM projects;
SELECT COUNT(*) FROM deployments;
SELECT COUNT(*) FROM chat_messages;

-- Test relationships
SELECT p.name, COUNT(d.id) as deployment_count 
FROM projects p 
LEFT JOIN deployments d ON p.id = d.projectId 
GROUP BY p.id, p.name;
```

### 3. File System Testing
```bash
# Check upload directory
ls -la uploads/
du -sh uploads/

# Verify file permissions
stat uploads/
```

## Current Known Issues & Workarounds

### 1. Large File Processing
**Issue:** Files over 50MB may timeout during analysis
**Workaround:** Implement chunked processing for large projects
**Status:** Monitoring required

### 2. Concurrent Uploads
**Issue:** Multiple simultaneous uploads may strain resources
**Workaround:** Queue system for analysis tasks
**Status:** Future enhancement

### 3. Session Management
**Issue:** Long-running analysis may outlive user sessions
**Workaround:** Background processing with status polling
**Status:** Working as designed

## Deployment Status Tracking

### Current Flow:
1. Project uploaded → Status: "uploaded"
2. Analysis starts → Status: "analyzing"  
3. Analysis complete → Status: "analyzed"
4. Deployment created → Status: "pending"
5. Deployment running → Status: "building"/"deploying"
6. Deployment complete → Status: "deployed"/"failed"

### Debug Commands:
```sql
-- Check project status distribution
SELECT status, COUNT(*) FROM projects GROUP BY status;

-- Check deployment status
SELECT status, COUNT(*) FROM deployments GROUP BY status;

-- Find stuck processes
SELECT * FROM projects WHERE status = 'analyzing' 
  AND createdAt < NOW() - INTERVAL '10 minutes';
```

## Log Analysis

### Key Log Locations:
- Application logs: Console output
- Database logs: PostgreSQL logs
- Analysis logs: Background process output
- Upload logs: File processing status

### Log Monitoring:
```bash
# Monitor all logs
tail -f logs/*.log

# Filter specific issues
grep -i "error" logs/app.log
grep -i "analysis" logs/app.log
grep -i "upload" logs/app.log
```

## Health Check Endpoints

### Implement Health Checks:
```typescript
// Add to routes.ts
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    const dbTest = await db.select().from(users).limit(1);
    
    // Test file system
    const uploadsAccess = await fs.access('uploads');
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
      filesystem: 'accessible',
      memory: process.memoryUsage()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

## Performance Optimization Recommendations

### 1. Database Optimization
- Add indexes on frequently queried columns
- Use connection pooling
- Implement query result caching
- Regular VACUUM and ANALYZE

### 2. File Processing Optimization
- Implement streaming for large files
- Add file compression
- Use CDN for static assets
- Cleanup old uploaded files

### 3. Application Optimization
- Implement response caching
- Use compression middleware
- Optimize bundle sizes
- Add request rate limiting

## Security Audit Checklist

### 1. Authentication Security
- ✅ Secure session configuration
- ✅ Token refresh mechanism
- ✅ HTTPS enforcement
- ⚠️ CSRF protection (recommend implementation)

### 2. File Upload Security
- ✅ File size limits
- ✅ File type validation
- ⚠️ Malware scanning (recommend implementation)
- ✅ Path sanitization

### 3. Database Security
- ✅ Parameterized queries
- ✅ Connection encryption
- ✅ User access controls
- ⚠️ Regular security updates needed

## Monitoring & Alerting Setup

### 1. Application Monitoring
```typescript
// Add application metrics
const metrics = {
  activeUsers: await db.select().from(sessions).then(r => r.length),
  totalProjects: await db.select().from(projects).then(r => r.length),
  activeDeployments: await db.select().from(deployments)
    .where(eq(deployments.status, 'building')).then(r => r.length)
};
```

### 2. Database Monitoring
```sql
-- Monitor database size
SELECT 
  pg_size_pretty(pg_database_size(current_database())) as database_size,
  pg_size_pretty(pg_total_relation_size('projects')) as projects_table_size;
```

### 3. System Resource Monitoring
```bash
# Monitor system resources
ps aux | grep node
df -h
free -m
```

This debugging guide provides comprehensive coverage of system monitoring, issue resolution, and performance optimization for the Smart Deployment Dashboard.