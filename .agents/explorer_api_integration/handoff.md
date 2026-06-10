# Handoff Report — API Integration Analysis

## 1. Observation
I audited the static mock definitions in the frontend and the corresponding Payload CMS collection files. The observations are as follows:

* **Static Mocks file (`src/data/allbirds-data.ts`):**
  - `categories` defines flat structures: `{ name, cta, swatch, image }` (lines 20-25).
  - `products` defines: `{ name, label, color, price, swatch, imagePosition, fit, rating, tags }` (lines 27-114).
  - `promoTiles` defines: `{ title, swatch, image }` (lines 116-120).
  - `reviews` defines: `{ quote, name, detail }` (lines 143-159).
  - There is no static mock for `heroBlocks` (lines 1-200).
* **Vite Components:**
  - `src/components/header-hero.tsx` (lines 31-52) hardcodes the Hero component details, including the image `/allbirds-lifestyle-hero.png`, kickers, and titles.
  - `src/components/commerce-sections.tsx` (line 80) crops the product image: `<div className="product-crop" style={{ backgroundPosition: product.imagePosition }} />`.
  - `src/styles.css` (line 44) specifies: `.product-crop { background-image:url("/allbirds-category-swatch.png"); background-repeat:no-repeat; background-size:205% 205%; ... }`. This shows all products are cropped out of a single category swatch sprite image.
* **Payload CMS Collections (`payload-cms/src/collections/`):**
  - `Categories.ts`: `image` is a relationship to the `media` collection (lines 33-38).
  - `Products.ts`: `colorways` is an array of `{ color, swatch, image }` (lines 46-66) where `image` relates to `media`. Has an `afterRead` hook (lines 11-32) that maps `tags` and `sizes` array-of-objects to primitive string/number arrays. Note that the `label` field is missing.
  - `HeroBlocks.ts`: `media` is a relationship to the `media` collection (lines 27-32).
  - `Materials.ts`: `textureImage` is a relationship to the `media` collection (lines 22-27).
  - `Reviews.ts`: `product` is a relationship to `products` (lines 12-17).
  - `PromoTiles.ts`: `image` is a relationship to `media` (lines 22-27).

---

## 2. Logic Chain
1. The storefront components currently use static imports from `src/data/allbirds-data.ts`.
2. When transitioning to Payload CMS API endpoints, the frontend needs to fetch endpoints like `/api/products`, `/api/categories`, and `/api/hero-blocks`.
3. Because image files in Payload CMS are mapped to a `media` collection, the API will return nested Media relation objects containing `.url` properties (e.g. `/media/allbirds-hero-linen.png`) instead of simple local string paths.
4. Because the CMS `products` schema uses a direct Media relationship per colorway instead of a shared sprite sheet with background offsets (Observations 2 & 3), we cannot use the `imagePosition` styling on `.product-crop`. Instead, we must set the background image of the product card dynamically using the URL of the first colorway: `style={{ backgroundImage: url(product.colorways[0].image.url) }}`.
5. Because the product `label` field (e.g., "New Color") does not exist in the CMS products schema, the UI needs to be updated to handle this omission gracefully (either fallback to displaying tags, or updating the schema).
6. Because the CMS `products` schema has `afterRead` hooks that map nested tag/size objects to flat arrays, the API output matches the frontend's expectations (e.g. `tags: string[]`), simplifying frontend integration.

---

## 3. Caveats
* **Port Availability**: The payload CMS server runs on port 3000 by default. It is assumed the frontend can successfully communicate with it cross-origin during local development.
* **Media Uploads Storage**: The seeding script uploads local media files to the CMS, which saves them inside `public/media`. Since Vite maps the `public` folder to the root of the server, the `/media/...` path will resolve perfectly on client-side requests.
* **No local API Client setup**: I did not look at any existing API client code or fetch wrappers. Implementing the integration will require setting up a fetch helper.

---

## 4. Conclusion
Replacing mock data with Payload CMS API endpoints requires:
1. Updating image rendering in the storefront components to resolve relationships from the `media` collection (e.g., using `image.url`).
2. Disabling the sprite-crop offset mechanism on products and rendering individual images directly.
3. Modifying `header-hero.tsx` and `commerce-sections.tsx` to bind to live fetched data from `GET /api/hero-blocks`, `GET /api/categories`, etc.
4. Handling the missing `label` field on products.

---

## 5. Verification Method
1. Inspect the generated report at `F:/Allbirds/.agents/explorer_api_integration/analysis.md` to review the mapping table and integration steps.
2. Once the next agent (implementer) applies changes, verify using the project test suite:
   - Run the dev build: `npm run build` from the frontend directory.
   - Run E2E tests: `npx playwright test` (from the tests directory if applicable).
