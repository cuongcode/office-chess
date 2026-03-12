#!/bin/bash
set -e

# Load .env variables
set -a; source .env; set +a

echo "🚀 Starting Office Chess Deployment..."

# Stop existing containers
echo "⏹️  Stopping existing containers..."
docker-compose down

# Build application
echo "🔨 Building application..."
docker-compose build --no-cache

# Start services
echo "▶️  Starting services..."
docker-compose up -d

# Wait for database to be healthy (uses healthcheck, not plain sleep)
echo "⏳ Waiting for database to be ready..."
until docker-compose exec -T postgres pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; do
  printf '.'
  sleep 2
done
echo " ready!"

# Migration runs automatically via the db-migrate container before the app starts

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services status:"
docker-compose ps

echo ""
echo "🌐 Application running at ${DOCKER_APP_URL}"
echo "📊 View logs: docker-compose logs -f app"
