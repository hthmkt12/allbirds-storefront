# Progress — 2026-06-10T03:04:30Z

Last visited: 2026-06-10T03:04:30Z

## Planned Tasks
- [x] Product Card Option Selectors
  - [x] Render sizes (8 buttons: sizes 8 to 15, first 6 enabled, last 2 disabled with class `disabled` and standard HTML attribute `disabled` / `aria-disabled`)
  - [x] selected-size-label displays text "Selected Size: <size>"
  - [x] Add to Bag button is disabled if selected size is out-of-stock, enabled if selected size is in-stock
  - [x] Colorway swatches (.product-swatch): selecting a swatch updates product image (.product-crop style/src) and color text (first p in card)
  - [x] Show exactly one `.low-stock-warning` on the page with "Only <number> left"
  - [x] Display `button.size-guide-button` opening `.size-guide-modal` containing h2, table, and close button
- [x] Cart Drawer implementation
  - [x] Bag button in header opens slide-out `.cart-drawer`
  - [x] Close button `.cart-drawer-close` closes drawer
  - [x] Drawer has `aria-label` attribute matching `/cart|bag/i` when opened
  - [x] Empty state: shows `.cart-drawer .cart-empty-message` containing exactly "Your bag is empty"
  - [x] Filled state:
    - [x] Lists items in `.cart-item` with `.item-name` and `.item-size` containing `/Size:/`
    - [x] Displays product color and price details
    - [x] Quantity selector `.quantity-selector` with `button.plus` and `button.minus`, and `.quantity-value`
    - [x] Remove button `button.remove-item`
    - [x] Subtotal `.cart-subtotal` showing total price
    - [x] Shipping progress bar `.shipping-progress-bar` (under $150 vs qualified)
    - [x] Checkout button `.checkout-button` redirecting to `/checkout` (confirmation page)
  - [x] Persist cart in localStorage
- [x] Search Modal implementation
  - [x] Toggle search modal by header button
  - [x] Pressing Enter in input hides search modal
- [x] Newsletter success message
  - [x] Submit form in footer, show `.newsletter-success` "Thanks for subscribing!"
- [x] Build & Test
  - [x] Clean build: `npm run build`
  - [x] Playwright tests pass
