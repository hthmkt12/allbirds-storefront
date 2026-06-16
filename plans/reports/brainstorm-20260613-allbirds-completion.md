# Brainstorm Report: Allbirds Completion

## Problem
Current app proves CMS-fed storefront basics, but still feels like a one-page prototype. To "complete" it, focus on real shopper flows, not a full Shopify clone.

## Reference Findings
- Home: announcement bar, floating nav, large image hero, category tiles, product grid, promo cards, material/sustainability story, newsletter, full footer.
- Navigation: desktop mega-menu depth; mobile uses compact menu/search/bag actions.
- PLP: collection hero, breadcrumb, product count, filter/sort, gender segment, grid cards, badges, color count, quick size/add.
- Cart: drawer pattern, free-shipping threshold, shipping line, subtotal, recommendations.
- Brand pages: sustainability/material pages are content-heavy and metrics/story driven.

Reference screenshots:
- `plans/reports/allbirds-reference-screenshots/home-desktop-unblocked.png`
- `plans/reports/allbirds-reference-screenshots/mens-plp-desktop-unblocked.png`
- `plans/reports/allbirds-reference-screenshots/home-mobile-unblocked.png`

Local baseline:
- `plans/reports/local-baseline-screenshots/local-home-desktop.png`
- `plans/reports/local-baseline-screenshots/local-home-mobile.png`

## Codebase Findings
- Frontend: React 19 + Vite + TypeScript in `src/`.
- Styling: one `src/styles.css`, many inline styles in `src/App.tsx` and `src/components/commerce-sections.tsx`.
- Backend: Payload CMS in `payload-cms/`, SQLite, public read collections for content/catalog.
- Existing commerce: cart localStorage, drawer, subtotal, mock checkout confirmation.
- Existing gaps: no real routes for PLP/PDP, search is modal input only, filter/sort absent, only first product has inline add-to-cart controls, checkout no form/order model.

## Use Cases To Support
1. Shopper lands on home, chooses Men/Women/New Arrivals/Best Sellers.
2. Shopper views PLP, filters by size/color/material/product type/price, sorts products.
3. Shopper quick-adds from PLP after selecting size/color.
4. Shopper opens PDP, switches colorway, reads fit/material/shipping details, adds to bag.
5. Shopper edits cart quantities, sees free shipping progress and order totals.
6. Shopper enters checkout contact/shipping details and reaches confirmation.
7. Shopper searches products and navigates to matching items.
8. Shopper opens help/account placeholders without dead controls.
9. Editor updates products/categories/content in Payload and frontend reflects changes.

## Options Considered

### Option A: Full Shopify-like rebuild
- Pros: closest to Allbirds.
- Cons: too broad; payment/auth/inventory complexity expands fast.
- Verdict: reject for this repo.

### Option B: Complete prototype with local commerce state + Payload catalog
- Pros: high demo value, fits current architecture, buildable in phases.
- Cons: checkout/order is simulated unless a real order collection is added.
- Verdict: recommended.

### Option C: Backend-first commerce API
- Pros: cleaner long-term backend.
- Cons: less visible value; overkill before frontend flows are complete.
- Verdict: do only the backend fields/orders needed by UI.

## Recommended Direction
Use Option B. Keep Payload as content/catalog/order storage. Keep cart client-side for now. Add real PLP/PDP/search/checkout UX and enough CMS schema to support it. Avoid auth/payment unless explicitly requested later.

## Challenge Questions
- Do we need real payments now? No. Risk: scope explodes. Use simulated checkout.
- Do we need user accounts now? No. Risk: auth/security work dominates. Use account drawer/placeholder.
- Should products become fully routeable? Yes. PLP/PDP routes are core shopper flow.
- Should filter/sort be CMS-backed? Partly. Derive options from product fields first.
- Should we keep mock fallback? Yes. It protects local dev when CMS offline.

## Success Metrics
- `npm run build` passes.
- No mobile horizontal overflow at 390px.
- Product cards all support quick add.
- PLP filter/sort changes visible product count.
- PDP can add selected size/color to cart.
- Checkout collects required fields and creates confirmation state.
- CMS seed includes enough product fields for filters/PDP.

## Unresolved Questions
- None.
