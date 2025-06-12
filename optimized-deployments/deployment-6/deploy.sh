#!/bin/bash
# Automated deployment script for deployment 6

set -e

echo "🚀 Starting deployment 6..."

# Build the Docker image
docker build -t deployment-6 .

# Stop existing container if running
docker stop deployment-6-container 2>/dev/null || true
docker rm deployment-6-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-6-container \
  --restart unless-stopped \
  -p 3006:3000 \
  deployment-6

echo "✅ Deployment 6 completed successfully!"
echo "🌐 Application available at: http://localhost:3006"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3006/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-6-container"
    exit 1
fi

echo "🎉 Deployment successful!"