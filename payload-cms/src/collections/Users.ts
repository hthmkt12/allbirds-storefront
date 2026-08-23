import { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  access: {
    read: ({ req: { user } }) => Boolean(user),
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [],
}
