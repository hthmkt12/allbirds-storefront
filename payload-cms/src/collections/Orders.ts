import { CollectionConfig } from 'payload'
import crypto from 'crypto'

// Mirrors src/utils/commerce-config.ts + checkout/validation.ts computeTotals().
// Money fields are recomputed server-side so clients cannot tamper with amounts.
const TAX_RATE = 0.08
const FREE_SHIPPING_THRESHOLD = 150
const SHIPPING_FLAT = 7.5

const parsePrice = (price: unknown): number => {
  const n = parseFloat(String(price ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

const round2 = (n: number): number => Math.round(n * 100) / 100

// App-level DoS guard for the public create endpoint. Edge/proxy rate limiting
// (Cloudflare, nginx limit_req) remains the recommended first line of defense.
const RATE_WINDOW_MS = 60_000
const RATE_MAX_PER_WINDOW = 5
const orderAttempts = new Map<string, number[]>()

const clientKeyOf = (req: { headers: Headers }): string => {
  const forwarded = req.headers.get('x-forwarded-for')
  return (forwarded || 'unknown').split(',')[0].trim()
}

const enforceOrderRateLimit = (req: { headers: Headers }): void => {
  const now = Date.now()
  const key = clientKeyOf(req)
  const hits = (orderAttempts.get(key) || []).filter((ts) => now - ts < RATE_WINDOW_MS)
  if (hits.length >= RATE_MAX_PER_WINDOW) {
    throw new Error('Too many orders created from this address. Please try again in a minute.')
  }
  hits.push(now)
  orderAttempts.set(key, hits)
  // Prune stale keys so the in-memory map cannot grow unbounded.
  for (const [k, timestamps] of orderAttempts) {
    if (timestamps.every((ts) => now - ts >= RATE_WINDOW_MS)) orderAttempts.delete(k)
  }
}

const sanitizeQuantity = (q: unknown): number => {
  const n = Math.floor(Number(q))
  return Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 1
}

const computeTotalsFromItems = (items: unknown) => {
  const rows = Array.isArray(items) ? items : []
  const sanitized = rows.map((row) => ({
    ...(row && typeof row === 'object' ? row : {}),
    price: (row as Record<string, unknown> | null)?.price,
    quantity: sanitizeQuantity((row as Record<string, unknown> | null)?.quantity),
  }))
  const subtotal = sanitized.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  )
  const tax = round2(subtotal * TAX_RATE)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT
  return { items: sanitized, subtotal: round2(subtotal), tax, shipping, total: round2(subtotal + tax + shipping) }
}

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
      ({ data, operation, req }) => {
        if (!data) return data
        if (operation === 'create') enforceOrderRateLimit(req)
        const generatedToken =
          operation === 'create' && !data.orderToken ? crypto.randomUUID() : null
        return {
          ...data,
          ...computeTotalsFromItems(data.items),
          ...(generatedToken ? { orderToken: generatedToken } : {}),
        }
      },
    ],
  },
  // Guest order history: the orderToken was designed exactly for this.
  // Requires BOTH email and token so the public endpoint can never dump orders.
  endpoints: [
    {
      path: '/lookup',
      method: 'get',
      handler: async (req) => {
        const query = (req.query || {}) as Record<string, unknown>
        const email = String(query.email ?? '')
          .trim()
          .toLowerCase()
        const token = String(query.token ?? '').trim()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || token.length < 8) {
          return Response.json({ message: 'A valid email and token are required.' }, { status: 400 })
        }
        const result = await req.payload.find({
          collection: 'orders',
          where: {
            and: [{ email: { equals: email } }, { orderToken: { equals: token } }],
          },
          limit: 10,
          sort: '-createdAt',
        })
        return Response.json({ docs: result.docs })
      },
    },
  ],
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
