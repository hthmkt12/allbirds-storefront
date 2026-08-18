# Phase 01: Orders Security & Lookup Token

## Objective
Restrict public access to `Orders` collection to protect customer PII while allowing guest checkout and authenticated admin management.

## Context
- `payload-cms/src/collections/Orders.ts` currently sets `access.read: () => true`, exposing customer emails, shipping addresses, and full order details publicly.
- Storefront (`src/components/checkout-modal.tsx` or `src/utils/cms-client.ts`) creates orders and stores reference in `localStorage`.

## Implementation Steps
1. **Update `payload-cms/src/collections/Orders.ts`**:
   - Add field `orderToken` (`type: 'text'`, `admin.readOnly: true`, indexed or default generated via hook).
   - Set `access.read`: `({ req: { user } }) => Boolean(user)` (admin only for full list).
   - Add `beforeChange` hook to generate a cryptographically strong UUID/token if not present.
2. **Update Storefront Order Creation (`src/utils/cms-client.ts` / `src/components/checkout-modal.tsx`)**:
   - Save returned `orderId` and `orderToken` in local state / `localStorage`.
   - Update confirmation screen to reference the order securely.

## Validation
- `curl http://localhost:3000/api/orders` returns 0 items / unauthorized without token.
- Guest order creation returns order with token.
