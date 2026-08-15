---
phase: 3
title: Frontend Refactor — Checkout Modular + Size Guide Dedupe
status: pending
priority: P1
effort: 3h
dependencies:
  - 1
---

# Phase 3 — Frontend Refactor

## Context / Problem

- `src/components/checkout-view.tsx` is 582 LOC — mixes shipping form, payment (card+QR+VietQR modal), order creation, validation, and inline styles. Violates <=200 LOC convention.
- Size-guide modal implemented 3x nearly-identically:
  - `src/components/commerce-sections.tsx:131-199` (inline-styled copy)
  - `src/components/product-listing-page.tsx:124-173`
  - `src/components/product-detail-view.tsx:448-497`
- Business constants duplicated inline: tax 8%, free-shipping threshold 150, shipping 7.5, default sizes [8..15], CMS base URL. Appears in `cart-drawer.tsx`, `checkout-view.tsx`, `cms-client.ts`, `filter-sort-bar.tsx`, `commerce-sections.tsx`, `product-detail-view.tsx`.

## Tasks

1. **Commerce constants module** — create `src/utils/commerce-config.ts`
   - `TAX_RATE = 0.08`, `FREE_SHIPPING_THRESHOLD = 150`, `SHIPPING_FLAT = 7.5`, `DEFAULT_SIZES = [8..15]`, `CMS_BASE_URL`.
   - Swap existing hardcoded literals in `cart-drawer.tsx`, `checkout-view.tsx`, `cms-client.ts`, `filter-sort-bar.tsx`, `commerce-sections.tsx`, `product-detail-view.tsx` to import these. Surgical: replace only the repeated literals, do not reformat.
   - NOTE: CMS_BASE_URL stays in `cms-client.ts` as the caching source; import from config to avoid drift.

2. **Shared SizeGuideModal component** — create `src/components/size-guide-modal.tsx`
   - Extract one implementation (prefer the classed one from product-listing-page; the commerce-sections copy is inline-styled, migrate to the shared classed version).
   - Replace all 3 local implementations with the shared component. Keep `onOpenSizeGuide` prop contract compatible.

3. **Modularize `checkout-view.tsx`**
   - Split into focused modules under `src/components/checkout/`:
     - `checkout-view.tsx` — wizard shell + step state.
     - `shipping-step.tsx` — shipping form + validation.
     - `payment-step.tsx` — payment method toggle, card validation (Luhn/expiry/CVV) + decline, QR modal + 3s advance.
     - `order-summary.tsx` — totals + item rows.
     - `validation.ts` — pure validators (email, Luhn, expiry, cvv) for testability.
   - Preserve public props/behavior of `CheckoutView` exactly (App.tsx imports it; E2E depends on selectors/text).
   - No visual or behavioral change; pure decomposition.

## Verification

- `npm run build` passes (0 errors).
- E2E `f8-payment-gateway.spec.ts` + `f7-customer-account.spec.ts` (chromium) pass — proves checkout behavior unchanged.
- Grep confirms constants no longer hardcoded in components and SizeGuideModal used once.

## Risks / Rollback

- Checkout refactor is the highest-risk step; E2E f7/f8 are the safety net. If a test breaks on structure not behavior, restore that portion.
- Do NOT change any user-facing string, selector, aria-label, or timing (2s card / 3s QR).
