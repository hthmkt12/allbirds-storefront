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
  throw new Error('[SECURITY] PAYLOAD_SECRET is required in production. Set the PAYLOAD_SECRET environment variable before starting the server.')
}

const parseOrigins = (value: string | undefined): string[] | undefined => {
  if (!value) return undefined
  const origins = value.split(',').map((origin) => origin.trim()).filter(Boolean)
  return origins.length > 0 ? origins : undefined
}

// Cross-origin access for the storefront; unset keeps Payload defaults (no regression for local dev).
const allowedOrigins = parseOrigins(process.env.CMS_ALLOWED_ORIGINS)

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
  // Storefront uses REST only; the admin panel uses the local API.
  graphQL: {
    disable: true,
  },
  cors: allowedOrigins,
  csrf: allowedOrigins,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || undefined,
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
