# Handoff Report: Payload CMS Setup Recommendations

This report outlines the environmental analysis, recommended setup commands, configuration details, and schema designs for integrating Payload CMS into `F:/Allbirds/payload-cms`.

---

## 1. Observation

Direct observations and measurements from the repository:

* **Node Runtime**:
  Command `node -v` output: `v24.15.0`.
  Command `npm -v` output: `11.12.1`.
  Command `yarn -v` output: `1.22.22`.
  Command `pnpm -v` output: `10.32.0`.
* **Frontend Ecosystem**:
  From `F:/Allbirds/package.json`:
  ```json
  "dependencies": {
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "vite": "^7.2.7"
  }
  ```
  The storefront uses React 19 and Vite 7.
* **Interface Contracts**:
  From `F:/Allbirds/PROJECT.md`:
  * **Database file**: Must reside at `F:/Allbirds/payload-cms/payload.db` (Line 6).
  * **Collections & Fields**:
    1. `heroBlocks`: `headline`, `body`, `ctaLabel`, `media` (relation), `themeSwatch`
    2. `categories`: `name`, `slug`, `cta`, `swatch`, `image` (relation)
    3. `products`: `name`, `price`, `colorways` (array of: color name, swatch color, image relation), `fit`, `rating`, `tags` (array), `category` (relation), `sizes` (array of numbers)
    4. `materials`: `name`, `impactNote`, `textureImage` (relation), `sourceRegion`
    5. `reviews`: `product` (relation), `quote`, `customerName`, `detail`
    6. `promoTiles`: `title`, `swatch`, `image` (relation)
  * **REST Endpoints**:
    `GET /api/hero-blocks`, `GET /api/categories`, `GET /api/products`, `GET /api/promo-tiles`, `GET /api/materials`, `GET /api/reviews` (Lines 34–40).
* **Media Assets**:
  Files found in `F:/Allbirds/public/`:
  - `allbirds-category-swatch.png`
  - `allbirds-hero-linen.png`
  - `allbirds-lifestyle-hero.png`
  - `allbirds-material-texture.png`
  - `allbirds-mvp-lifestyle.png`
  - `allbirds-travel-promo.png`
  - `screenshot.jpeg`
  - `workflow-material-board.png`

---

## 2. Logic Chain

1. **Ecosystem Matching**:
   * Node is `v24.15.0` (newest major branch). The storefront is running React `19.2.3`.
   * **Payload CMS 2.x** admin interface is hardlocked to React 18. Running Payload 2.x on Node 24 often triggers NPM peer dependency installation blocks and compilation/transpilation warnings because of Express and Vite/Webpack configurations built for older React types.
   * **Payload CMS 3.x** runs on Next.js 15 and is designed to support React 19 and modern Node runtimes natively.
   * **Conclusion**: Payload 3.x is highly recommended to prevent peer dependency conflicts.
2. **SQLite Database Configuration**:
   * Payload's `@payloadcms/db-sqlite` database adapter uses Drizzle ORM and `better-sqlite3` or `@libsql/client`.
   * Drizzle accepts standard SQLite file connections of format `file:<path>`.
   * To ensure the database sits precisely at `F:/Allbirds/payload-cms/payload.db` regardless of the path from which the command is executed, the configuration must use `path.resolve` to form an absolute file path.
3. **Endpoint Shape Matching**:
   * The requested REST routes in `PROJECT.md` have specific requirements (e.g. `sizes` is an array of numbers, `tags` is an array of strings).
   * In a traditional relational DB layout with SQLite, nested arrays are modeled via sub-tables or JSON columns. Payload's standard `array` field type returns arrays of objects (e.g. `tags: [{ tag: 'Canvas' }]`).
   * To prevent frontend code modifications, we can use Payload's `afterRead` hooks to extract values directly, transforming `{ tag: 'Canvas' }` to `'Canvas'`, thus returning clean `string[]` and `number[]` arrays to the client.
4. **Programmatic Seeding**:
   * A script executing locally needs to authenticate and invoke the Payload local API.
   * Static assets under `F:/Allbirds/public/` must first be uploaded as media records so their resolved document IDs can be correctly attached to category, product, and block relations.

---

## 3. Caveats

* **Node 24 Compatibility with Older Build Tools**: Although Payload 3.x supports React 19 and Node 20+, Node 24 is very fresh and may occasionally throw warnings during native node-gyp builds of `better-sqlite3`. Ensure building tools (Visual C++ Build Tools on Windows) are installed.
* **Access Control**: By default, Payload REST endpoints require authentication. In a development environment, read access must be set to `public` (using `read: () => true`) so the storefront can query them without auth headers.

---

## 4. Conclusion

We recommend setting up **Payload CMS 3.x** inside `F:/Allbirds/payload-cms/`.

### Setup Command
Run the scaffolding command within the workspace root:
```bash
npx create-payload-app@latest
```
* **Project Name**: `payload-cms`
* **Database**: `SQLite` (uses `@payloadcms/db-sqlite`)
* **Rich Text Editor**: `Lexical` (default)
* **Template**: `Blank` (to write custom schemas)

### SQLite Database Configuration
In `F:/Allbirds/payload-cms/src/payload.config.ts`, configure:
```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  db: sqliteAdapter({
    client: {
      // Directs SQLite to create the db file in the CMS root
      url: process.env.DATABASE_URI || `file:${path.resolve(__dirname, '../payload.db')}`,
    },
  }),
  // ... other configurations
})
```

### Collection Schemas Design
Create the following schemas in `payload-cms/src/collections/`:

#### 1. Media (`Media.ts`)
```typescript
import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: path.resolve(__dirname, '../../public/uploads'),
    mimeTypes: ['image/*'],
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

#### 2. HeroBlocks (`HeroBlocks.ts`)
Endpoint: `/api/hero-blocks`
```typescript
import { CollectionConfig } from 'payload'

