---
phase: 1
title: CMS Types & Orders Access & Slugs
status: in-progress
priority: P1
effort: 2h
dependencies: []
---

# Phase 1 — CMS Hardening

## Context / Problem

- `payload-cms/src/payload-types.ts` is STALE: `Order` lacks `paymentMethod`/`paymentStatus` (fields exist in `Orders.ts` but types were never regenerated after F8).
- `Products.afterRead` maps `tags: {tag}[] -> string[]` and `sizes: {size}[] -> number[]` at read time, but generated types still declare object arrays — runtime API shape ≠ type.
- `Orders.ts` configures only `read`/`create`; Payload defaults leave `update`/`delete` OPEN → any visitor can PATCH/DELETE orders.
- `Products.slug` admin note says "Auto-generated from name if left empty" but no hook implements it; seeded products get `slug: null` (paths like /products/null or missing PDP route).

## Tasks

1. **Lock down Orders access**
   - File: `payload-cms/src/collections/Orders.ts`
   - Add to `access` block: `update: () => false, delete: () => false`.
   - Keep `read: () => true` and `create: () => true` (storefront needs both).

2. **Auto-generate product slug**
   - File: `payload-cms/src/collections/Products.ts`
   - Add `hooks.beforeValidate` (or `beforeChange`) that sets `slug` from a slugified `name` when empty/missing. ASCII slug: lowercase, trim, non-alphanumeric -> `-`, collapse dashes.
   - Collection currently only has `afterRead`; add the new hook alongside.

3. **Regenerate Payload types**
   - Command (inside `payload-cms/`): `npx cross-env PAYLOAD_SECRET=fallback-secret-for-development-only-replace-in-production payload generate:types` (or a local `generate:types` npm script if present — add script `"generate:types": "payload generate:types"` if missing).
   - Verify: grep `payload-types.ts` for `paymentMethod` and `paymentStatus` inside `export interface Order { ... }`.
   - Expected residual: Products `tags`/`sizes` still typed as object arrays in generated file (generator cannot see afterRead shape). Do NOT hand-edit the generated file. The frontend `CmsProduct`/`CmsOrder` interfaces in `src/utils/cms-client.ts` already model the runtime shape; leave them.

## Verification

- `npx payload generate:types` produces `paymentMethod: ('card' | 'qr')` and `paymentStatus: ('unpaid' | 'paid')` on `Order`.
- `cd payload-cms && npm run build` compiles cleanly (0 errors).
- Manual: POST /api/orders still accepted; PATCH /api/orders/:id returns 403.
- `npm run build` at root still passes.

## Risks / Rollback

- Regenerating types rewrites the whole `payload-types.ts` — review the diff for unrelated drift; if large/unexpected, restore from git and regenerate with exact config.
- Locking update/delete could break admin editing of orders in the Payload admin UI — verify admin can still manage orders when signed in (Payload admin bypasses access only if `admin` users have rights; if so, note it; otherwise acceptable for this simulated app).
