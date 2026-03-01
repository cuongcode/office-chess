# Chess App Deployment Guide

## Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Node.js (for running Prisma migrations from host)

### Deploy
```bash
./scripts/deploy.sh
```

Access at: **http://192.168.2.102:3001** (LAN) or **http://localhost:3001** (local)

---

## Configuration

### Change LAN IP
Edit `docker-compose.yml` and update both values to your server's IP + port:
```yaml
NEXTAUTH_URL: http://YOUR_IP:3001
NEXT_PUBLIC_SOCKET_URL: http://YOUR_IP:3001
```

Find your IP on Mac: `ipconfig getifaddr en0`

---

## Management Commands

| Task | Command |
|---|---|
| Start | `docker-compose up -d` |
| Stop | `docker-compose down` |
| Restart app only | `docker-compose restart app` |
| App logs | `docker-compose logs -f app` |
| All logs | `docker-compose logs -f` |
| Status | `docker-compose ps` |

### Database
```bash
# Backup
./scripts/backup.sh              # saves to ./backups/

# Restore
./scripts/restore.sh backups/db_backup_TIMESTAMP.sql

# Connect interactively
docker-compose exec postgres psql -U chessuser -d chessdb

# Run migrations (from host)
DATABASE_URL="postgresql://chessuser:chesspass123@localhost:5432/chessdb" npx prisma migrate deploy
```

### Rebuild after code changes
```bash
git pull
./scripts/deploy.sh
```

---

## Troubleshooting

**Port already in use** — Change `"3001:3000"` in `docker-compose.yml` to another port (e.g. `"3002:3000"`), update the URLs too.

**Can't access from another computer** — Check firewall allows the port. Verify IP with `ipconfig getifaddr en0`.

**JWT session errors in browser** — Clear cookies / open incognito. Happens when `NEXTAUTH_SECRET` changes.

**App won't start:**
```bash
docker-compose logs app
docker-compose build --no-cache app && docker-compose up -d app
```

---

## Production Hardening

### Change database password
In `docker-compose.yml`, update both `POSTGRES_PASSWORD` and the password inside `DATABASE_URL`.

### Use a real email server
```yaml
environment:
  EMAIL_SERVER_HOST: smtp.yourcompany.com
  EMAIL_SERVER_PORT: 587
  EMAIL_SERVER_USER: your-user
  EMAIL_SERVER_PASSWORD: your-password
  EMAIL_FROM: "Chess App <chess@yourcompany.com>"
  COMPANY_EMAIL_DOMAIN: yourcompany.com
```

### Scheduled backups (cron)
```bash
# Daily backup at 2am
0 2 * * * /path/to/office-chess/scripts/backup.sh >> /var/log/chess-backup.log 2>&1
```
