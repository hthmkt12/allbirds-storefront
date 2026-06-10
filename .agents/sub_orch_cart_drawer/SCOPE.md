# Scope: PDP Selector & Cart Drawer (M3)

## Architecture
- React Frontend (Vite + TypeScript)
- Interactive product options (sizes and colorways) on product cards.
- Sizes: 8 size buttons per product, 6 enabled, 2 disabled (`button.size-button.disabled`). Selected size shown in `.selected-size-label` as "Selected Size: <size>".
- Colorways: Swatches click updates the active colorway, including product image and color text.
- Size Guide Modal: `.size-guide-modal` shown by clicking `button.size-guide-button`. Contains `h2` "Size Guide", a `table`, and `.close-modal` button to close it.
- Low Stock Warning: `.low-stock-warning` displays warning (e.g., "Only 3 left") for limited options.
- Audience Persistence: Persistence of selected audience ("Shop Men" vs "Shop Women") across state.
- Cart Drawer: Slide-out panel `.cart-drawer` toggled by `button[aria-label="Bag"]` or after adding items.
- Empty State: Displays `.cart-drawer .cart-empty-message` containing exactly "Your bag is empty".
- Cart Items: Lists `.cart-item` containing `.item-name` and `.item-size` containing `/Size:/`.
- Quantity operations: `.quantity-selector` containing `button.plus` and `button.minus`, and `.quantity-value`. Adjusts subtotal `.cart-subtotal`.
- Remove: `button.remove-item` removes the item.
- Shipping Progress Bar: `.shipping-progress-bar` displaying how much is left away from free shipping.
- Checkout button: `.checkout-button` redirects to `/checkout`. A simple page layout switch (e.g. conditional rendering based on path) or pushState is used to mock checkout page routing.
- Persistence: Store/restore cart items to/from `localStorage`.
- Newsletter footer submission: Displays `.newsletter-success` showing "Thanks for subscribing!" upon form submission.
- Search Modal: `.search-modal` with `input`. Pressing Enter closes it.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Decompose & Setup | Create agent working dir, original_prompt.md, progress.md, and SCOPE.md | None | DONE |
| 2 | Option Selectors | Size selector (8 sizes, 6 enabled, 2 disabled), selected-size-label, and color swatch selector on ProductCard. Support low-stock warning and size-guide modal. | M1 | DONE |
| 3 | Cart Drawer UI & State | Interactive `.cart-drawer` with slide-out animation/state, bag button toggle, close button, and empty state. | M2 | DONE |
| 4 | Cart Item Operations | Add to bag logic, item details rendering in drawer, quantity adjustments, item removal, and subtotal calculation. | M3 | DONE |
| 5 | Checkout & Free Shipping | Shipping progress bar update, checkout page route redirect (`/checkout`), search modal dialog, newsletter subscribe confirmation. | M4 | DONE |
| 6 | Testing & Verification | Run Playwright test suite for F1 & F2, fix styling or logic bugs | M5 | DONE |
| 7 | Integrity Audit | Run Forensic Auditor and verify codebase integrity | M6 | DONE |
