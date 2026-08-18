# Phase 02: Storage & Docker Alignment

## Objective
Align SQLite database path and Media uploads directory between development and Docker container deployments to prevent data loss.

## Context
- `payload-cms/src/payload.config.ts` hardcodes `url: file:../payload.db`.
- `docker-compose.yml` mounts `cms_data:/app/data`.
- If container restarts without proper volume mapping, database resets.

## Implementation Steps
1. **Update `payload-cms/src/payload.config.ts`**:
   - Resolve DB path from `process.env.DATABASE_PATH || path.resolve(dirname, '../payload.db')`.
   - Ensure media upload path is configurable via `process.env.MEDIA_DIR`.
   - Validate `PAYLOAD_SECRET` when `NODE_ENV === 'production'`.
2. **Update `docker-compose.yml`**:
   - Set environment `DATABASE_PATH=/app/data/payload.db`.
   - Map volume `cms_data:/app/data` to ensure persistent storage of DB and uploaded media files.

## Validation
- Local dev continues using `payload-cms/../payload.db`.
- Docker build starts successfully and reads/writes to `/app/data/payload.db`.
