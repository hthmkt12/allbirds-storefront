# Handoff Report: Payload CMS Setup and Schema Design

This report outlines the environment analysis, SQLite database configuration, collection schema designs, seeding strategy, and verification plan for setting up Payload CMS in the `/payload-cms` directory of `F:/Allbirds`.

---

## 1. Observation

Direct observations from the workspace:
* **Root `package.json`**: Located at `F:/Allbirds/package.json`. It includes modern dependencies:
  * React: `^19.2.3` (Line 14)
  * React DOM: `^19.2.3` (Line 15)
  * Vite: `^7.2.7` (Line 16)
  * TypeScript: `^5.9.3` (Line 22)
  * The project runs as an ESM module (`"type": "module"`, Line 5).
* **Mock Data File**: Located at `F:/Allbirds/src/data/allbirds-data.ts`. It contains mock datasets for `categories`, `products`, `promoTiles`, `valueBlocks`, `materialMetrics`, and `reviews`.
  * `categories` (Line 20) contains 4 entries, e.g., `{ name: "New Arrivals", cta: "Shop Men / Shop Women", swatch: "#c8d3d8", image: "/allbirds-category-swatch.png" }`.
  * `products` (Line 27) contains 8 entries, e.g., `Men's Canvas Runner NZ` with fields: `name`, `label`, `color`, `price`, `swatch`, `imagePosition`, `fit`, `rating`, `tags`.
  * `promoTiles` (Line 116) contains 3 entries with fields `title`, `swatch`, `image`.
  * `reviews` (Line 143) contains 3 entries with fields `quote`, `name`, `detail`.
* **Storefront Components**:
  * `src/components/header-hero.tsx` (Line 31) displays the hero block with:
    * Headline: `"Wildly Comfortable. Super Natural."`
    * Section kicker: `"All New Dasher NZ Collection"`
    * Image: `"/allbirds-lifestyle-hero.png"`
  * `src/components/commerce-sections.tsx` (Line 65) renders the spotlight banner by matching `categories.find((item) => item.name === activeCategory)?.image`.
* **Static Assets**: Located in `F:/Allbirds/public/` and `F:/Allbirds/dist/`:
  * `allbirds-category-swatch.png`
  * `allbirds-hero-linen.png`
  * `allbirds-lifestyle-hero.png`
  * `allbirds-material-texture.png`
  * `allbirds-mvp-lifestyle.png`
  * `allbirds-travel-promo.png`
* **Local CWD & Directories**: There is no folder named `payload-cms/` in `F:/Allbirds/` yet. It must be created and scaffolded.
* **Environment Command Execution**: The terminal command `node -v` timed out waiting for manual authorization due to prompt restrictions. However, the presence of React 19 and Vite 7 confirms a highly modern environment (likely Node.js 18.17+ or 20.x/22.x).

---

## 2. Logic Chain

1. **Payload CMS Version Selection**: 
   * Payload 2.x is express-based, has internal dependencies on React 18, and uses Vite/Webpack bundlers that frequently run into peer dependency conflicts when placed in workspaces with React 19 (which is in the root `package.json`).
   * Payload 3.x runs natively as a Next.js full-stack application. It fully supports React 19 and runs cleanly as a standalone service on port 3000. 
   * Therefore, **Payload 3.x is proposed** as the best and most future-proof choice for this environment.
2. **SQLite Configuration**:
   * Payload 3.x uses `@payloadcms/db-sqlite` database adapter (built on Drizzle ORM).
   * It connects to a local file database using a standard URI string: `file:F:/Allbirds/payload-cms/payload.db`.
   * For cross-platform compatibility (Windows vs Unix path structures), using `path.resolve` inside the configuration is the most robust way to build the absolute file URI.
3. **Schema Design**:
   * The fields listed in `F:/Allbirds/PROJECT.md` map directly to Payload's built-in field types:
     * `media` relations map to the `relationship` type pointing to the `media` collection.
     * Swatch strings (hex colors) map to the `text` type.
     * Price maps to `text` because the mock storefront uses formatted strings (e.g. `"$100"`).
     * Colorways map to an `array` field containing nested fields: `colorName` (text), `swatchColor` (text), and `image` (relationship to media).
     * Accessible endpoints require an `access.read: () => true` permission config so that the storefront can retrieve data from `localhost:3000/api/*` without JWT headers.
