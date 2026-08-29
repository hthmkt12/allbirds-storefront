---
title: "EmDash Backend — Content APIs + Orders on Cloudflare Workers + D1"
description: "Wire 6 content GET routes, POST/GET orders, and D1 schema+seed so the storefront exits mock-first mode."
status: pending
priority: P1
effort: 6h
branch: hthmkt12/catfish
tags: [backend, cloudflare, d1, astro, orders]
created: 2026-08-29
---

# EmDash Backend — Content APIs + Orders

## Context

The storefront at `src/utils/cms-client/collections.ts` fetches 6 collection endpoints and expects `{ docs: [...] }` shaped JSON. Currently every `GET /api/*` content route returns 404 on the deployed Worker. Only `GET /api/orders/lookup` exists and returns `{ docs: [] }` (stub).

Backend: Astro on Cloudflare Workers. D1 binding `DB` (database `allbirds-emdash-db`, id `cff34541-1547-4da2-8a2d-199f111ef5a8`). No `src/pages/api/` content files exist yet — only `src/pages/api/orders/lookup.ts`.

## Goals

1. D1 schema: 7 tables (6 content + `orders`/`order_items`)
2. 6 content GET routes returning `{ docs: [] }` shaped JSON matching `CmsXxx` types in `src/utils/cms-client/types.ts`
3. `POST /api/orders` — validate, compute tax/totals, insert, return `{ doc: CmsOrder }`
4. `GET /api/orders/lookup` — wire to real D1 query (replace stub)
5. Seed script for D1 from `src/data/allbirds-data.ts` data

## Data Flows

```
Storefront fetch → GET /api/{collection}
  → Astro APIRoute → env.DB.prepare(SELECT) → JSON { docs: [...] }
  → fallback: mock data (already handled in cms-client)

Checkout → POST /api/orders
  → validate body → compute subtotal/tax/shipping/total → D1 INSERT → { doc: CmsOrder }

Order lookup → GET /api/orders/lookup?email=&token=
  → D1 SELECT WHERE email=? AND order_token=? → { docs: [CmsOrder] }
```

## D1 Schema (SQL)

```sql
-- Phase 1: content tables
CREATE TABLE IF NOT EXISTS hero_blocks (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  headline    TEXT NOT NULL,
  body        TEXT NOT NULL,
  cta_label   TEXT NOT NULL,
  media       TEXT,
  theme_swatch TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id    INTEGER PRIMARY KEY AUTOINCREMENT,
  name  TEXT NOT NULL,
  slug  TEXT NOT NULL UNIQUE,
  cta   TEXT NOT NULL,
  swatch TEXT NOT NULL,
  image TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT NOT NULL,
  price        TEXT NOT NULL,
  fit          TEXT NOT NULL,
  rating       REAL NOT NULL,
  tags         TEXT NOT NULL DEFAULT '[]',  -- JSON array
  sizes        TEXT NOT NULL DEFAULT '[]',  -- JSON array of numbers
  slug         TEXT,
  description  TEXT,
  label        TEXT,
  color        TEXT,
  swatch       TEXT,
  image        TEXT,
  colorways    TEXT NOT NULL DEFAULT '[]'  -- JSON array of {color, swatch, image}
);

CREATE TABLE IF NOT EXISTS promo_tiles (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  title  TEXT NOT NULL,
  swatch TEXT NOT NULL,
  image  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS materials (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  impact_note   TEXT NOT NULL,
  texture_image TEXT,
  source_region TEXT
);

CREATE TABLE IF NOT EXISTS reviews (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  quote         TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  detail        TEXT NOT NULL
);

-- Phase 2: orders
CREATE TABLE IF NOT EXISTS orders (
  id               TEXT PRIMARY KEY,       -- crypto.randomUUID()
  order_token      TEXT NOT NULL UNIQUE,
  email            TEXT NOT NULL,
  shipping_name    TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city    TEXT NOT NULL,
  shipping_state   TEXT NOT NULL,
  shipping_zip     TEXT NOT NULL,
  subtotal         REAL NOT NULL,
  tax              REAL NOT NULL,
  shipping         REAL NOT NULL,
  total            REAL NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending',
  payment_method   TEXT,
  payment_status   TEXT NOT NULL DEFAULT 'unpaid',
  created_at       TEXT NOT NULL,
  updated_at       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id         TEXT NOT NULL,
  order_id   TEXT NOT NULL REFERENCES orders(id),
  name       TEXT NOT NULL,
  price      TEXT NOT NULL,
  size       REAL NOT NULL,
  color      TEXT NOT NULL,
  image      TEXT NOT NULL,
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (id, order_id)
);

CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(order_token);
```

