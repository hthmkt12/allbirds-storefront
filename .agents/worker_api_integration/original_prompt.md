## 2026-06-10T02:15:10Z
You are the API Integration Worker.
Your task is to replace the static mock data imports in the storefront components with dynamic HTTP fetches targeting the local Payload CMS endpoints.

Target endpoints:
- GET http://localhost:3000/api/hero-blocks
- GET http://localhost:3000/api/categories
- GET http://localhost:3000/api/products
- GET http://localhost:3000/api/materials
- GET http://localhost:3000/api/reviews
- GET http://localhost:3000/api/promo-tiles

Detailed instructions:
1. Create a helper or inline fetching logic to fetch from the API. The API URL should target `http://localhost:3000` or `http://127.0.0.1:3000`.
2. Add error-handling and fallback logic. If the CMS server is offline or returns an error, the storefront MUST fallback gracefully to the static mock data from `src/data/allbirds-data.ts`.
3. Handle loading and empty states in components.
4. Replace the static mappings in the storefront:
   - In `src/components/header-hero.tsx` (Hero component): Fetch `/api/hero-blocks`. Map the fields:
     - `headline` -> h1
     - `body` -> kicker paragraph (class `section-kicker`)
     - `ctaLabel` -> split it by " / " to render CTA buttons (e.g. "Shop Men" and "Shop Women")
     - `media` -> image source url
   - In `src/components/commerce-sections.tsx`:
     - `CategoryStrip` & `CategoryCard`: Fetch `/api/categories`. Resolve the category `image.url` and `swatch` fields. Set `onCategoryChange` to map correctly.
     - `ProductSection` & `ProductCard`: Fetch `/api/products`. For each product, use its first colorway's details (`product.colorways[0]`):
       - `swatch` color -> product-swatch background color
       - `image.url` -> background image URL of the product card (instead of using the static `.product-crop` background sprite offsets!)
       - Note: since CMS products do not have a `label` field, you can check if a product has a tag "New" and display it, or use the first tag, or just fallback to "&nbsp;".
     - `SpotlightCard`: Resolve category image URL dynamically.
     - `PromoSection`: Fetch `/api/promo-tiles`. Map `image.url` and `swatch` to background image and color.
   - In `src/components/content-sections.tsx`:
     - `MaterialStory`: Fetch `/api/materials`. Map `material.name` -> Card Title, `material.impactNote` -> Card Body. (Note: `materialMetrics` should remain static in the frontend).
     - `ReviewsSection`: Fetch `/api/reviews`. Map `quote` -> quote, `customerName` -> name, `detail` -> detail.
5. Verify the storefront builds cleanly using `npm run build`.
6. Run the E2E tests for CMS dynamic integration using Playwright: `npx playwright test -c e2e-tests/playwright.config.ts -g "CMS"` or similar to check if the test suite passes.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/worker_api_integration
