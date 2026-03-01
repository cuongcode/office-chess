#!/bin/bash
set -e

# Load .env variables
set -a; source "$(dirname "$0")/../.env"; set +a

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql"

echo "💾 Creating database backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
docker-compose exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" > "$BACKUP_FILE"

echo "✅ Backup saved: $BACKUP_FILE"
echo "   Size: $(du -h "$BACKUP_FILE" | cut -f1)"
