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
