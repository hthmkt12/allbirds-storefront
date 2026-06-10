# Sprite Sheet & Crop Removal Strategy

This document outlines the findings and proposed strategy to remove CSS-based background image crops and sprite sheet crops from the Allbirds E-Commerce storefront and replace them with individual, clean image assets.

---

## 1. Identified Crop & Sprite Sheet Logic

### A. CSS Rules
- **File**: `F:/Allbirds/src/styles.css`
- **Line 44**:
  ```css
  .product-crop { background-image:url("/allbirds-category-swatch.png"); background-repeat:no-repeat; background-size:205% 205%; height:100%; min-height:230px; width:100%; }
  ```
- **Context**: Defines `.product-crop` using a hardcoded background sprite sheet `/allbirds-category-swatch.png` with `background-size: 205% 205%` (intended to crop a 2x2 grid by doubling the background scale and shifting the origin).

### B. React/JSX Code
- **File**: `F:/Allbirds/src/components/commerce-sections.tsx`
- **Lines 248-250** (inside `ProductCard` component):
  ```typescript
  const cropStyle: React.CSSProperties = imageUrl 
    ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundPosition: product.imagePosition };
  ```
- **Line 271**:
  ```tsx
  <div className="product-crop" style={cropStyle} />
  ```
- **Context**: The `ProductCard` attempts to apply the position shift via `product.imagePosition` only when `imageUrl` is falsy. If `imageUrl` is truthy, it overrides the background image and sets size to `cover` and position to `center`.

### C. Frontend Static/Mock Data
- **File**: `F:/Allbirds/src/data/allbirds-data.ts`
- **Lines 7, 34, 45, 55, 66, 77, 88, 99, 109**:
  - The `Product` type (lines 1-11) contains a mandatory `imagePosition: string` field.
  - The `products` mock array defines `imagePosition` for all 8 mock products (mapping to the four quadrants of the 2x2 sprite sheet):
    - `"0% 0%"` (Top-Left): `Men's Canvas Runner NZ`, `Women's Varsity Strap`
    - `"100% 0%"` (Top-Right): `Women's Tree Glider`, `Men's Dasher NZ`
    - `"0% 100%"` (Bottom-Left): `Men's Canvas Cruiser`, `Women's Canvas Cruiser`
    - `"100% 100%"` (Bottom-Right): `Women's Breezer Mary Jane`, `Men's Cruiser Slip On Terry`

### D. Frontend CMS Client Compatibility
- **File**: `F:/Allbirds/src/utils/cms-client.ts`
- **Lines 92, 199**:
  - `CmsProduct` interface has `imagePosition?: string` field.
  - `getProducts()` fallback maps static positions to compatibility models.

### E. Payload CMS Seeding Script
- **File**: `F:/Allbirds/payload-cms/src/seed.ts`
- **Lines 146, 158, 194, 206, 232**:
  - Sets `image` property to `'allbirds-category-swatch.png'` for `Men's Canvas Cruiser`, `Women's Breezer Mary Jane`, `Men's Cruiser Slip On Terry`, and `Women's Canvas Cruiser`.

---

## 2. Analysis of the Visual Bug (Root Cause)

When Payload CMS integration is active:
1. `getProducts()` fetches products dynamically from the local Payload API.
2. The product's `colorways` contain a relationship to a `media` object containing the `allbirds-category-swatch.png` filename.
3. `getImageUrl(activeColorway.image)` resolves to a valid URL: `http://localhost:3000/media/allbirds-category-swatch.png`.
4. Since `imageUrl` is truthy, `cropStyle` in `ProductCard` evaluates to:
   ```typescript
   { backgroundImage: 'url(http://localhost:3000/media/allbirds-category-swatch.png)', backgroundSize: 'cover', backgroundPosition: 'center' }
   ```
5. These inline styles override the CSS stylesheet's `.product-crop` background configuration.
6. The browser renders the **entire 2x2 sprite sheet** (which contains 4 separate shoes) inside the single product image container, resulting in a distorted display of four shoes rather than the individual shoe corresponding to the product.
7. If the CMS backend fails and the frontend falls back, the default mock data uses unrelated assets like `/allbirds-lifestyle-hero.png` as background images with `cover` sizing, completely ignoring the sprite sheet coordinates as well.

---

## 3. Proposed Sprite Sheet Split & Crop Removal Strategy

The proposed strategy replaces the single 2x2 sprite sheet (`allbirds-category-swatch.png`) with four individual, clean image files.

### Step 1: Crop and Generate Individual Image Assets
Split the `public/allbirds-category-swatch.png` (512x512 pixels or equivalent) into four equal 256x256 pixel quadrants. 

We can run a simple Node.js helper script (e.g. `scripts/split-sprite.js`) utilizing `sharp` (already present in the CMS backend environment) to split the image programmatically:

```javascript
import sharp from 'sharp';
import path from 'path';

const inputPath = path.resolve('public/allbirds-category-swatch.png');
const outputDir = path.resolve('public');

const crops = [
  { name: 'allbirds-crop-top-left.png', left: 0, top: 0, width: 256, height: 256 },
  { name: 'allbirds-crop-top-right.png', left: 256, top: 0, width: 256, height: 256 },
  { name: 'allbirds-crop-bottom-left.png', left: 0, top: 256, width: 256, height: 256 },
  { name: 'allbirds-crop-bottom-right.png', left: 256, top: 256, width: 256, height: 256 }
];

async function splitSprite() {
  for (const crop of crops) {
    await sharp(inputPath)
      .extract({ left: crop.left, top: crop.top, width: crop.width, height: crop.height })
      .toFile(path.join(outputDir, crop.name));
    console.log(`Created ${crop.name}`);
  }
}

splitSprite().catch(console.error);
```