export const HeroBlocks: CollectionConfig = {
  slug: 'hero-blocks',
  admin: { useAsTitle: 'headline' },
  access: { read: () => true },
  fields: [
    { name: 'headline', type: 'text', required: true },
    { name: 'body', type: 'textarea', required: true },
    { name: 'ctaLabel', type: 'text', required: true },
    { name: 'media', type: 'relationship', relationTo: 'media', required: true },
    { name: 'themeSwatch', type: 'text', required: true },
  ],
}
```

#### 3. Categories (`Categories.ts`)
Endpoint: `/api/categories`
```typescript
import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'cta', type: 'text', required: true },
    { name: 'swatch', type: 'text', required: true },
    { name: 'image', type: 'relationship', relationTo: 'media', required: true },
  ],
}
```

#### 4. Products (`Products.ts`)
Endpoint: `/api/products`
```typescript
import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'price', type: 'number', required: true }, // Numerical price
    {
      name: 'colorways',
      type: 'array',
      required: true,
      fields: [
        { name: 'color', type: 'text', required: true },
        { name: 'swatch', type: 'text', required: true },
        { name: 'image', type: 'relationship', relationTo: 'media', required: true },
      ],
    },
    { name: 'fit', type: 'text', required: true },
    { name: 'rating', type: 'number', required: true },
    {
      name: 'tags',
      type: 'array',
      fields: [{ name: 'tag', type: 'text', required: true }],
      hooks: {
        afterRead: [({ value }) => value?.map((item: any) => item.tag) || []],
      },
    },
    { name: 'category', type: 'relationship', relationTo: 'categories', required: true },
    {
      name: 'sizes',
      type: 'array',
      fields: [{ name: 'size', type: 'number', required: true }],
      hooks: {
        afterRead: [({ value }) => value?.map((item: any) => item.size) || []],
      },
    },
  ],
}
```

#### 5. Materials (`Materials.ts`)
Endpoint: `/api/materials`
```typescript
import { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: { useAsTitle: 'name' },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'impactNote', type: 'text', required: true },
    { name: 'textureImage', type: 'relationship', relationTo: 'media', required: true },
    { name: 'sourceRegion', type: 'text', required: true },
  ],
}
```

#### 6. Reviews (`Reviews.ts`)
Endpoint: `/api/reviews`
```typescript
import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: { useAsTitle: 'customerName' },
  access: { read: () => true },
  fields: [
    { name: 'product', type: 'relationship', relationTo: 'products', required: true },
    { name: 'quote', type: 'textarea', required: true },
    { name: 'customerName', type: 'text', required: true },
    { name: 'detail', type: 'text', required: true },
  ],
}
```

#### 7. PromoTiles (`PromoTiles.ts`)
Endpoint: `/api/promo-tiles`
```typescript
import { CollectionConfig } from 'payload'

export const PromoTiles: CollectionConfig = {
  slug: 'promo-tiles',
  admin: { useAsTitle: 'title' },
  access: { read: () => true },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'swatch', type: 'text', required: true },
    { name: 'image', type: 'relationship', relationTo: 'media', required: true },
  ],
}
```

---

## 5. Seeding Strategy and Script Structure

Create a seed script at `F:/Allbirds/payload-cms/src/seed.ts` that can be run with `npx tsx src/seed.ts`.

### Seeding Logic Workflow
1. **Initialize Local API**:
   ```typescript
   import { getPayload } from 'payload'
   import config from './payload.config'
   import fs from 'fs'
   import path from 'path'

   const seed = async () => {
     const payload = await getPayload({ config })
     // Seed steps...
   }
   ```
2. **Upload Media Files**:
   Define a helper to upload the local asset file:
   ```typescript
   const uploadMedia = async (fileName: string, altText: string) => {
     const filePath = path.resolve(__dirname, '../../public', fileName)
     const fileBuffer = fs.readFileSync(filePath)
     return await payload.create({
       collection: 'media',
       data: { alt: altText },
       file: {
         data: fileBuffer,
         name: fileName,
         mimetype: 'image/png',
         size: fileBuffer.byteLength,
       },
     })
   }
   ```
3. **Map and Seed Collections**:
   * Seed all images: `allbirds-hero-linen.png`, `allbirds-lifestyle-hero.png`, etc., caching their IDs.
   * Seed **Categories**: Map matching name, slug, swatch, and relation ID.
   * Seed **Materials**: Reference `allbirds-material-texture.png`.
   * Seed **Products**: Check names to assign to either `Mens` or `Womens` category relationships. Add colorways pointing to images, parse prices to integers, load default sizing.
   * Seed **Reviews**: Search for the newly created product reference using the review's `detail` property (e.g. containing `Canvas Runner`).
   * Seed **Promo Tiles** and **Hero Blocks**.

---

## 6. Verification Plan

Verify the setup after installation by performing the following steps:

1. **Verify Database File Location**:
   Ensure the database is initialized and written locally:
   ```bash
   # In PowerShell, check if the database file exists at the correct location
   Test-Path F:/Allbirds/payload-cms/payload.db
   ```
2. **Verify Server Execution**:
   Start the Payload dev environment:
   ```bash
   cd F:/Allbirds/payload-cms
   npm run dev
   ```
   Confirm the server runs on `http://localhost:3000` and the Admin panel is accessible at `http://localhost:3000/admin`.
3. **Verify API Responses**:
   Send HTTP requests to confirm content schemas and endpoints:
   ```bash
   # Test products REST endpoint
   Invoke-RestMethod -Uri "http://localhost:3000/api/products"
   ```
   Check that `sizes` is returned as a plain array of numbers, and relations are populated correctly.
