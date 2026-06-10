# Change Log

This file documents all the modifications made to implement the asset optimization, WebP/AVIF format conversion, responsive image loading, and sprite sheet crop removal in the Allbirds storefront and Payload CMS.

## 1. Split the 2x2 Sprite Sheet
- **Command:** `node scripts/crop-images.js`
- **Output:** Split `F:/Allbirds/public/allbirds-category-swatch.png` (512x512 pixels) into 4 quadrants of 256x256 pixels:
  - `F:/Allbirds/public/allbirds-crop-top-left.png` (Top-Left)
  - `F:/Allbirds/public/allbirds-crop-top-right.png` (Top-Right)
  - `F:/Allbirds/public/allbirds-crop-bottom-left.png` (Bottom-Left)
  - `F:/Allbirds/public/allbirds-crop-bottom-right.png` (Bottom-Right)

## 2. Updated Payload CMS Configurations & Database Seeding
- **File:** `F:/Allbirds/payload-cms/package.json`
  - Added dependency `"sharp": "^0.34.5"` (and run `npm install sharp --save --legacy-peer-deps` inside `payload-cms/`).
- **File:** `F:/Allbirds/payload-cms/src/payload.config.ts`
  - Imported `sharp` and passed it into the build configuration to resolve the "sharp not installed" warning and enable automatic resizing/conversions.
- **File:** `F:/Allbirds/payload-cms/src/collections/Media.ts`
  - Specified standard `imageSizes` with widths: 480, 768, 1024, 1280, 1536, 1920.
  - Set `formatOptions` to automatically convert uploads to WebP.
- **File:** `F:/Allbirds/payload-cms/src/seed.ts`
  - Seeded the 4 new cropped image assets instead of the old sprite sheet.
  - Associated products and categories with their individual cropped image quadrants instead of a shared coordinate.
  - Executed `npm run seed` inside `payload-cms/` successfully.

## 3. Node.js Static Image Optimization Script
- **File:** `F:/Allbirds/scripts/optimize-static-images.js`
  - Created a Node.js script using `sharp` to process all active static fallback images under `public/` (including the 4 new crops and other active PNGs).
  - Converted them to WebP and AVIF formats with responsive widths: 480w, 768w, 1024w, 1280w, 1536w, 1920w.
  - Saved outputs to `F:/Allbirds/public/optimized/`.
  - Executed `node scripts/optimize-static-images.js` successfully.

## 4. Frontend Types and Responsive Image Components
- **File:** `F:/Allbirds/src/utils/cms-client.ts`
  - Added TypeScript declarations for the `Media` collection sizes (with width properties: `width-480`, `width-768`, etc.).
  - Implemented `getImageSrcSet(image)` helper function to construct appropriate `srcset` attributes from CMS media object sizes.
- **File:** `F:/Allbirds/src/components/responsive-image.tsx`
  - Created `<ResponsiveImage>` component rendering a `<picture>` element supporting both static optimized paths and Payload CMS dynamic image sizes (fetching resolution via `srcset` and `sizes`).
- **File:** `F:/Allbirds/src/data/allbirds-data.ts`
  - Removed `imagePosition` properties from fallback datasets.
  - Updated category/product entries to point to the individual cropped fallback image paths.

## 5. Refactored Storefront Components and Styles
- **Files Modified:**
  - `F:/Allbirds/src/components/header-hero.tsx` (Hero Image)
  - `F:/Allbirds/src/components/commerce-sections.tsx` (SpotlightCard, ProductCard, MvpSection, PromoSection)
  - `F:/Allbirds/src/components/content-sections.tsx` (MaterialStory)
- **Refactoring Details:**
  - Replaced native `<img>` and `style={{ backgroundImage: ... }}` overrides with `<ResponsiveImage>`.
  - Removed all CSS-based background crops, coordinate mapping, and inline positioning overrides.
- **File:** `F:/Allbirds/src/styles.css`
  - Removed `.product-crop` background image styling rules, keeping clean CSS classes.

## 6. Verification
- Run `npm run build` inside the root storefront folder `F:/Allbirds/`.
- **Result:** Vite build successfully completed with 0 errors and 0 warnings.
