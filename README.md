# Allbirds Storefront

[![CI & Quality Gate](https://github.com/hthmkt12/allbirds-storefront/actions/workflows/ci.yml/badge.svg)](https://github.com/hthmkt12/allbirds-storefront/actions/workflows/ci.yml)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Demo-black?logo=vercel)](https://allbirds-storefront.vercel.app)

An interactive e-commerce storefront modeled on Allbirds, backed by a local [Payload CMS](https://payloadcms.com/) instance and covered by a comprehensive Playwright E2E test suite.

- **Live Storefront Demo**: [https://allbirds-storefront.vercel.app](https://allbirds-storefront.vercel.app)
- **GitHub Repository**: [https://github.com/hthmkt12/allbirds-storefront](https://github.com/hthmkt12/allbirds-storefront)

---

## Architecture

```
F:/Allbirds/
├── src/                  # React + Vite storefront (port 5173)
│   ├── App.tsx           # Root: cart state, drawer, routing
│   ├── components/       # UI sections (header, hero, product, cart…)
│   ├── data/             # Local mock fallback data
│   └── utils/cms-client  # Payload CMS HTTP client with fallback
├── payload-cms/          # Payload CMS (Next.js, SQLite, port 3000)
│   └── src/collections/  # 6 CMS collections
├── e2e-tests/            # Playwright test suite (Tiers 1–5)
├── public/               # Static assets + WebP/AVIF optimised images
└── docs/                 # common-issues.md, codebase notes
```

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, TypeScript |
| CMS | Payload CMS 3 (Next.js 15), SQLite |
| Styling | Vanilla CSS (custom properties) |
| Images | WebP + AVIF `srcset` at 480/768/1024/1280/1536/1920 px |
| Tests | Playwright (Chromium, Mobile Chrome, Mobile Safari) |
| Deployment | Vercel / Cloudflare Pages (Frontend), Node.js (Payload CMS) |

---

## Quick Start

### 1. Install dependencies

```bash
# Storefront
npm install

# CMS
cd payload-cms
npm install
cd ..
```

### 2. Start Payload CMS

```bash
cd payload-cms
npm run dev          # http://localhost:3000
```

On first run, visit `http://localhost:3000/admin` to create an admin user.  
Seed the database with sample data:

```bash
npm run payload seed  # inside payload-cms/
```

### 3. Start the storefront (dev)

```bash
npm run dev          # http://localhost:5173
```

> The storefront fetches from `http://127.0.0.1:3000/api/*` and falls back to local mock data if the CMS is unreachable.

---

## Available Scripts

### Storefront (`F:/Allbirds/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run Vitest in interactive watch mode |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Serve production build on port 5173 |

### CMS (`F:/Allbirds/payload-cms/`)

| Command | Description |
|---|---|
| `npm run dev` | Start Payload CMS dev server |
| `npm run build` | Build CMS for production |

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

See [`docs/deployment-guide.md`](docs/deployment-guide.md) for step-by-step instructions on deploying the storefront to **Vercel** / **Cloudflare Pages** and Payload CMS to any Node.js environment.

---

## Known Issues

See [`docs/common-issues.md`](docs/common-issues.md) for a log of past bugs, root causes, and verified fixes.

---

## Project Status

All 7 milestones complete. See [`PROJECT.md`](PROJECT.md) for the milestone table.
