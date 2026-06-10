# Handoff Report - Explorer 3

## 1. Observation
We observed the following configurations and code segments in the storefront codebase:
*   **Media Queries**:
    `F:/Allbirds/src/styles.css` defines two layout breakpoints:
    *   Line 96: `@media (max-width:920px) { .top-nav,.spotlight-card,.material-band,.footer { grid-template-columns:1fr; } ... }`
    *   Line 97: `@media (max-width:560px) { ... .category-grid,.product-grid,.payload-grid,.promo-grid,.mvp-grid,.value-grid,.metric-row,.review-grid,.footer nav { grid-template-columns:1fr; } ... }`
*   **Hero Image**:
    `src/components/header-hero.tsx` (line 59): `<img src={imageUrl} alt="Allbirds-inspired natural runner shoes on city steps" />`
*   **Spotlight Image**:
    `src/components/commerce-sections.tsx` (line 201): `<img src={imageUrl || "/allbirds-category-swatch.png"} alt="" aria-hidden="true" />`
*   **Product Card CSS background-image**:
    `src/components/commerce-sections.tsx` (lines 248-250 / 271):
    ```typescript
    const cropStyle: React.CSSProperties = imageUrl 
      ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
      : { backgroundPosition: product.imagePosition };
    ```
    ```tsx
    <div className="product-swatch" ...>
      <div className="product-crop" style={cropStyle} />
    </div>
    ```
*   **MVP Section Images**:
    `src/components/commerce-sections.tsx` (lines 376, 384):
    `<img src="/allbirds-mvp-lifestyle.png" alt="Natural shoes and travel essentials on linen" />`
    `<img src="/allbirds-category-swatch.png" alt="Muted Allbirds-inspired shoe colorways" />`
*   **Promo Section CSS background-image**:
    `src/components/commerce-sections.tsx` (line 404):
    ```tsx
    <article key={tile.title} className="promo-card" style={{ backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, ... }}>
    ```
*   **Material Story Image**:
    `src/components/content-sections.tsx` (line 32):
    `<img src="/allbirds-material-texture.png" alt="Natural material swatches on linen" />`
*   **Payload Media Collection**:
    `payload-cms/src/collections/Media.ts` (lines 8-24) defines an upload collection but lists no `imageSizes` or resize actions under `upload`.

---

## 2. Logic Chain
1.  **Breakpoint Identification**: The style rules in `styles.css` dictate layout change transitions at `560px` and `920px`. Therefore, these must serve as the primary breakpoints for our responsive images.
2.  **LCP vs Lazy Load Selection**: The header `Hero` is located at the top of the storefront page above the fold and serves as the Largest Contentful Paint (LCP) element. To optimize LCP, it should load eagerly (`loading="eager"` or omitting `loading="lazy"`), whereas all other images are below-the-fold and should load lazily (`loading="lazy"`).
3.  **Refactoring Background-Images to `<imgSet>` or `<img>`**: Elements like the Product Card crop and Promo Card use CSS background images. CSS background images do not natively support browser-level responsive resolution selection (`srcset` and `sizes` attributes) without complex Client-side measurements or inline style injections. Refactoring them to use `<img>` with `object-fit: cover` and absolute positioning/flex wrapper elements allows native responsive browser loading.
4.  **Backend Integration**: Payload CMS supports auto-generation of cropped size variations during upload via the `imageSizes` configuration on Upload Collections. Adding these sizes in the backend configuration guarantees that resized files (like `card`, `tablet`, `desktop`) will be created automatically.
5.  **Clean abstractions**: A custom `<ResponsiveImage>` component avoids duplicated `srcset` logic and keeps storefront image tags clean, uniform, and DRY.

---

## 3. Caveats
*   Static public files in `public/` (like fallback images `/allbirds-lifestyle-hero.png`) are not processed by Payload CMS. For these images, we assume standard fallback sizes can either be pre-rendered/placed in public or that browsers will fall back to the main un-resized image.
*   We did not run the storefront build command `npm run build` or test server execution because this task is strictly a read-only investigation with proposed configurations.

---

## 4. Conclusion
We recommend configuring standard image sizes (`thumbnail`, `card`, `tablet`, `desktop`, `hero`) in Payload CMS's upload collection, exporting helper function `getImageSrcSet(image)` in `cms-client.ts`, creating a new shared `<ResponsiveImage>` component, and refactoring both native `<img>` elements and background-image wrapper containers to support responsive sizes and eager/lazy loading parameters.

---

## 5. Verification Method
1.  **Static Build**: Run `npm run build` from the workspace root to verify the compilation of typescript and compilation rules.
2.  **Element Inspection**: Open the browser's developer console and inspect the storefront page to ensure that `srcset` and `sizes` attributes are properly injected.
3.  **Network Tab Trace**: In Chrome Developer Tools, verify that correct resolution image sizes (e.g. tablet crop size for mobile viewports) are requested dynamically.
