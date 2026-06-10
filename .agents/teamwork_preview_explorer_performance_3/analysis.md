# Responsive Image Loading Implementation Plan

This document details the analysis of storefront image usage and a comprehensive plan to implement responsive image loading with proper `srcset` and `sizes` attributes, utilizing Payload CMS's auto-resizing capabilities.

---

## 1. Storefront Image Audit & Findings

### Image Elements Catalog
An investigation of components under `F:/Allbirds/src` reveals the following image elements:

| Component | Target Element | Current Markup / CSS | Layout Behaviour & Sizing | Performance Priority |
|---|---|---|---|---|
| `Hero` (`header-hero.tsx`) | `<img>` (line 59) | `<img src={imageUrl} alt="..." />` | Full screen width background (`100vw`). | **Critical (LCP)** |
| `SpotlightCard` (`commerce-sections.tsx`) | `<img>` (line 201) | `<img src={imageUrl ...} alt="" aria-hidden="true" />` | Two columns (`.9fr 1fr`) on Desktop (>920px); Stacked (`1fr`) on Tablet/Mobile. | **Medium-High** |
| `ProductCard` (`commerce-sections.tsx`) | `div` (line 271) | `backgroundImage: url(${imageUrl})` | CSS background-image in grid. Desktop: 4 columns. Tablet: 2 columns. Mobile: 1 column. | **High** |
| `MvpSection` (`commerce-sections.tsx`) | `<img>` (lines 376, 384) | `<img src="/allbirds-mvp-lifestyle.png" ... />` | 4 columns on Desktop. 2 columns on Tablet. 1 column on Mobile. | **Medium** |
| `PromoSection` (`commerce-sections.tsx`) | `article` (line 404) | `backgroundImage: imageUrl ? url(${imageUrl}) : ...` | CSS background-image. Desktop: 3 columns. Tablet: 2 columns. Mobile: 1 column. | **Medium** |
| `MaterialStory` (`content-sections.tsx`) | `<img>` (line 32) | `<img src="/allbirds-material-texture.png" ... />` | Desktop: 2 columns (`.8fr 1.2fr`). Tablet/Mobile: Stacked (`1fr`). | **Medium** |

---

## 2. Design of Responsive Breakpoints & Sizing Logic

Based on the media queries in `F:/Allbirds/src/styles.css`, the layout changes layout columns at two specific breakpoints:
*   **Mobile View**: up to `560px` (`max-width: 560px`)
*   **Tablet View**: `561px` to `920px` (`max-width: 920px`)
*   **Desktop View**: `921px` and above

### Proposed `sizes` Mapping Formula for Storefront Components:

1.  **Hero Image**
    *   *Sizes Attribute*: `100vw`
    *   *Rationale*: Always spans the full width of the screen.

2.  **Spotlight Card Image**
    *   *Sizes Attribute*: `(max-width: 920px) calc(100vw - 88px), (max-width: 1280px) 47vw, 590px`
    *   *Rationale*: Stacked under 920px with 44px padding on each side. On desktop (>920px), takes up `.9fr / 1.9fr` (~47%) of container, capped at `590px` when section max-width (1280px) is reached.

3.  **Product Card Images (Refactored to `<img>`)**
    *   *Sizes Attribute*: `(max-width: 560px) calc(100vw - 42px), (max-width: 920px) calc(50vw - 28px), (max-width: 1280px) 25vw, 300px`
    *   *Rationale*: 1 column on Mobile (card takes up full width minus body/card padding), 2 columns on Tablet (each takes ~50vw minus gap/padding), 4 columns on Desktop (each takes ~25vw capped at ~300px on viewports > 1280px).

4.  **MVP Section Images**
    *   *Sizes Attribute*: `(max-width: 560px) calc(100vw - 40px), (max-width: 920px) calc(50vw - 20px), 25vw`
    *   *Rationale*: No max-width wrapper on `.mvp-section`, so grid columns scale dynamically with viewport width: 1 column on Mobile, 2 columns on Tablet, 4 columns on Desktop.

5.  **Promo Card Background Images (Refactored to `<img>`)**
    *   *Sizes Attribute*: `(max-width: 560px) calc(100vw - 40px), (max-width: 920px) calc(50vw - 28px), 33vw`
    *   *Rationale*: 3 columns on Desktop, 2 columns on Tablet, 1 column on Mobile. No max-width wrapper on container.

6.  **Material Story Image**
    *   *Sizes Attribute*: `(max-width: 920px) calc(100vw - 40px), 40vw`
    *   *Rationale*: Stacked on Mobile/Tablet (full content width), occupied `.8fr / 2.0fr` (40% width) on Desktop.

---

## 3. Proposed Code Proposals