**Design notes:**
- `tags`, `sizes`, `colorways` stored as JSON text — D1 has no array type; parse in route handler before returning.
- `orders.id` is UUID string (matches `CmsOrder.id`).
- `order_items.id` is the item id from the cart, not autoincrement.

## Phase 1 — D1 Schema Migration

**Files to create:**
- `emdash-backend/migrations/0001_content_tables.sql` — content tables DDL
- `emdash-backend/migrations/0002_orders_tables.sql` — orders + order_items DDL

**Steps:**
1. Write `0001_content_tables.sql` (hero_blocks through reviews).
2. Write `0002_orders_tables.sql` (orders, order_items, indexes).
3. Apply locally: `npx wrangler d1 execute allbirds-emdash-db --local --file=migrations/0001_content_tables.sql` (repeat for 0002).
4. Apply remote: same command with `--remote` flag (requires `wrangler` auth).

**Rollback:** `DROP TABLE IF EXISTS` for each table in reverse creation order.

## Phase 2 — 6 Content GET Routes

**Files to create** (all in `emdash-backend/src/pages/api/`):
- `hero-blocks.ts`
- `categories.ts`
- `products.ts`
- `promo-tiles.ts`
- `materials.ts`
- `reviews.ts`

**Response contract** (all endpoints):
```ts
{ docs: CmsXxx[] }
```

**Route pattern** (example `hero-blocks.ts`):
```ts
import type { APIRoute } from "astro";

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as { runtime?: { env?: { DB?: D1Database } } }).runtime?.env?.DB;
  if (!db) {
    return new Response(JSON.stringify({ error: "DB unavailable" }), {
      status: 503, headers: corsJson,
    });
  }
  const { results } = await db.prepare("SELECT * FROM hero_blocks ORDER BY id").all();
  return new Response(JSON.stringify({ docs: results.map(mapHeroBlock) }), {
    status: 200, headers: corsJson,
  });
};
```

**D1 binding access in Astro on Cloudflare:**
`locals.runtime.env.DB` — requires `@astrojs/cloudflare` adapter and `runtime: { mode: 'local' }` for dev or direct binding on Workers. The existing `lookup.ts` does NOT access DB — it's a stub. All new routes must access `locals.runtime.env.DB`.

**Column → CmsXxx field mapping:**

| Table | DB column | CmsXxx field | Transform |
|---|---|---|---|
| `hero_blocks` | `media` | `media` | pass-through string |
| `hero_blocks` | `theme_swatch` | `themeSwatch` | rename |
| `hero_blocks` | `cta_label` | `ctaLabel` | rename |
| `categories` | all snake_case | camelCase | rename |
| `products` | `tags` | `tags` | `JSON.parse()` |
| `products` | `sizes` | `sizes` | `JSON.parse()` |
| `products` | `colorways` | `colorways` | `JSON.parse()` |
| `products` | `rating` | `rating` | pass (REAL → number) |
| `promo_tiles` | snake_case | camelCase | rename |
| `materials` | `impact_note` | `impactNote` | rename |
| `materials` | `texture_image` | `textureImage` | rename |
| `materials` | `source_region` | `sourceRegion` | rename |
| `reviews` | `customer_name` | `customerName` | rename |

**CORS header shared constant** (single definition, imported by all routes):
- `emdash-backend/src/lib/cors.ts` — exports `corsJson` header object `{ "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }`

**File ownership:** Each content route file is independent; no two phases touch the same file.

## Phase 3 — Orders API

### `POST /api/orders`

**File:** `emdash-backend/src/pages/api/orders/index.ts`

**Request body** (from `src/utils/cms-client/orders.ts` `createOrder` call):
```ts
Omit<CmsOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>
```
Fields: `email`, `shippingName`, `shippingAddress`, `shippingCity`, `shippingState`, `shippingZip`, `items[]`, `subtotal`, `paymentMethod?`, `paymentStatus?`

