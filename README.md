# Allbirds Storefront

[![CI & Quality Gate](https://github.com/hthmkt12/allbirds-storefront/actions/workflows/ci.yml/badge.svg)](https://github.com/hthmkt12/allbirds-storefront/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?logo=vercel)](https://allbirds-storefront.vercel.app)

An interactive e-commerce storefront modeled on Allbirds, backed by an EmDash CMS backend (Astro on Cloudflare Workers + D1) and covered by a comprehensive Playwright E2E test suite.

- **Live Storefront Demo**: [https://allbirds-storefront.vercel.app](https://allbirds-storefront.vercel.app)
- **GitHub Repository**: [https://github.com/hthmkt12/allbirds-storefront](https://github.com/hthmkt12/allbirds-storefront)

---

## Architecture

```
Allbirds/
├── src/                  # React + Vite storefront (port 5173)
│   ├── App.tsx           # Root: cart state, drawer, routing
│   ├── components/       # UI sections (header, hero, product, cart…)
│   ├── data/             # Local mock fallback data
│   └── utils/cms-client  # CMS HTTP client with fallback
├── emdash-backend/       # EmDash CMS (Astro on Cloudflare Workers + D1) — active backend
├── payload-cms/          # Payload CMS (SQLite) — deprecated, legacy reference only
├── e2e-tests/            # Playwright test suite (Tiers 1–5)
├── public/               # Static assets + WebP/AVIF optimised images
└── docs/                 # common-issues.md, codebase notes
```

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| CMS | EmDash (Astro) on Cloudflare Workers + D1 |
| Styling | Vanilla CSS (custom properties) |
| Images | WebP + AVIF `srcset` at 480/768/1024/1280/1536/1920 px |
| Tests | Playwright (Chromium, Mobile Chrome, Mobile Safari) |
| Deployment | Vercel / Cloudflare Pages (Frontend), Cloudflare Workers (CMS) |

---

## Quick Start

### 1. Install dependencies

```bash
# Storefront
npm install

# CMS
cd emdash-backend
bun install
cd ..
```

### 2. CMS backend (EmDash)

By default the storefront targets the deployed edge backend:

```
https://allbirds-emdash-backend.worldnew.workers.dev
```

To run the CMS locally instead, start the EmDash backend and point the storefront at it via `VITE_CMS_URL`:

```bash
cd emdash-backend
bun dev              # local Astro dev server
```

### 3. Start the storefront (dev)

```bash
npm run dev          # http://localhost:5173
```

> The storefront fetches from `${VITE_CMS_URL}/api/*` (defaulting to the deployed Workers backend) and falls back to local mock data if the CMS is unreachable.
>
> **Legacy:** the `payload-cms/` folder holds the original Payload CMS + SQLite backend and is deprecated — kept for reference only.

---

## Available Scripts

### Storefront (repo root)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build on port 5173 |

### CMS (`emdash-backend/`)

| Command | Description |
|---|---|
| `bun dev` | Start EmDash (Astro) dev server |
| `bun run build` | Build CMS for production |
| `bunx wrangler deploy` | Deploy the CMS to Cloudflare Workers |

---

## E2E Tests

Requires the storefront to be built and served (`npm run preview`).  
The Playwright config starts the preview server automatically.

```bash
# Run full suite (3 browsers, sequential — most stable)
npx playwright test -c e2e-tests/playwright.config.ts --workers=1

# Run a specific tier
npx playwright test -c e2e-tests/playwright.config.ts e2e-tests/tests/tier5-adversarial.spec.ts --workers=1

# Open interactive UI
npx playwright test -c e2e-tests/playwright.config.ts --ui
```

### Test coverage

| Suite | Tests | Description |
|---|---:|---|
| F1 Product options | 14 | Size/color selection, disabled states |
| F2 Cart drawer (+ challenger) | 15 | Add/update/remove, persistence |
| F3 CMS integration | 10 | Live Payload data + offline fallback |
| F4 Brand pages | 13 | Collections, brand story |
| F5 Asset performance | 10 | WebP/AVIF srcset, lazy loading |
| F6 Accessibility | 10 | Keyboard, ARIA, focus management |
| F7–F11 Account / payment / help / PLP / wishlist | 14 | Later feature additions |
| T3 Cross-feature | 6 | Pairwise integration |
| T4 Real-world journeys | 5 | Full shopping flows |
| T5 Adversarial | 5 | XSS, corrupted storage, CMS offline |
| Smoke + screenshots | 3 | Homepage load, visual capture |
| **Total** | **102 specs × 3 browser projects = 306 executions** | CI runs Chromium-only (102) |

---

## CMS Collections

| Collection | Key fields |
|---|---|
| `heroBlocks` | headline, body, ctaLabel, media, themeSwatch |
| `categories` | name, slug, cta, swatch, image |
| `products` | name, price, colorways[], sizes[], rating, tags[], fit |
| `materials` | name, impactNote, textureImage, sourceRegion |
| `reviews` | quote, customerName, detail |
| `promoTiles` | title, swatch, image |

---

## Deployment

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for step-by-step instructions on deploying the storefront to **Vercel** / **Cloudflare Pages** and the EmDash CMS backend to **Cloudflare Workers** (with a D1 database).

---

## Known Issues

See [`docs/common-issues.md`](docs/common-issues.md) for a log of past bugs, root causes, and verified fixes.

---

## Project Status

All 7 milestones complete. See [`PROJECT.md`](PROJECT.md) for the milestone table.