### A. Payload CMS configuration update
Define standard `imageSizes` in the upload configurations of `Media` collection to automatically crop and resize uploaded storefront assets.

**Target File**: `F:/Allbirds/payload-cms/src/collections/Media.ts`

```typescript
// Replace lines 8-24 with:
export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(dirname, '../../public/media'),
    mimeTypes: ['image/*'],
    imageSizes: [
      {
        name: 'thumbnail',
        width: 150,
        height: 150,
        crop: 'centre',
      },
      {
        name: 'card',
        width: 400,
        height: null,
      },
      {
        name: 'tablet',
        width: 800,
        height: null,
      },
      {
        name: 'desktop',
        width: 1200,
        height: null,
      },
      {
        name: 'hero',
        width: 1600,
        height: null,
      },
    ],
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

### B. Utility Functions updates in CMS Client
We must update type interfaces to properly describe Payload's resized versions and add a helper function `getImageSrcSet(image)` to output a standard `srcset` string.

**Target File**: `F:/Allbirds/src/utils/cms-client.ts`

```typescript
// Proposed Interfaces
export interface CmsMediaSize {
  url: string;
  width: number;
  height: number;
  mimeType: string;
  filesize: number;
  filename: string;
}

export interface CmsMedia {
  id: string;
  url: string;
  alt: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number;
  height: number;
  sizes?: {
    thumbnail?: CmsMediaSize;
    card?: CmsMediaSize;
    tablet?: CmsMediaSize;
    desktop?: CmsMediaSize;
    hero?: CmsMediaSize;
  };
}

// Proposed functions to append to cms-client.ts:
export function getImageSrcSet(image: any): string {
  if (!image || typeof image === "string") return "";
  
  if (image && typeof image === "object") {
    const srcsets: string[] = [];
    
    // 1. Add original high-res image
    if (image.url && image.width) {
      srcsets.push(`${resolveCmsUrl(image.url)} ${image.width}w`);
    }
    
    // 2. Add size crops generated by Payload CMS upload configuration
    if (image.sizes && typeof image.sizes === "object") {
      Object.keys(image.sizes).forEach((key) => {
        const sizeVal = image.sizes[key];
        if (sizeVal && sizeVal.url && sizeVal.width) {
          srcsets.push(`${resolveCmsUrl(sizeVal.url)} ${sizeVal.width}w`);
        }
      });
    }
    
    return srcsets.join(", ");
  }
  
  return "";
}
```

### C. Create a `<ResponsiveImage>` component
To make responsive image tags clean and DRY across all components, introduce a new component `src/components/ResponsiveImage.tsx`.

**Proposed File**: `F:/Allbirds/src/components/responsive-image.tsx`

```typescript
import React from "react";
import { getImageUrl, getImageSrcSet } from "../utils/cms-client";

interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  image: any;
  fallbackSrc?: string;
  lazy?: boolean;
}

export function ResponsiveImage({ 
  image, 
  fallbackSrc, 
  sizes, 
  alt = "", 
  lazy = true, 
  style, 
  ...props 
}: ResponsiveImageProps) {
  const src = getImageUrl(image) || fallbackSrc || "";
  const srcSet = getImageSrcSet(image);
  
  // Extract alt text from CMS media object if not provided in props
  const resolvedAlt = alt || (image && typeof image === "object" && image.alt) || "";

  return (
    <img
      src={src}
      srcSet={srcSet || undefined}
      sizes={sizes}
      alt={resolvedAlt}
      loading={lazy ? "lazy" : "eager"}
      style={{
        display: "block",
        maxWidth: "100%",
        height: "auto",
        ...style
      }}
      {...props}
    />
  );
}
```

### D. Storefront Components Integration Refactoring Diffs

#### 1. Hero Lifestyle Image Refactor (`src/components/header-hero.tsx`)
Optimize LCP by disabling lazy loading and setting `srcset` and `sizes`.

```tsx
// Before (Line 59):
<img src={imageUrl} alt="Allbirds-inspired natural runner shoes on city steps" />

// Proposed After:
<ResponsiveImage 
  image={hero?.media} 
  fallbackSrc="/allbirds-lifestyle-hero.png" 
  alt="Allbirds-inspired natural runner shoes on city steps" 
  sizes="100vw"
  lazy={false} // Disable lazy load for LCP
/>
```

#### 2. Spotlight Card Image Refactor (`src/components/commerce-sections.tsx`)

```tsx
// Before (Line 201):
<img src={imageUrl || "/allbirds-category-swatch.png"} alt="" aria-hidden="true" />

// Proposed After:
<ResponsiveImage
  image={activeCatObj?.image}
  fallbackSrc="/allbirds-category-swatch.png"
  alt=""
  aria-hidden="true"
  sizes="(max-width: 920px) calc(100vw - 88px), (max-width: 1280px) 47vw, 590px"
