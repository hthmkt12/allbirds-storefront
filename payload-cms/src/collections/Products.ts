import { CollectionConfig } from 'payload'

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterRead: [
      ({ doc }) => {
        if (Array.isArray(doc.tags)) {
          doc.tags = doc.tags.map((val: any) => {
            if (val && typeof val === 'object' && 'tag' in val) {
              return val.tag
            }
            return val
          })
        }
        if (Array.isArray(doc.sizes)) {
          doc.sizes = doc.sizes.map((val: any) => {
            if (val && typeof val === 'object' && 'size' in val) {
              return val.size
            }
            return val
          })
        }
        return doc
      },
    ],
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
      type: 'number',
      required: true,
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
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
          required: true,
        },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      admin: {
        description: 'Auto-generated from name if left empty',
      },
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'productType',
      type: 'text',
      admin: {
        description: 'e.g. shoes, apparel',
      },
    },
    {
      name: 'gender',
      type: 'select',
      options: [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Unisex', value: 'unisex' },
      ],
    },
    {
      name: 'salePrice',
      type: 'text',
    },
    {
      name: 'badge',
      type: 'text',
      admin: {
        description: 'e.g. New, Best Seller',
      },
    },
  ],
}
