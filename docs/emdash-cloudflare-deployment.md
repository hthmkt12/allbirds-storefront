# EmDash CMS & DashCommerce Cloudflare Workers (D1) Deployment Guide

This guide outlines the steps to deploy the EmDash backend to Cloudflare Workers / Pages with Cloudflare D1 (Serverless SQLite) and R2 (Media Storage).

---

## 1. Prerequisites

- Cloudflare account with Workers & D1 enabled.
- Cloudflare Wrangler CLI installed:
  ```bash
  bun add -d wrangler @astrojs/cloudflare
  ```

---

## 2. Cloudflare Resources Setup

### A. Create Cloudflare D1 Database
```bash
npx wrangler d1 create emdash-db
```
*Take note of the `database_id` returned.*

### B. Create Cloudflare R2 Bucket (Media)
```bash
npx wrangler r2 bucket create emdash-media
```

---

## 3. Configuration

Update `astro.config.mjs` for Cloudflare:

```javascript
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import emdash from "emdash/astro";
import { d1 } from "emdash/db/d1";
import { r2 } from "emdash/storage/r2";
import { dashcommerce } from "@dashcommerce/core";

export default defineConfig({
  output: "server",
  adapter: cloudflare(),
  integrations: [
    react(),
    emdash({
      database: d1({ binding: "DB" }),
      storage: r2({ binding: "MEDIA_BUCKET", publicUrl: "https://media.yourdomain.com" }),
      plugins: [dashcommerce()],
    }),
  ],
});
```

Create `wrangler.jsonc` or `wrangler.toml`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "allbirds-emdash-backend",
  "main": "./dist/_worker.js/index.js",
  "compatibility_date": "2026-08-28",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "emdash-db",
      "database_id": "<YOUR_D1_DATABASE_ID>"
    }
  ],
  "r2_buckets": [
    {
      "binding": "MEDIA_BUCKET",
      "bucket_name": "emdash-media"
    }
  ]
}
```

---

## 4. Run Migrations & Deploy

```bash
# Apply schema to remote D1 database
npx wrangler d1 execute emdash-db --file=./.emdash/migrations.sql

# Deploy backend worker
npx wrangler deploy
```

---

## 5. Storefront Environment Variable

Set `VITE_CMS_URL` on your Storefront deployment (Vercel / Cloudflare Pages):
```env
VITE_CMS_URL=https://allbirds-emdash-backend.<your-subdomain>.workers.dev
```
