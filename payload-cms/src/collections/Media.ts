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
    formatOptions: {
      format: 'webp',
    },
    imageSizes: [
      {
        name: 'width-480',
        width: 480,
      },
      {
        name: 'width-768',
        width: 768,
      },
      {
        name: 'width-1024',
        width: 1024,
      },
      {
        name: 'width-1280',
        width: 1280,
      },
      {
        name: 'width-1536',
        width: 1536,
      },
      {
        name: 'width-1920',
        width: 1920,
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
