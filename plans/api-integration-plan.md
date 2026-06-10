# Plan - M2: API Integration

This plan outlines the steps to replace static mock data with dynamic HTTP fetches targeting local Payload CMS endpoints, including robust offline fallback mechanisms.

## Steps

### Step 1: Create CMS Client Utility (`src/utils/cms-client.ts`)
- Define `CMS_BASE_URL` as `http://localhost:3000` (or fallback to `http://127.0.0.1:3000`).
- Create `resolveCmsUrl` helper to map relative media URLs (e.g. `/media/image.png` -> `http://localhost:3000/media/image.png`).
- Implement fetching methods with `fetch` API.
- Wrap requests in try/catch to return fallback data from `src/data/allbirds-data.ts` if the CMS server is offline or returns an error.

### Step 2: Implement Hero Component Dynamic Fetching (`src/components/header-hero.tsx`)
- Call `/api/hero-blocks` on mount.
- Handle loading state and fall back gracefully on error/empty docs.
- Map hero block fields:
  - `headline` -> h1
  - `body` -> kicker paragraph (class `section-kicker`)
  - `ctaLabel` -> split by " / " to render CTA buttons (e.g. "Shop Men" and "Shop Women")
  - `media` -> image source URL

### Step 3: Implement Commerce Sections Dynamic Fetching (`src/components/commerce-sections.tsx`)
- Fetch categories from `/api/categories` in `CategoryStrip` and `SpotlightCard` (or shared custom hooks).
- Map category fields:
  - `image.url` and `swatch` fields.
  - Set `onCategoryChange` to update category filters.
- Fetch products from `/api/products` in `ProductSection`.
- For each product, use its first colorway's details (`product.colorways[0]`):
  - `swatch` color -> product-swatch background color
  - `image.url` -> background image URL of the product card (override `.product-crop` inline `backgroundImage`, `backgroundSize: 'cover'`, and `backgroundPosition: 'center'`).
  - Label -> check if `tags` contains "New" to show "New", or use the first tag, or fallback to `&nbsp;`.
- Fetch promo tiles from `/api/promo-tiles` in `PromoSection`.
- Map `image.url` and `swatch` to background image and color.

### Step 4: Implement Content Sections Dynamic Fetching (`src/components/content-sections.tsx`)
- Fetch materials from `/api/materials` in `MaterialStory`.
- Map `material.name` -> Card Title, `material.impactNote` -> Card Body. (Note: `materialMetrics` should remain static in the frontend).
- Fetch reviews from `/api/reviews` in `ReviewsSection`.
- Map `quote` -> quote, `customerName` -> name, `detail` -> detail.

### Step 5: Verification & Testing
- Run `npm run build` to verify the storefront builds cleanly.
- Run Playwright E2E tests: `npx playwright test -c e2e-tests/playwright.config.ts -g "CMS"` to verify CMS dynamic integration.
