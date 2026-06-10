## 2026-06-10T03:37:43Z

You are the Performance Worker. Your task is to implement the asset optimization, WebP/AVIF format conversion, responsive image loading, and sprite sheet crop removal as outlined by the explorers' analysis.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Please execute the following implementation steps:
1. Split the 2x2 sprite sheet `F:/Allbirds/public/allbirds-category-swatch.png` into 4 quadrants of 256x256 pixels:
   - `allbirds-crop-top-left.png` (Top-Left)
   - `allbirds-crop-top-right.png` (Top-Right)
   - `allbirds-crop-bottom-left.png` (Bottom-Left)
   - `allbirds-crop-bottom-right.png` (Bottom-Right)
   You may write and run a Node.js script using `sharp` (which is installed in `payload-cms`) or execute a command to perform this extraction.
2. Update `F:/Allbirds/payload-cms/src/collections/Media.ts` with standard `imageSizes` (widths: 480, 768, 1024, 1280, 1536, 1920) and configure automatic formatting to WebP.
3. Update the database seed script `F:/Allbirds/payload-cms/src/seed.ts` to:
   - Seed the 4 new cropped image assets instead of the old sprite sheet.
   - Associate each product with its correct individual cropped image quadrant.
   - Re-seed the local database by running `npm run seed` inside `payload-cms/`.
4. Create a Node.js image optimization script (e.g., `F:/Allbirds/scripts/optimize-static-images.js`) using `sharp` to convert all active static fallback images under `public/` (including the 4 new crops and other active PNGs) to WebP and AVIF formats with responsive sizes (480w, 768w, 1024w, 1280w, 1536w, 1920w) and save them to `public/optimized/`. Run this script.
5. Update `F:/Allbirds/src/utils/cms-client.ts` with the new type declarations for Payload CMS `CmsMedia` sizes and implement the `getImageSrcSet(image)` helper function.
6. Create the React component `F:/Allbirds/src/components/responsive-image.tsx` which renders a `<picture>` element supporting both static optimized paths and Payload CMS dynamic image sizes (fetching the correct resolution via `srcset` and `sizes`).
7. Refactor the storefront components under `F:/Allbirds/src/components/` to use `<ResponsiveImage>`:
   - `header-hero.tsx` (Hero Image)
   - `commerce-sections.tsx` (SpotlightCard, ProductCard product-crop, MvpSection, PromoSection)
   - `content-sections.tsx` (MaterialStory)
   Remove all CSS-based background-image crops, sprite sheet coordinate mapping (`imagePosition`), and inline CSS overrides for these images.
8. Update `F:/Allbirds/src/data/allbirds-data.ts` to remove `imagePosition` fields and reference the individual crops as fallback URLs.
9. Clean up `F:/Allbirds/src/styles.css` classes related to `.product-crop` background image styling.
10. Verify that the storefront typescript compiles and builds cleanly by running `npm run build` in the root storefront folder.

Document all your actions, code changes, and verification commands in F:/Allbirds/.agents/teamwork_preview_worker_performance/changes.md, and write a Handoff report in F:/Allbirds/.agents/teamwork_preview_worker_performance/handoff.md.

Report back using send_message with status DONE when complete.

Work context: F:/Allbirds
Reports: F:/Allbirds/plans/reports/
Working directory: F:/Allbirds/.agents/teamwork_preview_worker_performance
Parent ID: ccea9e1b-446c-4851-a9bc-a6064603699a
