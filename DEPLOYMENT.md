# Office Chess Deployment Guide

## Quick Start

### Prerequisites

- Docker and Docker Compose installed

### Deploy

```bash
./scripts/deploy.sh
```

Access URL is read from `DOCKER_APP_URL` in `.env`.

---

## Configuration

**All config lives in `.env`. That is the only file you need to edit on a new machine.**

| Variable                                              | What to change                                      |
| ----------------------------------------------------- | --------------------------------------------------- |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials                                |
| `DOCKER_APP_URL`                                      | LAN/production URL, e.g. `http://192.168.1.50:3001` |
| `NEXTAUTH_SECRET`                                     | Generate with `openssl rand -base64 32`             |
| `EMAIL_FROM` / `COMPANY_EMAIL_DOMAIN`                 | Email sender identity                               |
| `EMAIL_SERVER_*`                                      | SMTP server for production email                    |

Find your server IP on Mac: `ipconfig getifaddr en0`

---

## Management Commands

| Task             | Command                      |
| ---------------- | ---------------------------- |
| Start            | `docker-compose up -d`       |
| Stop             | `docker-compose down`        |
| Restart app only | `docker-compose restart app` |
| App logs         | `docker-compose logs -f app` |
| All logs         | `docker-compose logs -f`     |
| Status           | `docker-compose ps`          |

### Database

```bash
# Backup
./scripts/backup.sh              # saves to ./backups/

# Restore
./scripts/restore.sh backups/db_backup_TIMESTAMP.sql

# Connect interactively (reads creds from .env)
source .env && docker-compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# Re-run migrations
docker-compose up db-migrate
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

Only update `POSTGRES_PASSWORD` in `.env` — `docker-compose.yml` builds `DATABASE_URL` from the same variable automatically.

### Use a real email server

Set these in `.env`:

```env
EMAIL_SERVER_HOST="smtp.yourcompany.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-user"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_FROM="Office Chess <chess@yourcompany.com>"
COMPANY_EMAIL_DOMAIN s="yourcompany.com"
```

### Scheduled backups (cron)

```bash
# Daily backup at 2am
0 2 * * * /path/to/office-chess/scripts/backup.sh >> /var/log/chess-backup.log 2>&1
```