**Server-side computation:**
- `tax = Math.round(subtotal * 0.08 * 100) / 100` (8% flat rate — matches existing mock in `orders.ts:108`)
- `shipping = subtotal >= 50 ? 0 : 5` (free shipping over $50 — YAGNI: no config needed)
- `total = subtotal + tax + shipping`

**Validation (minimal, fail-loud):**
- `email` present and contains `@`
- `items` non-empty array
- `shippingName`, `shippingAddress`, `shippingCity`, `shippingState`, `shippingZip` all non-empty strings

**Response:** `{ doc: CmsOrder }` — matches client-side expectation at `orders.ts:25`.

**D1 insert:** two statements in a batch:
1. `INSERT INTO orders (...) VALUES (...)`
2. For each item: `INSERT INTO order_items (...) VALUES (...)`

**Response shape must match `CmsOrder`** (camelCase, `orderToken`, `createdAt` ISO string).

### `GET /api/orders/lookup`

**File:** `emdash-backend/src/pages/api/orders/lookup.ts` (already exists — replace stub body)

**Current state:** returns `{ docs: [] }` regardless of params.

**New behavior:**
```sql
SELECT o.*, oi.* FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.email = ? AND o.order_token = ?
```

Assemble into `CmsOrder` with `items: CmsOrderItem[]` array, return `{ docs: [order] }` or `{ docs: [] }` if not found.

**Caution:** `lookup.ts` is the only existing API file — edit in place, do not recreate.

## Phase 4 — Seed Script

**File:** `emdash-backend/scripts/seed-d1.ts`

**Purpose:** populate all 6 content tables from `src/data/allbirds-data.ts` data (adapted for D1 via wrangler CLI).

**Mechanism:** generates `INSERT OR REPLACE` SQL statements and runs them via:
```bash
npx wrangler d1 execute allbirds-emdash-db --local --file=scripts/seed-d1.sql
```

So `seed-d1.ts` is a Node/Bun script that **writes** `scripts/seed-d1.sql` — then the SQL file is fed to wrangler. This avoids needing a D1 HTTP client in the script.

**Data to seed:**

| Table | Source | Count |
|---|---|---|
| `hero_blocks` | Inline (1 hero block from fallback in `collections.ts:33`) | 1 |
| `categories` | `allbirds-data.ts:categories` | 4 |
| `products` | `allbirds-data.ts:products` | 8 |
| `promo_tiles` | `allbirds-data.ts:promoTiles` | 3 |
| `materials` | `allbirds-data.ts:valueBlocks` (name←title, impactNote←body) | 3 |
| `reviews` | `allbirds-data.ts:reviews` (customerName←name) | 3 |

**Products colorways:** each product gets 3 colorways seeded as JSON — `[{ color: prod.color, swatch: prod.swatch, image: prod.image }, { color: "Sage Brush", swatch: "var(--sage)", image: "/allbirds-mvp-lifestyle.png" }, { color: "Pacific Blue", swatch: "var(--blue)", image: "/allbirds-travel-promo.png" }]` — matches fallback in `collections.ts:95-99`.

**Sizes:** `[7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]` (matches `DEFAULT_SIZES` in `src/utils/commerce-config.ts`).

## Dependency Graph

```
Phase 1 (schema) → Phase 2 (content routes)
Phase 1 (schema) → Phase 3 (orders routes)
Phase 2 + Phase 3 → Phase 4 (seed, validates routes exist)
```

Phase 2 and Phase 3 can run in parallel after Phase 1. Phase 4 is last.

## File Ownership

| File | Phase | Owner |
|---|---|---|
| `emdash-backend/migrations/0001_content_tables.sql` | 1 | Phase 1 |
| `emdash-backend/migrations/0002_orders_tables.sql` | 1 | Phase 1 |
| `emdash-backend/src/lib/cors.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/hero-blocks.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/categories.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/products.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/promo-tiles.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/materials.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/reviews.ts` | 2 | Phase 2 |
| `emdash-backend/src/pages/api/orders/index.ts` | 3 | Phase 3 |
| `emdash-backend/src/pages/api/orders/lookup.ts` | 3 | Phase 3 (edit existing) |
| `emdash-backend/scripts/seed-d1.ts` | 4 | Phase 4 |

