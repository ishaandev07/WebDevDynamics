#!/bin/bash
# Automated deployment script for deployment 9

set -e

echo "🚀 Starting deployment 9..."

# Build the Docker image
docker build -t deployment-9 .

# Stop existing container if running
docker stop deployment-9-container 2>/dev/null || true
docker rm deployment-9-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-9-container \
  --restart unless-stopped \
  -p 3009:3000 \
  deployment-9

echo "✅ Deployment 9 completed successfully!"
echo "🌐 Application available at: http://localhost:3009"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3009/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-9-container"
    exit 1
fi

echo "🎉 Deployment successful!"