### Step 2: Proposed Asset Mapping
The four generated images represent the individual products as follows:

| Quadrant | Coordinates | Filename | Associated Products |
| :--- | :--- | :--- | :--- |
| **Top-Left** | `x: 0, y: 0` | `allbirds-crop-top-left.png` | `Men's Canvas Runner NZ`, `Women's Varsity Strap` |
| **Top-Right** | `x: 256, y: 0` | `allbirds-crop-top-right.png` | `Women's Tree Glider`, `Men's Dasher NZ` |
| **Bottom-Left** | `x: 0, y: 256` | `allbirds-crop-bottom-left.png` | `Men's Canvas Cruiser`, `Women's Canvas Cruiser` |
| **Bottom-Right** | `x: 256, y: 256` | `allbirds-crop-bottom-right.png` | `Women's Breezer Mary Jane`, `Men's Cruiser Slip On Terry` |

### Step 3: Update Payload CMS Seed Script
Modify `payload-cms/src/seed.ts` to register the new cropped image assets and link products to their specific cropped images:

1. **Update `imageNames` array** (lines 42-49):
   ```typescript
   const imageNames = [
     'allbirds-crop-top-left.png',
     'allbirds-crop-top-right.png',
     'allbirds-crop-bottom-left.png',
     'allbirds-crop-bottom-right.png',
     'allbirds-hero-linen.png',
     'allbirds-lifestyle-hero.png',
     'allbirds-material-texture.png',
     'allbirds-mvp-lifestyle.png',
     'allbirds-travel-promo.png',
   ]
   ```
2. **Update `productData` array** (lines 112-209) to reference individual crops:
   ```typescript
   const productData = [
     {
       name: "Men's Canvas Runner NZ",
       // ...
       image: "allbirds-crop-top-left.png", // Replaced allbirds-hero-linen.png
     },
     {
       name: "Women's Tree Glider",
       // ...
       image: "allbirds-crop-top-right.png", // Replaced allbirds-mvp-lifestyle.png
     },
     {
       name: "Men's Canvas Cruiser",
       // ...
       image: "allbirds-crop-bottom-left.png", // Replaced allbirds-category-swatch.png
     },
     {
       name: "Women's Breezer Mary Jane",
       // ...
       image: "allbirds-crop-bottom-right.png", // Replaced allbirds-category-swatch.png
     },
     {
       name: "Men's Dasher NZ",
       // ...
       image: "allbirds-crop-top-right.png", // Replaced allbirds-lifestyle-hero.png
     },
     {
       name: "Women's Varsity Strap",
       // ...
       image: "allbirds-crop-top-left.png", // Replaced allbirds-mvp-lifestyle.png
     },
     {
       name: "Men's Cruiser Slip On Terry",
       // ...
       image: "allbirds-crop-bottom-right.png", // Replaced allbirds-category-swatch.png
     },
     {
       name: "Women's Canvas Cruiser",
       // ...
       image: "allbirds-crop-bottom-left.png", // Replaced allbirds-category-swatch.png
     }
   ]
   ```
3. **Update other categories or promo tiles referencing `allbirds-category-swatch.png`**:
   - `categoryData`: Re-map `New Arrivals` image to a dedicated full-scale image like `allbirds-lifestyle-hero.png` or a new composite hero.
   - `promoData`: Re-map `Fresh Colors For Spring` image to a dedicated full-scale image.

### Step 4: Refactor Frontend Static Data (`src/data/allbirds-data.ts`)
1. Remove `imagePosition` field from `Product` type (line 7).
2. Remove `imagePosition` property from all objects in the `products` array (lines 34, 45, 55, 66, 77, 88, 99, 109).
3. Map static fallbacks directly to the individual files:
   - For example:
     - `Men's Canvas Runner NZ`: `/allbirds-crop-top-left.png`
     - `Women's Tree Glider`: `/allbirds-crop-top-right.png`
     - `Men's Canvas Cruiser`: `/allbirds-crop-bottom-left.png`
     - `Women's Breezer Mary Jane`: `/allbirds-crop-bottom-right.png`

### Step 5: Clean Up Frontend CSS (`src/styles.css`)
1. Remove `background-image`, `background-repeat`, and `background-size` from `.product-crop` class:
   ```css
   .product-crop {
     height: 100%;
     min-height: 230px;
     width: 100%;
     background-position: center;
     background-size: cover;
     background-repeat: no-repeat;
   }
   ```
2. Remove the `.product-crop.large` override rule if it is no longer needed, or simplify it.

### Step 6: Simplify React Storefront Code (`src/components/commerce-sections.tsx`)
Refactor the image rendering in `ProductCard` to eliminate dynamic position cropping:

1. **Simplify `cropStyle`**:
   Since all images are now individual, full images, the style can be passed cleanly as a background image, or better yet, replaced with an standard `<img>` tag for improved semantic HTML, accessibility (alt text), and responsive `srcset` support.
   
   If keeping background images:
   ```typescript
   const cropStyle: React.CSSProperties = {
     backgroundImage: `url(${imageUrl})`,
   };
   ```
2. **Simplified JSX**:
   ```tsx
   <div className="product-crop" style={cropStyle} />
   ```
   Or using an semantic image tag:
   ```tsx
   <img className="product-image" src={imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
   ```

### Step 7: Verification and Seeding
1. Run the database seeding command:
   ```powershell
   cd payload-cms
   npm run seed
   ```
2. Recompile and build the storefront to ensure no TypeScript or compilation errors:
   ```powershell
   npm run build
   ```
3. Run the Playwright E2E test suite to verify PDP pages and Cart Drawer display the individual images correctly:
   ```powershell
   npm run test:e2e
   ```
