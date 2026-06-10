# Implementation Plan - Harden Tests

## Proposed Modifications

### 1. `e2e-tests/tests/f1-product-options.spec.ts`
- **Size Selection**: Enforce that size buttons (`button.size-button`) are present and clickable. Remove any optional chaining fallback on size text (e.g. `sizeText?.trim() || ''`). Assert a specific count of size buttons (e.g., exactly 8).
- **Disabled/Out of Stock Sizes**: Enforce that out-of-stock sizes have the `.disabled` class, are disabled, and are present with a specific count (e.g., exactly 2).
- **Disabled Add to Bag**: Ensure the "Add to Bag" button is disabled when an out-of-stock size is selected.
- **Size Guide Modal**: Verify size guide button presence, clicking it opens the modal strictly. Assert the modal heading is "Size Guide" and that the size guide table/content is visible. Clicking the close button must close the modal.
- **Low Stock Warnings**: Enforce the exact warning count (e.g., 1) and exact text/regex matching (e.g. `/only \d+ left/i`).

### 2. `e2e-tests/tests/f2-cart-drawer.spec.ts`
- **Open Cart Drawer**: Assert that clicking the bag icon opens the cart drawer and it becomes visible.
- **Empty Cart**: Assert that the empty cart text exists and matches "Your bag is empty" strictly.
- **Add Product & Display**: Assert adding a product (by selecting a size and clicking Add to Bag) opens the cart drawer and displays exactly 1 item.
- **Subtotal Update**: Verify subtotal updates and matches the item price strictly (no fallback, e.g. exact price matches).
- **Quantity Changes**: Verify that clicking plus increases quantity strictly (e.g., value updates from 1 to 2, subtotal updates to $200), and minus decreases it strictly.
- **Item Removal**: Verify removing the item shows the empty cart text strictly.
- **Checkout Flow**: Verify that clicking checkout navigates to `/checkout` strictly.

### 3. `e2e-tests/tests/tier3-cross-feature.spec.ts`
- **Add to Bag on Card**: Select a product card, select a size, click Add to Bag, assert the cart drawer is visible and the item is in the drawer.
- **Cart Drawer Navigation**: Open cart drawer, click a navigation link, and verify cart drawer remains visible strictly.
- **Cart Drawer Accessibility**: Verify that `aria-label` or `aria-labelledby` exists on the cart drawer and is non-empty, without fallback.

### 4. `e2e-tests/tests/tier4-real-world.spec.ts`
- **Complete Shopping Flow**: Select size, add to bag, increase quantity, checkout, and assert navigation.
- **Newsletter Signup**: Assert email input, click join, and strictly assert visible success message `.newsletter-success` contains success text.
- **Search Modal**: Click search button, assert `.search-modal input` is visible, fill it, and press Enter strictly.

## Verification
- Run `npm run build` to verify compilation.
- Run `npx playwright test -c e2e-tests/playwright.config.ts --project=chromium --list` to check test list.
- Run tests and verify they fail as expected on the current mock codebase.
