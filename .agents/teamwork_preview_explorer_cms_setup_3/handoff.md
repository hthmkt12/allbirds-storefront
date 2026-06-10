# CMS Setup Investigation and Plan

## 1. Observation

Direct observations from the environment:
- **Root Project dependencies (`F:/Allbirds/package.json`):**
  - React version: `"react": "^19.2.3"` (line 15)
  - TypeScript version: `"typescript": "^5.9.3"` (line 24)
  - Package lock: `package-lock.json` is present in root, indicating `npm` is the package manager.
- **Project Structure & CMS boundaries (`F:/Allbirds/PROJECT.md`):**
  - Database: `F:/Allbirds/payload-cms/payload.db` (line 6)
  - CMS Directory: `F:/Allbirds/payload-cms/` (line 11)
  - Interface contracts for 6 collections (lines 27-32):
    - `heroBlocks`: `headline`, `body`, `ctaLabel`, `media` (relation to Media), `themeSwatch`
    - `categories`: `name`, `slug`, `cta`, `swatch`, `image` (relation to Media)
    - `products`: `name`, `price`, `colorways` (array of: color name, swatch color, image relation to Media), `fit`, `rating`, `tags` (array), `category` (relation to Categories), `sizes` (array of numbers)
    - `materials`: `name`, `impactNote`, `textureImage` (relation to Media), `sourceRegion`
    - `reviews`: `product` (relation to Products), `quote`, `customerName`, `detail`
    - `promoTiles`: `title`, `swatch`, `image` (relation to Media)
  - API endpoints requested (lines 35-40):
    - `GET /api/hero-blocks`
    - `GET /api/categories`
    - `GET /api/products`
    - `GET /api/promo-tiles`
    - `GET /api/materials`
    - `GET /api/reviews`
- **Mock data structures (`F:/Allbirds/src/data/allbirds-data.ts`):**
  - `products` mock objects have flat fields: `name`, `price`, `color`, `swatch`, `imagePosition`, `fit`, `rating`, `tags` (lines 27-114).
  - Value blocks, metrics, and reviews exist as static lists.

---

## 2. Logic Chain

1. **Node and Payload Version Decision:**
   - The root project uses React 19 and Vite 7.
   - Payload CMS 3.x natively supports React 19 and Next.js 15, making it the most modern and compatible framework choice for local development alongside a React 19 app.
   - Because `payload-cms/` runs as a separate application (with its own `package.json` and port 3000), it runs independently from the Vite app (port 5173).
   - Therefore, Payload CMS 3.x (Next.js-based) is the recommended version. A fallback configuration for Payload 2.x (Express-based) is provided for maximum flexibility.
2. **SQLite Configuration:**
   - The SQLite database file path is fixed to `F:/Allbirds/payload-cms/payload.db`.
   - Windows path resolution requires caution to prevent databases writing to unexpected user directories. Using `path.resolve` with `import.meta.url` in ES modules (v3) or `__dirname` (v2) provides safe absolute paths.
3. **Endpoint Routing & Slug Mapping:**
   - To serve `GET /api/hero-blocks` and `GET /api/promo-tiles` natively without writing custom Express/Next.js routes, the collection slugs must use kebab-case: `hero-blocks` and `promo-tiles`. The other slugs map to `categories`, `products`, `materials`, and `reviews`.
4. **Data Modeling Transition:**
   - Static mock products are defined with flat values (`color`, `swatch`). The contract requires an array of `colorways` (consisting of name, swatch, and image relationship).
   - The database schema must declare `colorways` as a Payload `array` field.
   - The seeding script must dynamically map the flat mock fields into this array structure, resolving image relationships correctly.

---

## 3. Caveats

- **Next.js Overhead:** Setting up Payload 3.x configures the `payload-cms/` folder as a Next.js application. While lightweight for local usage, it introduces a Next.js compile stage for the CMS. If a minimal Express/Node server is preferred, Payload 2.x is the correct choice.
- **Node.js Requirement:** Next.js 15 and Payload 3.x require Node.js >= 18.20.2 or >= 20.6.0. If the local system is running an older Node version, Payload 2.x must be selected.
- **Local Media Storage:** Media uploads are written locally to `F:/Allbirds/payload-cms/media/`. This directory should be added to `.gitignore`.

---

## 4. Conclusion

### Setup Protocol (Payload 3.x)

To initialize Payload CMS 3.x in the `/payload-cms` directory, execute:
```bash
# From workspace root F:/Allbirds
npx create-payload-app@latest payload-cms
```
When prompted:
1. Choose **Next.js** template.
2. Choose **SQLite** as the database.
3. Choose **Blank** template or clean start.
4. Name the directory `payload-cms`.

