#!/bin/bash
# Automated deployment script for deployment 8

set -e

echo "🚀 Starting deployment 8..."

# Build the Docker image
docker build -t deployment-8 .

# Stop existing container if running
docker stop deployment-8-container 2>/dev/null || true
docker rm deployment-8-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-8-container \
  --restart unless-stopped \
  -p 3008:3000 \
  deployment-8

echo "✅ Deployment 8 completed successfully!"
echo "🌐 Application available at: http://localhost:3008"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3008/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-8-container"
    exit 1
fi

echo "🎉 Deployment successful!"