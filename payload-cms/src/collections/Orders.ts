import { CollectionConfig } from 'payload'
import crypto from 'crypto'

export const Orders: CollectionConfig = {
  slug: 'orders',
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: ({ req: { user } }) => Boolean(user),
    create: () => true,
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && (!data || !data.orderToken)) {
          return {
            ...data,
            orderToken: crypto.randomUUID(),
          }
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'orderToken',
      type: 'text',
      admin: {
        readOnly: true,
      },
      index: true,
    },
    {
      name: 'email',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingName',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingAddress',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingCity',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingState',
      type: 'text',
      required: true,
    },
    {
      name: 'shippingZip',
      type: 'text',
      required: true,
    },
    {
      name: 'items',
      type: 'json',
      required: true,
    },
    {
      name: 'subtotal',
      type: 'number',
      required: true,
    },
    {
      name: 'tax',
      type: 'number',
      required: true,
    },
    {
      name: 'shipping',
      type: 'number',
      required: true,
    },
    {
      name: 'total',
      type: 'number',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'Delivered', value: 'delivered' },
      ],
    },
    {
      name: 'paymentMethod',
      type: 'select',
      required: true,
      options: [
        { label: 'Credit Card', value: 'card' },
        { label: 'QR Code', value: 'qr' },
      ],
    },
    {
      name: 'paymentStatus',
      type: 'select',
      defaultValue: 'unpaid',
      required: true,
      options: [
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Paid', value: 'paid' },
      ],
    },
  ],
}
