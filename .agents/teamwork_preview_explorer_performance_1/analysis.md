# Storefront Image Optimization Analysis

## Executive Summary
All mock images in `F:/Allbirds/public` are unoptimized lossless PNGs (~16.2 MB total), leading to significant performance bottlenecks (LCP, page weight). We recommend converting them to WebP/AVIF formats and generating responsive sizes (480w to 1920w) handled via Payload CMS uploads and a custom frontend React `<ResponsiveImage>` component.

---

## 1. Public Mock Image Assets Inventory
The following image files were analyzed in `F:/Allbirds/public`:

| Image Filename | Format | Dimensions | Size (Bytes) | Size (MB) | Storefront Use | Optimization Potential |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `allbirds-category-swatch.png` | PNG | 1254 x 1254 | 1,430,159 | ~1.36 MB | **High** (Fallback & Categories) | 90%+ reduction via WebP/AVIF |
| `allbirds-hero-linen.png` | PNG | 1568 x 1003 | 2,044,119 | ~1.95 MB | **None** (Seeded but not rendered) | 95%+ reduction via WebP/AVIF |
| `allbirds-lifestyle-hero.png` | PNG | 1586 x 992 | 2,098,819 | ~2.00 MB | **High** (Hero Banner & Men's) | 95%+ reduction via WebP/AVIF |
| `allbirds-material-texture.png` | PNG | 1672 x 941 | 2,561,648 | ~2.44 MB | **High** (Material Story section) | 95%+ reduction via WebP/AVIF |
| `allbirds-mvp-lifestyle.png` | PNG | 1254 x 1254 | 3,031,689 | ~2.89 MB | **High** (MVP Section & Women's) | 95%+ reduction via WebP/AVIF |
| `allbirds-travel-promo.png` | PNG | 1122 x 1402 | 2,337,992 | ~2.23 MB | **High** (Best Sellers & Promo) | 90%+ reduction via WebP/AVIF |
| `workflow-material-board.png` | PNG | 1570 x 1001 | 2,456,320 | ~2.34 MB | **None** (Workflow guide only) | Internal documentation asset |
| `screenshot.jpeg` | JPEG | 1200 x 750 | 128,052 | ~125 KB | **None** (Project preview only) | Already compressed; minor gains |

**Total public folder image size:** ~16.2 MB.
**Total storefront active image size:** ~11.42 MB (excluding reference/unused files).

---

## 2. Storefront Component Mappings
Storefront components rendering these files were traced in `F:/Allbirds/src/`:

### A. `src/data/allbirds-data.ts`
- **Line 21-24**: References `allbirds-category-swatch.png`, `allbirds-lifestyle-hero.png`, `allbirds-mvp-lifestyle.png`, and `allbirds-travel-promo.png` in fallback categories array.
- **Line 117-119**: References `allbirds-travel-promo.png`, `allbirds-mvp-lifestyle.png`, and `allbirds-category-swatch.png` in fallback promoTiles array.

### B. `src/components/header-hero.tsx` (Hero Component)
- **Line 55, 59**: Resolves `imageUrl` from CMS `hero.media` fallback to `/allbirds-lifestyle-hero.png` and renders it via an HTML `<img>` tag:
  ```tsx
  <img src={imageUrl} alt="Allbirds-inspired natural runner shoes on city steps" />
  ```

### C. `src/components/commerce-sections.tsx`
- **SpotlightCard (Line 201)**: Renders a category banner with `/allbirds-category-swatch.png` as fallback:
  ```tsx
  <img src={imageUrl || "/allbirds-category-swatch.png"} alt="" aria-hidden="true" />
  ```
- **ProductCard (Line 226-228, 271)**: Renders colorway image via CSS `background-image` inline style for cropping, defaulting to swatch / placeholder images:
  ```tsx
  const cropStyle: React.CSSProperties = imageUrl 
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundPosition: product.imagePosition };
  // Defaults use: /allbirds-category-swatch.png, /allbirds-lifestyle-hero.png, /allbirds-mvp-lifestyle.png
  ```
- **MvpSection (Line 376, 384)**: Direct static rendering of unoptimized PNGs:
  ```tsx
  <img src="/allbirds-mvp-lifestyle.png" alt="Natural shoes and travel essentials on linen" />
  <img src="/allbirds-category-swatch.png" alt="Muted Allbirds-inspired shoe colorways" />
  ```
- **PromoSection (Line 407-411)**: Uses promoTilesList resolved URLs as `backgroundImage` fallbacks.

### D. `src/components/content-sections.tsx` (MaterialStory Component)
- **Line 32**: Renders texture PNG statically:
  ```tsx
  <img src="/allbirds-material-texture.png" alt="Natural material swatches on linen" />
  ```

### E. `src/styles.css`
- **Line 44**: References the default swatch image in CSS:
  ```css
  .product-crop { background-image:url("/allbirds-category-swatch.png"); ... }
  ```

### F. CMS Seed Script (`payload-cms/src/seed.ts`)
- **Line 42-49**: Seeds these exact 6 images into Payload's SQLite database on initialization and links them to categories, products, materials, promo tiles, and hero blocks.

---

## 3. Image Optimization Strategy

We propose a multi-layered optimization strategy covering CMS configuration, static fallback generation, and responsive React frontend components.

### 1. CMS-Side Media Processing Configuration
Payload 3.x utilizes `sharp` internally for image processing. We can configure the `Media` collection config in `payload-cms/src/collections/Media.ts` to automatically resize and transcode images on upload.

#### Proposed Configuration Update (`payload-cms/src/collections/Media.ts`):
```typescript
import { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*'],
    // 1. Generate multiple width-based responsive sizes on upload
    imageSizes: [
      { name: 'w480', width: 480, height: null },
      { name: 'w768', width: 768, height: null },
      { name: 'w1024', width: 1024, height: null },
      { name: 'w1280', width: 1280, height: null },
      { name: 'w1536', width: 1536, height: null },
      { name: 'w1920', width: 1920, height: null },
    ],
    // 2. Instruct Sharp to format all generated uploads as WebP or AVIF
    formatOptions: {
      format: 'webp',
      options: { quality: 80, effort: 4 },
    },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
```

*Note*: Since generating both AVIF and WebP sizes requires configuring multiple formats, we can define custom sharp hooks to output dual formats or utilize a CDN/Image Proxy for format negotiation, or format WebP as the base and let Payload produce it.

---

### 2. Static Fallback Optimization
For static fallback assets (where the CMS connection fails or falls back to `public/`), we must pre-optimize the raw PNGs.

We propose a Node script `scripts/optimize-static-images.js` using `sharp`:
- Reads raw PNG files from `F:/Allbirds/public`.
- Generates optimized `.webp` and `.avif` versions.
- Resizes them into target breakpoints (`480w`, `768w`, `1024w`, `1280w`, `1536w`, `1920w`).
- Saves them into `F:/Allbirds/public/optimized/`.

#### Script Outline (`scripts/optimize-static-images.js`):
```javascript
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const inputDir = 'public';
const outputDir = 'public/optimized';
const widths = [480, 768, 1024, 1280, 1536, 1920];
const formats = ['webp', 'avif'];

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const imagesToOptimize = [
  'allbirds-category-swatch.png',
  'allbirds-lifestyle-hero.png',
  'allbirds-material-texture.png',
  'allbirds-mvp-lifestyle.png',
  'allbirds-travel-promo.png'
];

async function run() {
  for (const img of imagesToOptimize) {
    const filePath = path.join(inputDir, img);
    if (!fs.existsSync(filePath)) continue;
    
    const baseName = path.basename(img, path.extname(img));
    
    for (const format of formats) {
      for (const width of widths) {
        const outName = `${baseName}-${width}w.${format}`;
        const outPath = path.join(outputDir, outName);
        
        await sharp(filePath)
          .resize({ width })
          .toFormat(format, { quality: format === 'avif' ? 65 : 80 })
          .toFile(outPath);
        
        console.log(`Generated: ${outName}`);
      }
    }
  }
}
run();
```

---

### 3. Frontend Responsive Image Component (`<ResponsiveImage>`)
To render optimized and responsive images without cluttering storefront code, we construct a reusable component.

#### Implementation Specification (`src/components/responsive-image.tsx`):
```tsx
import React from 'react';

interface ResponsiveImageProps {
  src: string; // fallback / original path (e.g. "/allbirds-lifestyle-hero.png")
  alt: string;
  className?: string;
  sizes?: string; // e.g. "(max-width: 920px) 100vw, 50vw"
  style?: React.CSSProperties;
}

export function ResponsiveImage({ src, alt, className, sizes = "100vw", style }: ResponsiveImageProps) {
  // If the image is loaded from the CMS media uploads subfolder, we can use Payload sizes:
  const isCmsMedia = src.includes('/media/');
  
  if (isCmsMedia) {
    const baseDir = src.substring(0, src.lastIndexOf('/') + 1);
    const fileName = src.substring(src.lastIndexOf('/') + 1);
    const dotIdx = fileName.lastIndexOf('.');
    const rawName = fileName.substring(0, dotIdx);
    const ext = fileName.substring(dotIdx);

    const widths = [480, 768, 1024, 1280, 1536, 1920];
    
    // In Payload, resized paths follow a suffix or custom key folder depending on upload configs.
    // Assuming size configuration generates files like "filename-w480.ext":
    const webpSrcset = widths.map(w => `${baseDir}${rawName}-w${w}.webp ${w}w`).join(', ');
    
    return (
      <picture className={className} style={{ display: 'block', overflow: 'hidden' }}>
        <source srcSet={webpSrcset} type="image/webp" sizes={sizes} />
        <img src={src} alt={alt} style={{ width: '100%', height: 'auto', ...style }} loading="lazy" />
      </picture>
    );
  }

  // Local static fallback image mapping to optimized folder:
  if (src.startsWith('/allbirds-') && src.endsWith('.png')) {
    const rawName = src.replace('/allbirds-', '').replace('.png', '');
    const widths = [480, 768, 1024, 1280, 1536, 1920];
    
    const avifSrcset = widths.map(w => `/optimized/${rawName}-${w}w.avif ${w}w`).join(', ');
    const webpSrcset = widths.map(w => `/optimized/${rawName}-${w}w.webp ${w}w`).join(', ');
    const fallbackSrc = `/optimized/${rawName}-1024w.webp`; // Default optimized size

    return (
      <picture className={className} style={{ display: 'block', overflow: 'hidden' }}>
        <source srcSet={avifSrcset} type="image/avif" sizes={sizes} />
        <source srcSet={webpSrcset} type="image/webp" sizes={sizes} />
        <img src={fallbackSrc} alt={alt} style={{ width: '100%', height: 'auto', ...style }} loading="lazy" />
      </picture>
    );
  }

  // Fallback to default img
  return <img src={src} alt={alt} className={className} style={{ width: '100%', height: 'auto', ...style }} loading="lazy" />;
}
```

---

### 4. Background Image Replacement Strategy
Components using inline styles or CSS rules for `background-image` cannot leverage browser-native `<picture>` format negotiation.

- **Option A (Markup Conversion - Recommended)**: Change card items (e.g. `ProductCard` crop `div`, `PromoSection` card container) to use relative positioning (`position: relative`) with a `<ResponsiveImage>` inside it styled as:
  ```css
  .responsive-bg-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -1;
  }
  ```
  This allows full AVIF/WebP responsive sizing for product grids and promo cards.
- **Option B (CSS `image-set` fallback)**: If CSS background properties must be preserved, define class names dynamically and leverage CSS `image-set()` or media queries with `@media` tags. However, dynamic inline styles (e.g. CMS colors or images) make Option A far cleaner and more performant.

---

## 4. Proposed Conversion List (Actions for Implementer)

| Step | Action Item | Target Path | Rationale |
| :--- | :--- | :--- | :--- |
| **1** | Install `sharp` in `payload-cms` if not present. | `payload-cms/package.json` | Required for image transcoding/resizing in Payload. |
| **2** | Update Media collection upload options. | `payload-cms/src/collections/Media.ts` | Configures automated resizing and WebP conversion for CMS admin uploads. |
| **3** | Add static optimization script. | `scripts/optimize-static-images.js` | Pre-processes fallback images in `public/` folder. |
| **4** | Build & run the script to generate optimized output. | `public/optimized/*` | Populates the output folders with WebP/AVIF images. |
| **5** | Add `<ResponsiveImage>` helper component. | `src/components/responsive-image.tsx` | Standardizes responsive image rendering storefront-wide. |
| **6** | Replace target references in `src/components/` with `<ResponsiveImage>`. | `header-hero.tsx`, `commerce-sections.tsx`, `content-sections.tsx` | Updates storefront elements to load optimized sources. |

---

## 5. Unresolved Questions
1. **Target Quality Constraints**: Should AVIF quality be set to `65` (visually lossless but extremely small) and WebP to `80`, or does the client require higher fidelity for swatch and texture details?
2. **CMS Resizing Architecture**: Does the production CMS run behind a CDN/Image Proxy (like Cloudinary, Imgix, or Vercel Image Optimization) which negates the need for local filesystem image sizes, or should resizing be completely handled locally by Payload CMS/SQLite?