4. **Seeding Strategy**:
   * To prevent duplicate items and ensure test reliability, the seed script must clear existing database documents first.
   * To successfully reference images, the seed script must upload the physical PNG/JPEG files in `F:/Allbirds/public/` to the `media` collection *first*, store their returned IDs, and then link those IDs as relationships when creating categories, products, promo-tiles, materials, and hero-blocks.
   * The **Payload Local API** (`payload.create`, `payload.find`) is the cleanest way to programmatically perform these uploads and inserts.

---

## 3. Caveats

* **Node Version Assumption**: It is assumed that the local system has Node.js version 20.9.0+ or newer, which is required by Next.js and Payload 3.x. If the actual Node version is older (e.g., 18.x below 18.17.0), Next.js will throw an engine compatibility error.
* **Image Assets Path**: The seed script assumes that the public files (such as `allbirds-category-swatch.png`) are physically located at `F:/Allbirds/public/`. If they are moved or renamed, the seed script will fail to locate them.
* **Vite Proxy / CORS**: When connecting the storefront (port 5173) to Payload CMS (port 3000), CORS settings in `payload.config.ts` or a proxy in `vite.config.ts` must be configured. This is addressed in the setup guide.

---

## 4. Conclusion

### A. Environment & Proposing Payload Version
We recommend installing **Payload CMS 3.x**. 

**Scaffolding Command**:
Navigate to the root of the project and execute:
```powershell
npx create-payload-app@latest payload-cms --template blank --db sqlite --bundler next
```
*Note: Make sure to select `SQLite` when prompted for the database, and `Next.js` for the framework.*

**Dependencies installed within `/payload-cms/package.json`**:
* `payload`
* `@payloadcms/db-sqlite`
* `@payloadcms/next`
* `@payloadcms/richtext-lexical`
* `react` and `react-dom` (v19)
* `next` (v15)

---

### B. SQLite Configuration
Configure the database adapter inside `/payload-cms/src/payload.config.ts`:

```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    // Admin dashboard options
  },
  // Set up SQLite adapter to point explicitly to the required database file
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || `file:${path.resolve(dirname, '../payload.db')}`,
    },
  }),
  // ... rest of config
})
```

**Workflow Safety**: Add `/payload-cms/payload.db` and `/payload-cms/payload.db-journal` to `/payload-cms/.gitignore` (or the root `.gitignore`) to ensure database binaries are not committed to Git.

---

### C. Payload CMS Schema Design

Create the collection schemas inside `payload-cms/src/collections/`.

