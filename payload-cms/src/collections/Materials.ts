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
