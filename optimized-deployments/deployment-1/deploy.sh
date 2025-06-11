#!/bin/bash
# Automated deployment script for deployment 1

set -e

echo "🚀 Starting deployment 1..."

# Build the Docker image
docker build -t deployment-1 .

# Stop existing container if running
docker stop deployment-1-container 2>/dev/null || true
docker rm deployment-1-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-1-container \
  --restart unless-stopped \
  -p 3001:3000 \
  deployment-1

echo "✅ Deployment 1 completed successfully!"
echo "🌐 Application available at: http://localhost:3001"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3001/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-1-container"
    exit 1
fi

echo "🎉 Deployment successful!"