#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "Usage: ./scripts/restore.sh <backup_file>"
  echo "Example: ./scripts/restore.sh backups/db_backup_20240115_120000.sql"
  exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "⚠️  WARNING: This will replace the current database!"
read -p "Are you sure? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

echo "📥 Restoring database from $BACKUP_FILE..."
docker-compose exec -T postgres psql -U chessuser -d chessdb < "$BACKUP_FILE"

echo "✅ Database restored!"
