# API Integration Analysis Report

This report presents the findings from auditing the static mocks in `src/data/allbirds-data.ts` and the frontend components (`src/components/`, `src/App.tsx`), comparing them with the Payload CMS Collections and Fields defined in the CMS codebase (`payload-cms/src/collections/`) and database seed script.

---

## Executive Summary
Integrating the frontend storefront with Payload CMS requires mapping the static, flat mocks to dynamic REST API responses. While most schemas align structurally, there are critical differences in image handling (replacing local sprites/crop offsets with dynamic Media relationships), missing fields in CMS schemas (such as the product `label` field), and relation-linking (e.g., categories, reviews). 

The following table summarizes the status of the 6 data models:

| Model | Mock Location / Type | CMS Collection Slug | Alignment Status | Primary Mismatch / Action |
|---|---|---|---|---|
| **Hero Blocks** | Hardcoded in `header-hero.tsx` | `hero-blocks` | Minor Mismatch | Map hardcoded hero image & text to CMS; parse split CTA tab label. |
| **Categories** | `categories` in `allbirds-data.ts` | `categories` | Major Mismatch (Images) | Replace local image paths with Media relationships. |
| **Products** | `products` in `allbirds-data.ts` | `products` | Major Mismatch (Sprites & Label) | Replace CSS sprite crop offsets with dynamic media; handle lack of `label` field. |
| **Materials** | `valueBlocks` in `allbirds-data.ts` | `materials` | Structural Shift | Map mock value blocks to dynamic `materials` records. |
| **Reviews** | `reviews` in `allbirds-data.ts` | `reviews` | Minor Mismatch | Map reviewer detail text; support product relationship filtering. |
| **Promo Tiles** | `promoTiles` in `allbirds-data.ts` | `promo-tiles` | Minor Mismatch | Map image string path to CMS Media relationship URL. |

---

## Detailed Entity Mapping

### 1. Categories
* **Current Static Structure (`src/data/allbirds-data.ts`):**
  ```typescript
  export type Category = {
    name: string;
    cta: string;
    swatch: string;
    image: string; // Hardcoded string path, e.g. "/allbirds-category-swatch.png"
  };
  ```
* **Vite Components Usage:**
  - **`CategoryStrip` & `CategoryCard`**: `category.name` is displayed and used as the active state trigger. `category.cta` is shown inside a `<strong>` tag. `category.swatch` is used as inline `style={{ backgroundColor: category.swatch }}`.
  - **`SpotlightCard`**: Uses the category `name` to find the corresponding background image: `categories.find((item) => item.name === activeCategory)?.image`.
* **Payload CMS Collection (`categories`):**
  - Config file: `Categories.ts` (slug: `categories`)
  - Fields: `name` (text), `slug` (text, unique), `cta` (text), `swatch` (text), `image` (relationship to `media`).
* **Mismatches & Recommendations:**
  1. **Image Field Type**: Payload returns `image` as a related `Media` object. The frontend must extract `category.image.url` instead of a plain string.
  2. **Vite Public assets vs Payload Media**: Payload uploads are stored in `F:/Allbirds/public/media/`, mapping directly to the frontend path `/media/<filename>`. Ensure Vite component image URLs point to `category.image.url`.
  3. **Selection Identifier**: In `App.tsx`, active category selection is tracked by `category.name`. For CMS parity, track selection by `category.slug` to avoid whitespace or casing conflicts.

---

### 2. Products
* **Current Static Structure (`src/data/allbirds-data.ts`):**
  ```typescript
  export type Product = {
    name: string;
    label?: string; // Optional (e.g. "New Color", "New")
    color: string;
    price: string;
    swatch: string;
    imagePosition: string; // Crop offset, e.g. "0% 0%"
    fit: string;
    rating: string;
    tags: string[];
  };
  ```