No two phases share a file. `lookup.ts` is owned exclusively by Phase 3.

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `locals.runtime.env.DB` binding absent in Astro Cloudflare adapter | Medium | High | Verify binding path against `@astrojs/cloudflare` docs; check `.wrangler/` local state; add 503 guard in every route |
| D1 batch insert partial failure on `POST /api/orders` | Low | High | Wrap order + items inserts in `db.batch([...])` — D1 batch is atomic |
| `JSON.parse` throws on malformed `tags`/`sizes`/`colorways` in products table | Low | Medium | Wrap in try/catch per row; return `[]` as default |
| Wrangler auth not configured for `--remote` flag during seed/migration | Medium | Medium | Plan note: `wrangler login` required; local dev works without auth |
| `astro.config.mjs` imports `emdash/astro` + `dashcommerce` which may conflict with custom routes | Low | Low | Custom routes in `src/pages/api/` take precedence over integration routes in Astro |

## Backwards Compatibility

- All new files; no existing frontend code changes.
- `lookup.ts` edit is backward-compatible: old stub returned `{ docs: [] }` always; new code returns same shape but with real data — client handles both correctly.
- `GET /api/*` routes going from 404 → 200 is not a breaking change — client already has fallback logic that only triggers on error/empty.

## Test Matrix

| Layer | What | How |
|---|---|---|
| Unit | `mapHeroBlock`, `mapProduct`, `mapReview` row mappers | Vitest unit test in `emdash-backend/src/lib/mappers.test.ts` |
| Unit | Order validation logic | Vitest unit test alongside `orders/index.ts` |
| Integration | `GET /api/hero-blocks` returns `{ docs: [...] }` with seeded data | `wrangler dev --local` + curl or fetch |
| Integration | `POST /api/orders` inserts and returns `{ doc: CmsOrder }` | curl POST to local dev |
| Integration | `GET /api/orders/lookup?email=&token=` returns seeded order | curl GET after POST |
| E2E | Storefront exits mock-first: no "Failed to fetch" console.warn | Browser devtools + existing Playwright suite |

**Static verification (before runtime):** TypeScript `tsc --noEmit` inside `emdash-backend/` after each phase.

## Acceptance Criteria

- [ ] All 6 `GET /api/*` routes return HTTP 200 with `{ docs: Array }` where array is non-empty after seeding.
- [ ] `POST /api/orders` returns `{ doc: CmsOrder }` with server-computed `tax`, `shipping`, `total`.
- [ ] `GET /api/orders/lookup?email=X&token=Y` returns `{ docs: [order] }` for a valid email+token pair.
- [ ] `npm run build` inside `emdash-backend/` passes with `DEPLOY_TARGET=cloudflare`.
- [ ] Storefront `console.warn "Failed to fetch"` messages disappear when backend is live.
- [ ] Seed script runs without errors and populates all 6 tables.

## Rollback Plan

- **Phase 1:** Drop all new tables via `wrangler d1 execute ... --remote --command="DROP TABLE IF EXISTS ..."` in reverse order.
- **Phase 2/3:** Delete the new route files; 404s resume; storefront falls back to mock data automatically.
- **Phase 4:** No rollback needed (additive data, `INSERT OR REPLACE`).
- **lookup.ts edit:** `git revert` the single commit touching that file restores the stub.

## Unresolved Questions

1. **`locals.runtime.env.DB` exact binding path** — `@astrojs/cloudflare` v14 may expose binding as `locals.runtime.env.DB` or via `getRuntime(Astro.request)`. Needs verification against installed adapter version `^14.2.5` docs before Phase 2 starts.
2. **`wrangler login` / account auth** — remote migration and seed require CF account auth. Is the deploying machine already authenticated? If not, implementer must run `wrangler login` first.
3. **Tax rate business rule** — 8% flat used to match existing mock. Confirm this is acceptable or if state-based calculation is needed.
4. **Existing `emdash` integration routes** — `astro.config.mjs` mounts `emdash()` and `dashcommerce()` integrations which may already register `/_emdash/api/*` routes. Confirm custom `src/pages/api/` routes do not conflict.
