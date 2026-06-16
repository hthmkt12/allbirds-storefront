---
phase: 3
title: "Product Detail Cart And Checkout"
status: pending
priority: P1
effort: "5h"
dependencies: [2]
---

# Phase 3: Product Detail Cart And Checkout

## Overview

Complete the buy flow from product inspection to checkout confirmation. Keep payment simulated, but make contact/shipping/order review real enough for demo and tests.

## Requirements
- Functional: routeable PDP, selected color/size/quantity, product details, cart quantity/remove, free shipping progress, checkout form, confirmation.
- Non-functional: cart and modal focus behavior accessible; persisted cart normalized; no fake payment promises.

## Architecture
Use cart localStorage as current source of truth. Add checkout form state in frontend. Later Phase 4 can persist orders into Payload if selected.

## Related Code Files
- Modify: `src/App.tsx`
- Modify: `src/components/commerce-sections.tsx`
- Modify: `src/styles.css`
- Possibly create: `src/components/product-detail-view.tsx`, `src/components/cart-drawer.tsx`, `src/components/checkout-view.tsx`
- Modify tests: `e2e-tests/tests/f1-product-options.spec.ts`, `f2-cart-drawer.spec.ts`, `tier4-real-world.spec.ts`

## Implementation Steps

1. Extract cart drawer from `App.tsx` to reduce file size and improve focus handling.
2. Add PDP route/view with gallery, colorways, sizes, fit, material, shipping/returns accordion.
3. Add quantity selector before add-to-cart.
4. Improve cart drawer: item total, shipping line, tax estimate text, recommendations, checkout CTA.
5. Replace confirmation-only checkout with contact/shipping form and order summary.
6. Keep checkout simulated; no real payment fields beyond safe demo inputs.
7. Normalize persisted cart for invalid quantity/price/shape.

## Success Criteria

- [ ] PDP route opens from PLP/home product card.
- [ ] Selected PDP color/size/quantity appears correctly in cart.
- [ ] Cart subtotal/shipping/free-shipping state updates correctly.
- [ ] Checkout validates required contact/shipping fields.
- [ ] Confirmation shows order summary and clears or preserves cart by explicit choice.

## Risk Assessment
File growth risk is high in `App.tsx` and `commerce-sections.tsx`. Mitigation: extract cart/PDP/checkout components before adding large UI blocks.
