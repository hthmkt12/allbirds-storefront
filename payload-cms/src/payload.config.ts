import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { HeroBlocks } from './collections/HeroBlocks'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { Materials } from './collections/Materials'
import { Reviews } from './collections/Reviews'
import { PromoTiles } from './collections/PromoTiles'
import { Orders } from './collections/Orders'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const resolvedSecret = process.env.PAYLOAD_SECRET || 'fallback-secret-for-development-only-replace-in-production'

if (!process.env.PAYLOAD_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('[SECURITY WARNING] Running with default PAYLOAD_SECRET in production. Set PAYLOAD_SECRET in production environment!')
}

const resolvedDbUrl = process.env.DATABASE_URI || (
  process.env.DATABASE_PATH
    ? `file:${path.resolve(process.env.DATABASE_PATH)}`
    : `file:${path.resolve(dirname, '../payload.db')}`
)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    HeroBlocks,
    Categories,
    Products,
    Materials,
    Reviews,
    PromoTiles,
    Orders,
  ],
  editor: lexicalEditor({}),
  secret: resolvedSecret,
  db: sqliteAdapter({
    client: {
      url: resolvedDbUrl,
    },
  }),
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  sharp,
})
