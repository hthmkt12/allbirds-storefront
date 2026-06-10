# Allbirds Storefront

An interactive e-commerce storefront modeled on Allbirds, backed by a local [Payload CMS](https://payloadcms.com/) instance and covered by a comprehensive Playwright E2E test suite.

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
| Frontend | React 18, Vite, TypeScript |
| CMS | Payload CMS 3 (Next.js), SQLite |
| Styling | Vanilla CSS (custom properties) |
| Images | WebP + AVIF `srcset` at 480/768/1024/1280/1536/1920 px |
| Tests | Playwright (Chromium, Mobile Chrome, Mobile Safari) |

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

| Tier | Tests | Description |
|---|---:|---|
| T1 Feature (F1–F6) | 60 | Happy-path per feature |
| T2 Boundary (F1–F6) | 60 | Edge cases, disabled states |
| T3 Cross-feature | 6 | Pairwise integration |
| T4 Real-world journeys | 5 | Full shopping flows |
| T5 Adversarial | 5 | XSS, corrupted storage, CMS offline |
| Smoke | 1 | Homepage load |
| **Total** | **137** × 3 browsers = **231** | 225 pass · 6 intentional mobile skips |

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

## Known Issues

See [`docs/common-issues.md`](docs/common-issues.md) for a log of past bugs, root causes, and verified fixes.

---

## Project Status

All 7 milestones complete. See [`PROJECT.md`](PROJECT.md) for the milestone table.