/>
```

#### 3. Product Card Image Crop CSS Refactor (`src/components/commerce-sections.tsx`)
Refactor background-image to an `<img>` tag to leverage native responsive capabilities.

```tsx
// Before (Lines 248-271):
const cropStyle: React.CSSProperties = imageUrl 
  ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  : { backgroundPosition: product.imagePosition };

// ... inside render:
<div className="product-swatch" ...>
  <div className="product-crop" style={cropStyle} />
</div>

// Proposed After:
// Modify styles.css slightly: 
// .product-crop { position: relative; overflow: hidden; height: 100%; min-height: 230px; width: 100%; }
// .product-crop img { width: 100%; height: 100%; object-fit: cover; }
//
// Inside React Component:
<div className="product-swatch" ...>
  <div className="product-crop">
    <ResponsiveImage
      image={activeColorway.image}
      fallbackSrc="/allbirds-category-swatch.png"
      alt={product.name}
      sizes="(max-width: 560px) calc(100vw - 42px), (max-width: 920px) calc(50vw - 28px), (max-width: 1280px) 25vw, 300px"
      style={{
        objectPosition: product.imagePosition || "center"
      }}
    />
  </div>
</div>
```

#### 4. Promo Section Card CSS Refactor (`src/components/commerce-sections.tsx`)
Refactor promo tile container background image to absolute positioned image tags.

```tsx
// Before (Lines 404-411):
<article 
  key={tile.title} 
  className="promo-card" 
  style={{ 
    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined, 
    backgroundColor: tile.swatch 
  }}
>

// Proposed After:
// Modify styles.css:
// .promo-card { position: relative; overflow: hidden; }
// .promo-card-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; }
// .promo-card-content { position: relative; z-index: 1; height: 100%; display: grid; align-content: end; }
//
// Inside React Component:
<article key={tile.title} className="promo-card" style={{ backgroundColor: tile.swatch }}>
  {imageUrl && (
    <ResponsiveImage
      image={tile.image}
      fallbackSrc=""
      alt=""
      className="promo-card-bg"
      sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 920px) calc(50vw - 28px), 33vw"
    />
  )}
  <div className="promo-card-content">
    <h2>{tile.title}</h2>
    <div>
      <a className="pill-button light" href="#new-arrivals">Shop Men</a>
      <a className="pill-button light" href="#new-arrivals">Shop Women</a>
    </div>
  </div>
</article>
```

#### 5. MVP Section Images Refactor (`src/components/commerce-sections.tsx`)

```tsx
// Before (Lines 376, 384):
<img src="/allbirds-mvp-lifestyle.png" alt="Natural shoes and travel essentials on linen" />
...
<img src="/allbirds-category-swatch.png" alt="Muted Allbirds-inspired shoe colorways" />

// Proposed After:
<ResponsiveImage 
  image={null} 
  fallbackSrc="/allbirds-mvp-lifestyle.png" 
  alt="Natural shoes and travel essentials on linen" 
  sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 920px) calc(50vw - 20px), 25vw"
/>
...
<ResponsiveImage 
  image={null} 
  fallbackSrc="/allbirds-category-swatch.png" 
  alt="Muted Allbirds-inspired shoe colorways" 
  sizes="(max-width: 560px) calc(100vw - 40px), (max-width: 920px) calc(50vw - 20px), 25vw"
/>
```

#### 6. Material Story Image Refactor (`src/components/content-sections.tsx`)

```tsx
// Before (Line 32):
<img src="/allbirds-material-texture.png" alt="Natural material swatches on linen" />

// Proposed After:
<ResponsiveImage 
  image={null} 
  fallbackSrc="/allbirds-material-texture.png" 
  alt="Natural material swatches on linen" 
  sizes="(max-width: 920px) calc(100vw - 40px), 40vw"
/>
```

---

## 4. Verification Methods

To independently verify the success of the responsive image implementation:
1.  **Vite Build Check**: Execute `npm run build` from the workspace root to ensure typescript compiles correctly and there are no bundler/compilation errors.
2.  **Browser Inspector Check**:
    *   Inspect elements to verify that the generated HTML output contains the `srcset` and `sizes` attributes matching the design formula.
    *   Verify in the Chrome Developer Tools Network Tab (filtering by "Img") that as the viewport is resized (or simulated under mobile responsive views), the browser fetches the correct scaled resolution version (e.g. tablet or card size) instead of the original high-resolution image.
3.  **LCP Performance Audit**: Measure Largest Contentful Paint (LCP) speed using Lighthouse or `web-vitals` script to track the difference before and after optimizing the Hero image load attributes.
