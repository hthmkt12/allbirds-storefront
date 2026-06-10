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