#### SQLite Configuration (`payload.config.ts`):
```typescript
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HeroBlocks } from './collections/HeroBlocks'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Materials } from './collections/Materials'
import { Reviews } from './collections/Reviews'
import { PromoTiles } from './collections/PromoTiles'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [
    Users,
    Media,
    HeroBlocks,
    Categories,
    Products,
    Materials,
    Reviews,
    PromoTiles
  ],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'payload_secret_storefront_3389',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteAdapter({
    client: {
      url: `file:${path.resolve(dirname, 'payload.db')}`,
    },
  }),
})
```

---

### Collection Schemas

Create the files inside `payload-cms/src/collections/`:

#### Users.ts (Users.ts)
```typescript
import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
```

#### Media.ts (Media.ts)
```typescript
import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: 'media',
    staticURL: '/media',
    adminThumbnail: 'thumbnail',
    mimeTypes: ['image/*'],
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

#### HeroBlocks.ts (HeroBlocks.ts)
- Generates endpoint `/api/hero-blocks`
```typescript
import { CollectionConfig } from 'payload'

export const HeroBlocks: CollectionConfig = {
  slug: 'hero-blocks',
  admin: {
    useAsTitle: 'headline',
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

#### Categories.ts (Categories.ts)
- Generates endpoint `/api/categories`
```typescript
import { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'name',
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

#### Products.ts (Products.ts)
- Generates endpoint `/api/products`
```typescript
import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'price',
      type: 'text',
      required: true,
    },
    {
      name: 'colorways',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'color',
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
    },
    {
      name: 'fit',
      type: 'text',
      required: true,
    },
    {
      name: 'rating',
      type: 'text',
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

#### Materials.ts (Materials.ts)
- Generates endpoint `/api/materials`
```typescript
import { CollectionConfig } from 'payload'

export const Materials: CollectionConfig = {
  slug: 'materials',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'impactNote',
      type: 'text',
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

#### Reviews.ts (Reviews.ts)
- Generates endpoint `/api/reviews`
```typescript
import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'customerName',
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

#### PromoTiles.ts (PromoTiles.ts)
- Generates endpoint `/api/promo-tiles`
```typescript
import { CollectionConfig } from 'payload'

export const PromoTiles: CollectionConfig = {
  slug: 'promo-tiles',
  admin: {
    useAsTitle: 'title',
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

---

### Seeding Strategy

Create a seeding script (`payload-cms/src/seed.ts`) that runs via `tsx` or `ts-node`. The seeding script reads local image assets from the storefront's `public` directory, uploads them to the Media collection, and populates the database using standard payload CRUD APIs.

#### Seed Script Structure (`seed.ts`):
```typescript
import { getPayload } from 'payload'
import config from './payload.config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

async function seed() {
  const payload = await getPayload({ config })

  console.log('Clearing database...')
  await payload.delete({ collection: 'users', where: {} })
  await payload.delete({ collection: 'media', where: {} })
  await payload.delete({ collection: 'hero-blocks', where: {} })
  await payload.delete({ collection: 'categories', where: {} })
  await payload.delete({ collection: 'products', where: {} })
  await payload.delete({ collection: 'materials', where: {} })
  await payload.delete({ collection: 'reviews', where: {} })
  await payload.delete({ collection: 'promo-tiles', where: {} })

  console.log('Seeding admin user...')
  await payload.create({
    collection: 'users',
    data: {
      email: 'admin@allbirds.com',
      password: 'adminpassword123',
    },
  })

  // Local helper to upload public files into CMS
  const uploadImage = async (fileName: string, altText: string) => {
    // Read from root public directory
    const publicPath = path.resolve(dirname, '../../public', fileName)
    if (!fs.existsSync(publicPath)) {
      throw new Error(`Media asset file not found at ${publicPath}`)
    }
    return await payload.create({
      collection: 'media',
      data: { alt: altText },
      file: {
        name: fileName,
        mimetype: 'image/png',
        size: fs.statSync(publicPath).size,
        buffer: fs.readFileSync(publicPath),
      },
    })
  }

  console.log('Seeding media items...')
  const categorySwatch = await uploadImage('allbirds-category-swatch.png', 'Category Swatch')
  const lifestyleHero = await uploadImage('allbirds-lifestyle-hero.png', 'Lifestyle Hero')
  const materialTexture = await uploadImage('allbirds-material-texture.png', 'Material Texture')
  const mvpLifestyle = await uploadImage('allbirds-mvp-lifestyle.png', 'MVP Lifestyle')
  const travelPromo = await uploadImage('allbirds-travel-promo.png', 'Travel Promo')
  const heroLinen = await uploadImage('allbirds-hero-linen.png', 'Hero Linen')

  console.log('Seeding categories...')
  const catNewArrivals = await payload.create({
    collection: 'categories',
    data: {
      name: 'New Arrivals',
      slug: 'new-arrivals',
      cta: 'Shop Men / Shop Women',
      swatch: '#c8d3d8',
      image: categorySwatch.id,
    },
  })
  const catMens = await payload.create({
    collection: 'categories',
    data: {
      name: 'Mens',
      slug: 'mens',
      cta: 'Shop Men',
      swatch: '#4b4440',
      image: lifestyleHero.id,
    },
  })
  const catWomens = await payload.create({
    collection: 'categories',
    data: {
      name: 'Womens',
      slug: 'womens',
      cta: 'Shop Women',
      swatch: '#6c504c',
      image: mvpLifestyle.id,
    },
  })
  const catBestSellers = await payload.create({
    collection: 'categories',
    data: {
      name: 'Best Sellers',
      slug: 'best-sellers',
      cta: 'Shop Men / Shop Women',
      swatch: '#536054',
      image: travelPromo.id,
    },
  })

  console.log('Seeding materials...')
  const eucalyptusMat = await payload.create({
    collection: 'materials',
    data: {
      name: 'Eucalyptus Tree Fiber',
      impactNote: 'Harvested from FSC-certified forests, processing uses minimal water and land.',
      textureImage: materialTexture.id,
      sourceRegion: 'South Africa',
    },
  })

  console.log('Seeding products...')
  const prodCanvasRunner = await payload.create({
    collection: 'products',
    data: {
      name: "Men's Canvas Runner NZ",
      price: '$100',
      colorways: [
        {
          color: 'Deep Navy Stripes',
          swatch: '#e0dacf',
          image: lifestyleHero.id,
        },
      ],
      fit: 'True to size',
      rating: '4.7',
      tags: [{ tag: 'Canvas' }, { tag: 'Lightweight' }],
      category: catMens.id,
      sizes: [{ size: 8 }, { size: 9 }, { size: 10 }, { size: 11 }, { size: 12 }],
    },
  })

  const prodTreeGlider = await payload.create({
    collection: 'products',
    data: {
      name: "Women's Tree Glider",
      price: '$140',
      colorways: [
        {
          color: 'Burlwood',
          swatch: '#d4d9cf',
          image: mvpLifestyle.id,
        },
      ],
      fit: 'Runs narrow',
      rating: '4.8',
      tags: [{ tag: 'Tree Fiber' }, { tag: 'Breathable' }],
      category: catWomens.id,
      sizes: [{ size: 6 }, { size: 7 }, { size: 8 }, { size: 9 }],
    },
  })

  console.log('Seeding hero blocks...')
  await payload.create({
    collection: 'hero-blocks',
    data: {
      headline: 'Wildly Comfortable. Super Natural.',
      body: 'All New Dasher NZ Collection',
      ctaLabel: 'Shop Men',
      media: lifestyleHero.id,
      themeSwatch: '#4b4440',
    },
  })

  console.log('Seeding promo tiles...')
  await payload.create({
    collection: 'promo-tiles',
    data: {
      title: 'Spring Travel Essentials',
      swatch: '#e0dacf',
      image: travelPromo.id,
    },
  })
  await payload.create({
    collection: 'promo-tiles',
    data: {
      title: 'New Arrivals',
      swatch: '#d4d9cf',
      image: mvpLifestyle.id,
    },
  })

  console.log('Seeding reviews...')
  await payload.create({
    collection: 'reviews',
    data: {
      product: prodTreeGlider.id,
      quote: 'The lightest shoe I packed for a two-week trip. It still looked clean by the flight home.',
      customerName: 'Maya R.',
      detail: 'Tree Glider, Burlwood',
    },
  })

  console.log('Database seeded successfully!')
}

seed().catch(console.error)
```

To run the seeding script, add a script entry in `payload-cms/package.json`:
```json
"scripts": {
  "seed": "tsx src/seed.ts"
}
```
And execute with:
```bash
npm run seed
```

---

## 5. Verification Method

To independently verify the CMS setup:

1. **Build and Start Verification:**
   Run the dev server:
   ```bash
   cd payload-cms
   npm run dev
   ```
   Ensure it binds successfully to `http://localhost:3000`.

2. **Admin Portal Check:**
   Open `http://localhost:3000/admin` in a browser. Log in using `admin@allbirds.com` / `adminpassword123` to confirm SQLite read/write operations work.

3. **REST Endpoints Validation:**
   Query the REST endpoints using curl to verify the schema formats match the requirements:
   - `curl http://localhost:3000/api/hero-blocks`
   - `curl http://localhost:3000/api/categories`
   - `curl http://localhost:3000/api/products`
   - `curl http://localhost:3000/api/promo-tiles`
   - `curl http://localhost:3000/api/materials`
   - `curl http://localhost:3000/api/reviews`

4. **Database File Check:**
   Inspect the database file at `F:/Allbirds/payload-cms/payload.db` to confirm tables exist:
   ```bash
   # Using SQLite CLI
   sqlite3 F:/Allbirds/payload-cms/payload.db .tables
   ```

5. **Invalidation Conditions:**
   - If the database file is not created at `F:/Allbirds/payload-cms/payload.db` (e.g. it creates it relative to working directory elsewhere), update the relative path resolution in `payload.config.ts`.
   - If React version conflicts arise inside Payload's dependency tree, ensure the dependencies are isolated in `payload-cms/package.json` separate from the root package.json.
