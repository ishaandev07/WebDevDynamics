#!/bin/bash
# Automated deployment script for deployment 7

set -e

echo "🚀 Starting deployment 7..."

# Build the Docker image
docker build -t deployment-7 .

# Stop existing container if running
docker stop deployment-7-container 2>/dev/null || true
docker rm deployment-7-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-7-container \
  --restart unless-stopped \
  -p 3007:3000 \
  deployment-7

echo "✅ Deployment 7 completed successfully!"
echo "🌐 Application available at: http://localhost:3007"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3007/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-7-container"
    exit 1
fi

echo "🎉 Deployment successful!"