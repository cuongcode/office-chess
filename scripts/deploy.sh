#!/bin/bash
set -e

echo "🚀 Starting Chess App Deployment..."

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
until docker-compose exec -T postgres pg_isready -U chessuser -d chessdb > /dev/null 2>&1; do
  printf '.'
  sleep 2
done
echo " ready!"

# Run database migrations from host (standalone image lacks full Prisma CLI)
echo "🗄️  Running database migrations..."
DATABASE_URL="postgresql://chessuser:chesspass123@localhost:5432/chessdb" npx prisma migrate deploy

# Show status
echo ""
echo "✅ Deployment complete!"
echo ""
echo "Services status:"
docker-compose ps

echo ""
echo "🌐 Application running at http://192.168.2.102:3001"
echo "📊 View logs: docker-compose logs -f app"