* **Vite Components Usage (`ProductCard`):**
  - Displays `product.label` (defaults to `&nbsp;` if undefined).
  - Renders image using a CSS sprite sheet technique:
    `<div className="product-crop" style={{ backgroundPosition: product.imagePosition }} />`
    The background image `/allbirds-category-swatch.png` is hardcoded in the `.product-crop` CSS class with a fixed background-size of `205% 205%`.
  - Displays rating star with `product.rating` (string) and tags using `product.tags.map(...)`.
* **Payload CMS Collection (`products`):**
  - Config file: `Products.ts` (slug: `products`)
  - Fields: `name` (text), `price` (text), `colorways` (array of: `color` (text), `swatch` (text), `image` (relationship to `media`)), `fit` (text), `rating` (number), `tags` (array of objects with `tag` text field), `category` (relationship to `categories`), `sizes` (array of objects with `size` number field).
* **Mismatches & Recommendations:**
  1. **Sprite Sheet vs. Individual Images**: The CSS sprite sheet (`.product-crop` using backgroundPosition offsets) is incompatible with separate, dynamically uploaded media images.
     - *Recommendation*: Update `ProductCard` to render the actual image via `style={{ backgroundImage: `url(${product.colorways[0].image.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}` or change the markup to use a standard HTML `<img>` tag.
  2. **Missing `label` Field**: The Payload CMS product schema does not have a `label` field (e.g., "New Color").
     - *Recommendation*: Either update the Payload CMS `products` schema to include an optional `label` text field, or fallback to displaying the first tag in the tags array, or check for specific tags (e.g. "New") and style them as a badge.
  3. **Array Flattening Hooks**: Payload defines `afterRead` hooks in `Products.ts` that flatten the CMS array structures for `tags` (mapping array of `{ tag: string }` to `string[]`) and `sizes` (mapping `{ size: number }` to `number[]`).
     - *Recommendation*: Use these hook outputs directly. The API response will already provide `tags` as `string[]` and `sizes` as `number[]`, making them fully compatible with the existing frontend React types.
  4. **Price & Rating Types**: `rating` is a `number` in Payload but a `string` in the mock. In the UI, render it with `product.rating.toFixed(1)` or similar helper if formatting is required.
  5. **Multiple Colorways**: The CMS supports multiple colorways per product (via the `colorways` array). The storefront should initially pull `product.colorways[0]` to populate the primary swatch, color text, and image.

---

### 3. Hero Blocks / Header Hero
* **Current Static Structure:**
  - Hardcoded directly inside `src/components/header-hero.tsx` (image, headline text, and layout).
* **Payload CMS Collection (`hero-blocks`):**
  - Config file: `HeroBlocks.ts` (slug: `hero-blocks`)
  - Fields: `headline` (text), `body` (text/textarea), `ctaLabel` (text), `media` (relationship to `media`), `themeSwatch` (text).
* **Mismatches & Recommendations:**
  1. **Integration Target**: The hardcoded hero block should be populated by querying `/api/hero-blocks`. Since there will typically be only one active hero block, the frontend should fetch the list and use the first record (`docs[0]`).
  2. **Split CTA Action**: The storefront hero features tab-like buttons: `"Shop Men"` and `"Shop Women"`. The seeded CMS `ctaLabel` is `"Shop Men / Shop Women"`.
     - *Recommendation*: Use `ctaLabel.split(' / ')` in the React component to dynamically render the corresponding buttons/tabs (e.g. `["Shop Men", "Shop Women"]`).
  3. **Kicker / Body Mapping**: Map the kicker element (`All New Dasher NZ Collection` in the UI) to the `body` field of the CMS Hero record.
  4. **Image Source**: Map the main background image to `heroBlock.media.url`.

---

### 4. Materials
* **Current Static Structure (`src/data/allbirds-data.ts`):**
  - Uses a hardcoded `valueBlocks` array (title, body) and `materialMetrics` (value, label).
* **Vite Components Usage (`MaterialStory`):**
  - Maps static `materialMetrics` to a metric bar.
  - Maps static `valueBlocks` to a 3-column value grid showing the brand's sustainability highlights.
* **Payload CMS Collection (`materials`):**
  - Config file: `Materials.ts` (slug: `materials`)
  - Fields: `name` (text), `impactNote` (textarea), `textureImage` (relationship to `media`), `sourceRegion` (text).
* **Mismatches & Recommendations:**
  1. **Structural Difference**: The CMS collection `materials` models the actual material inputs (e.g. `Sugarcane SweetFoam®`, `Trino®`) rather than abstract marketing value blocks.
     - *Recommendation*: Replace the static mapping of `valueBlocks` in the `MaterialStory` value-grid with a dynamic list of CMS materials fetched from `/api/materials`.
     - Map `material.name` -> Card Title
     - Map `material.impactNote` -> Card Body (which corresponds exactly to the seeded values)
     - Render the material region of origin (`material.sourceRegion`) as a secondary label or badge.
  2. **Texture Image**: The CMS record includes `textureImage` as a relation. The frontend can display this as a background texture or thumbnail next to each card.
  3. **Metrics Status**: There is no CMS collection defined for `materialMetrics`. These metrics should remain static in the frontend codebase, or be added as a CMS global config if dynamic edits are requested later.

---

### 5. Reviews
* **Current Static Structure (`src/data/allbirds-data.ts`):**
  ```typescript
  export type Review = {
    quote: string;
    name: string;
    detail: string;
  };
  ```
* **Vite Components Usage (`ReviewsSection`):**
  - Renders quotes, reviewer names, and detail descriptors in a 3-column grid layout.
* **Payload CMS Collection (`reviews`):**
  - Config file: `Reviews.ts` (slug: `reviews`)
  - Fields: `product` (relationship to `products`), `quote` (textarea), `customerName` (text), `detail` (text).
* **Mismatches & Recommendations:**
  1. **Property Mapping**:
     - `review.quote` -> `quote`
     - `review.name` -> `customerName`
     - `review.detail` -> `detail` (seeded directly in the database as `"Tree Glider, Burlwood"` etc.).
  2. **Product Relation**: The CMS establishes a relationship to a specific product. This is currently not utilized in the homepage reviews section but can be leveraged in the future to filter reviews on a Product Detail Page (PDP).

---

### 6. Promo Tiles
* **Current Static Structure (`src/data/allbirds-data.ts`):**
  ```typescript
  export const promoTiles = [
    { title: "Spring Travel Essentials", swatch: "#e0dacf", image: "/allbirds-travel-promo.png" },
  ];
  ```
* **Vite Components Usage (`PromoSection`):**
  - Loops over tiles and sets them as background images with background color fallbacks.
* **Payload CMS Collection (`promo-tiles`):**
  - Config file: `PromoTiles.ts` (slug: `promo-tiles`)
  - Fields: `title` (text), `swatch` (text), `image` (relationship to `media`).
* **Mismatches & Recommendations:**
  1. **Image Resolution**: Access the image path via the populated relationship: `tile.image.url` instead of the direct `tile.image` string.

---

## Actionable Integration Strategy & Steps

1. **Create API Client Utility**:
   Implement a lightweight fetch service (e.g. `src/utils/api.ts`) pointing to the local Payload server running at `http://localhost:3000`.
2. **Expose Payload CMS Types**:
   Generate or compile TypeScript interfaces that represent the populated Payload responses. Since local media references are stored on the same machine, media URLs will map to `/media/name.ext` and can be resolved relative to the host.
3. **Refactor Components Step-by-Step**:
   - Begin with `SiteHeader` / `Hero` (simplest content replacement).
   - Move to `CategoryStrip` (updating image resolution and active state selectors).
   - Update `ProductSection` and resolve colorway arrays, switching from backgroundPosition crop sprites to dynamic CSS background images.
   - Refactor `MaterialStory` to bind to CMS materials instead of static value blocks.
   - Bind `ReviewsSection` and `PromoSection` to their respective endpoints.
