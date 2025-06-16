#!/bin/bash
# Automated deployment script for deployment 10

set -e

echo "🚀 Starting deployment 10..."

# Build the Docker image
docker build -t deployment-10 .

# Stop existing container if running
docker stop deployment-10-container 2>/dev/null || true
docker rm deployment-10-container 2>/dev/null || true

# Run the new container
docker run -d \
  --name deployment-10-container \
  --restart unless-stopped \
  -p 3010:3000 \
  deployment-10

echo "✅ Deployment 10 completed successfully!"
echo "🌐 Application available at: http://localhost:3010"

# Wait for health check
echo "🔍 Performing health check..."
sleep 10

if curl -f http://localhost:3010/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
else
    echo "❌ Health check failed. Check logs with: docker logs deployment-10-container"
    exit 1
fi

echo "🎉 Deployment successful!"