#### 1. Media Upload Collection (`Media.ts`)
*   **Slug**: `media`
*   **File**: `payload-cms/src/collections/Media.ts`
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
  },
  access: {
    read: () => true, // Publicly readable
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

#### 2. Hero Blocks Collection (`HeroBlocks.ts`)
*   **Slug**: `hero-blocks`
*   **File**: `payload-cms/src/collections/HeroBlocks.ts`
```typescript
import { CollectionConfig } from 'payload'

export const HeroBlocks: CollectionConfig = {
  slug: 'hero-blocks',
  admin: {
    useAsTitle: 'headline',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'headline',
      type: 'text',
      required: true,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
    },
    {
      name: 'ctaLabel',
      type: 'text',
      required: true,
    },
    {
      name: 'media',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'themeSwatch',
      type: 'text',
      required: true,
    },
  ],
}
```

#### 3. Categories Collection (`Categories.ts`)
*   **Slug**: `categories`
*   **File**: `payload-cms/src/collections/Categories.ts`
```typescript
import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'cta',
      type: 'text',
      required: true,
    },
    {
      name: 'swatch',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
  ],
}
```

#### 4. Products Collection (`Products.ts`)
*   **Slug**: `products`
*   **File**: `payload-cms/src/collections/Products.ts`
```typescript
import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'text', // String input to support "$100" from mockup
      required: true,
    },
    {
      name: 'colorways',
      type: 'array',
      required: true,
      fields: [
        {
          name: 'colorName',
          type: 'text',
          required: true,
        },
        {
          name: 'swatchColor',
          type: 'text',
          required: true,
        },
        {
          name: 'image',
          type: 'relationship',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'fit',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'number',
      min: 0,
      max: 5,
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
    },
    {
      name: 'sizes',
      type: 'array',
      fields: [
        {
          name: 'size',
          type: 'number',
        },
      ],
    },
  ],
}
```

#### 5. Materials Collection (`Materials.ts`)
*   **Slug**: `materials`
*   **File**: `payload-cms/src/collections/Materials.ts`
```typescript
import { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'impactNote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'textureImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'sourceRegion',
      type: 'text',
      required: true,
    },
  ],
}
```

#### 6. Reviews Collection (`Reviews.ts`)
*   **Slug**: `reviews`
*   **File**: `payload-cms/src/collections/Reviews.ts`
```typescript
import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'customerName',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'product',
      type: 'relationship',
      relationTo: 'products',
      required: true,
    },
    {
      name: 'quote',
      type: 'textarea',
      required: true,
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
    },
    {
      name: 'detail',
      type: 'text',
      required: true,
    },
  ],
}
```

#### 7. Promo Tiles Collection (`PromoTiles.ts`)
*   **Slug**: `promo-tiles`
*   **File**: `payload-cms/src/collections/PromoTiles.ts`
```typescript
import { CollectionConfig } from 'payload'

export const PromoTiles: CollectionConfig = {
  slug: 'promo-tiles',
  admin: {
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'swatch',
      type: 'text',
      required: true,
    },
    {
      name: 'image',
      type: 'relationship',
      relationTo: 'media',
      required: true,
    },
  ],
}
```

#### Register Collections
Import and register these inside `payload-cms/src/payload.config.ts`:
```typescript
import { buildConfig } from 'payload'
import { Media } from './collections/Media'
import { HeroBlocks } from './collections/HeroBlocks'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Materials } from './collections/Materials'
import { Reviews } from './collections/Reviews'
import { PromoTiles } from './collections/PromoTiles'

export default buildConfig({
  collections: [
    Media,
    HeroBlocks,
    Categories,
    Products,
    Materials,
    Reviews,
    PromoTiles,
  ],
  // ... db and lexical richText configs
})
```

---

### D. Seeding Strategy and Script Structure

We recommend using Payload's Local API for seeding. Write a seeding script at `payload-cms/src/seed/index.ts` and set up an npm runner script in `package.json`: `"seed": "payload run src/seed/index.ts"`.

#### Seeding Script Blueprint:
```typescript
import { getPayload } from 'payload'
import config from '../payload.config'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seed() {
  console.log('Starting seed process...')
  const payload = await getPayload({ config })

  // 1. CLEAR EXISTING DATA (in reverse dependency order)
  console.log('Cleaning up existing documents...')
  await payload.delete({ collection: 'reviews', where: {} })
  await payload.delete({ collection: 'products', where: {} })
  await payload.delete({ collection: 'categories', where: {} })
  await payload.delete({ collection: 'materials', where: {} })
  await payload.delete({ collection: 'promo-tiles', where: {} })
  await payload.delete({ collection: 'hero-blocks', where: {} })
  await payload.delete({ collection: 'media', where: {} })

  // 2. SEED MEDIA ASSETS
  console.log('Uploading media assets...')
  const mediaSourceDir = path.resolve(dirname, '../../../public') // references F:/Allbirds/public
  const imageNames = [
    'allbirds-category-swatch.png',
    'allbirds-hero-linen.png',
    'allbirds-lifestyle-hero.png',
    'allbirds-material-texture.png',
    'allbirds-mvp-lifestyle.png',
    'allbirds-travel-promo.png'
  ]

  const mediaMap: Record<string, string> = {}

  for (const name of imageNames) {
    const filePath = path.join(mediaSourceDir, name)
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}, skipping media upload`)
      continue
    }

    const createdMedia = await payload.create({
      collection: 'media',
      data: {
        alt: name.replace('allbirds-', '').replace('.png', '').replace(/-/g, ' '),
      },
      file: {
        filePath,
        mimeType: 'image/png',
        name,
        size: fs.statSync(filePath).size,
      },
    })
    mediaMap[name] = createdMedia.id
  }

  // 3. SEED CATEGORIES
  console.log('Seeding categories...')
  const seededCategories = []
  const categoryData = [
    { name: "New Arrivals", cta: "Shop Men / Shop Women", swatch: "#c8d3d8", image: 'allbirds-category-swatch.png' },
    { name: "Mens", cta: "Shop Men", swatch: "#4b4440", image: 'allbirds-lifestyle-hero.png' },
    { name: "Womens", cta: "Shop Women", swatch: "#6c504c", image: 'allbirds-mvp-lifestyle.png' },
    { name: "Best Sellers", cta: "Shop Men / Shop Women", swatch: "#536054", image: 'allbirds-travel-promo.png' },
  ]

  for (const cat of categoryData) {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const createdCat = await payload.create({
      collection: 'categories',
      data: {
        name: cat.name,
        slug,
        cta: cat.cta,
        swatch: cat.swatch,
        image: mediaMap[cat.image],
      },
    })
    seededCategories.push(createdCat)
  }

  const getCategoryBySlug = (slug: string) => seededCategories.find(c => c.slug === slug)?.id

  // 4. SEED PRODUCTS
  console.log('Seeding products...')
  const seededProducts = []
  const productData = [
    {
      name: "Men's Canvas Runner NZ",
      price: "$100",
      color: "Deep Navy Stripes",
      swatch: "#e0dacf",
      fit: "True to size",
      rating: 4.7,
      tags: ["Canvas", "Lightweight"],
      categorySlug: "mens",
      image: "allbirds-hero-linen.png",
      sizes: [8, 9, 10, 11, 12]
    },
    {
      name: "Women's Tree Glider",
      price: "$140",
      color: "Burlwood",
      swatch: "#d4d9cf",
      fit: "Runs narrow",
      rating: 4.8,
      tags: ["Tree Fiber", "Breathable"],
      categorySlug: "womens",
      image: "allbirds-mvp-lifestyle.png",
      sizes: [6, 7, 8, 9, 10]
    },
    {
      name: "Men's Canvas Cruiser",
      price: "$75",
      color: "Sea Spray",
      swatch: "#c8d3d8",
      fit: "Relaxed fit",
      rating: 4.6,
      tags: ["Canvas", "Travel"],
      categorySlug: "mens",
      image: "allbirds-category-swatch.png",
      sizes: [8, 9, 10, 11, 12]
    },
    {
      name: "Women's Breezer Mary Jane",
      price: "$115",
      color: "Dusty Pink",
      swatch: "#d1b0a4",
      fit: "True to size",
      rating: 4.5,
      tags: ["Mary Jane", "Breezy"],
      categorySlug: "womens",
      image: "allbirds-category-swatch.png",
      sizes: [6, 7, 8, 9, 10]
    },
  ]

  for (const prod of productData) {
    const createdProd = await payload.create({
      collection: 'products',
      data: {
        name: prod.name,
        price: prod.price,
        fit: prod.fit,
        rating: prod.rating,
        tags: prod.tags.map(t => ({ tag: t })),
        sizes: prod.sizes.map(s => ({ size: s })),
        category: getCategoryBySlug(prod.categorySlug),
        colorways: [
          {
            colorName: prod.color,
            swatchColor: prod.swatch,
            image: mediaMap[prod.image] || mediaMap['allbirds-category-swatch.png']
          }
        ]
      }
    })
    seededProducts.push(createdProd)
  }

  const getProductByName = (name: string) => seededProducts.find(p => p.name === name)?.id

  // 5. SEED MATERIALS
  console.log('Seeding materials...')
  const materialData = [
    {
      name: "Sugarcane SweetFoam®",
      impactNote: "Materials, transport, and packaging are selected with lower impact in mind.",
      textureImage: 'allbirds-material-texture.png',
      sourceRegion: 'Brazil'
    },
    {
      name: "Trino® (Wool + Tree)",
      impactNote: "Sugarcane SweetFoam® replaces petroleum-based synthetics where possible.",
      textureImage: 'allbirds-material-texture.png',
      sourceRegion: 'South Africa / New Zealand'
    }
  ]

  for (const mat of materialData) {
    await payload.create({
      collection: 'materials',
      data: {
        name: mat.name,
        impactNote: mat.impactNote,
        textureImage: mediaMap[mat.textureImage],
        sourceRegion: mat.sourceRegion
      }
    })
  }

  // 6. SEED REVIEWS
  console.log('Seeding reviews...')
  const reviewData = [
    {
      productName: "Women's Tree Glider",
      quote: "The lightest shoe I packed for a two-week trip. It still looked clean by the flight home.",
      customerName: "Maya R.",
      detail: "Tree Glider, Burlwood",
    },
    {
      productName: "Men's Canvas Runner NZ",
      quote: "Soft enough for errands, structured enough for the office commute.",
      customerName: "Daniel K.",
      detail: "Canvas Runner NZ",
    }
  ]

  for (const rev of reviewData) {
    const prodId = getProductByName(rev.productName)
    if (!prodId) continue
    await payload.create({
      collection: 'reviews',
      data: {
        product: prodId,
        quote: rev.quote,
        customerName: rev.customerName,
        detail: rev.detail
      }
    })
  }

  // 7. SEED PROMO TILES
  console.log('Seeding promo tiles...')
  const promoData = [
    { title: "Spring Travel Essentials", swatch: "#e0dacf", image: "allbirds-travel-promo.png" },
    { title: "New Arrivals", swatch: "#d4d9cf", image: "allbirds-mvp-lifestyle.png" },
    { title: "Fresh Colors For Spring", swatch: "#c8d3d8", image: "allbirds-category-swatch.png" },
  ]

  for (const promo of promoData) {
    await payload.create({
      collection: 'promo-tiles',
      data: {
        title: promo.title,
        swatch: promo.swatch,
        image: mediaMap[promo.image]
      }
    })
  }

  // 8. SEED HERO BLOCKS
  console.log('Seeding hero blocks...')
  await payload.create({
    collection: 'hero-blocks',
    data: {
      headline: "Wildly Comfortable. Super Natural.",
      body: "All New Dasher NZ Collection",
      ctaLabel: "Shop Men / Shop Women",
      media: mediaMap['allbirds-lifestyle-hero.png'],
      themeSwatch: "#4b4440"
    }
  })

  console.log('Database successfully seeded!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seeding failed:', err)
  process.exit(1)
})
```

---

## 5. Verification Plan

Ensure the setup is correct by verifying both database state and API functionality.

### Command Execution Verification
1. **Build Verification**:
   Navigate into the `/payload-cms` directory and compile the Next.js/Payload application:
   ```powershell
   cd F:/Allbirds/payload-cms
   npm install
   npm run build
   ```
2. **Database & Migration Execution**:
   Run database creation or generation commands:
   ```powershell
   npx payload db:migrate  # Optional if using auto-sync
   ```
3. **Execution of Seeding**:
   Run the seeding script:
   ```powershell
   npm run seed
   ```
   *Expect output:* "Database successfully seeded!" and exit code `0`.
4. **Server Initialization**:
   Launch the Payload CMS application locally:
   ```powershell
   npm run dev
   ```
   *Expect output:* Server running on port 3000.

### Endpoint & Data Contract Verification
Query the local REST endpoints from a browser or API tool (e.g. `curl` or Postman):

*   **Hero Blocks Endpoint**:
    *   Command: `curl http://localhost:3000/api/hero-blocks`
    *   Expected output structure:
        ```json
        {
          "docs": [
            {
              "headline": "Wildly Comfortable. Super Natural.",
              "body": "All New Dasher NZ Collection",
              "ctaLabel": "Shop Men / Shop Women",
              "media": { "id": "...", "url": "/media/allbirds-lifestyle-hero.png" },
              "themeSwatch": "#4b4440"
            }
          ]
        }
        ```
*   **Products & Category Endpoints**:
    *   Command: `curl http://localhost:3000/api/products?depth=1`
    *   Expected validation:
        *   Verify that each product contains the populated `category` object (with properties `name`, `slug`, `cta`).
        *   Verify that `colorways` contain a valid reference to the uploaded Media object (verifying correct image resolution).
        *   Verify that the size array contains numerical values (e.g., `[8, 9, 10]`).

### SQLite Database Verification
Check the physical file generated by the SQLite adapter:
*   Inspect that the database file `F:/Allbirds/payload-cms/payload.db` has been created.
*   Confirm that it is populated and has a non-zero file size.

---

## Unresolved Questions
* **CORS Whitelist**: Does the storefront application require specific custom ports (e.g., `http://localhost:5173`) to be whitelisted for CORS in `payload.config.ts`, or will the integration use a Next/Vite server proxy to bypass CORS? (Recommended: Add `cors: ['http://localhost:5173']` inside `payload.config.ts`).
