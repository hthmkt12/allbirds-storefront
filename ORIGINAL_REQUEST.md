# Original User Request

## Initial Request — 2026-06-09T16:30:09Z

An interactive ecommerce storefront modeled on Allbirds, integrating a local Payload CMS instance to manage content dynamically and providing a complete product checkout and shopping cart flow.

Working directory: F:/Allbirds
Integrity mode: development

## Requirements

### R1. Local Payload CMS Integration
Set up a local Payload CMS instance (e.g., in a sibling or subdirectory `payload-cms`) with a portable SQLite database. Define CMS collections for `heroBlocks`, `categories`, `products`, `materials`, `reviews`, and `promoTiles`. Replace static mock data inside the storefront frontend with dynamic HTTP/JSON fetches from the Payload CMS API endpoints.

### R2. Product Details & Shopping Cart Flow
Implement an interactive product detail modal or section on the storefront. Include product option selectors (size, color/swatch) and a quantity selector. Connect this to an interactive side-out Cart Drawer that supports adding items, adjusting quantities, deleting items, and calculating SUBTOTAL and checkout state.

### R3. Asset & Performance Polish
Add distinct, optimized product images for each product/color instead of cropped sprites. Use WebP/AVIF formats to optimize payloads, and implement responsive image loading with `srcset` and `sizes` attributes where applicable.

### R4. Accessible Design & Brand Depth
Incorporate collection filter pages (e.g., Men, Women, Sale, Best Sellers) and deep brand pages (e.g., sustainability or materials story). Perform an accessibility pass including keyboard focus navigation, high-contrast overlay text, skip links, and appropriate mobile touch targets.

## Acceptance Criteria

### Build & Run
- [ ] Storefront builds successfully using `npm run build`.
- [ ] Local Payload CMS starts and connects to SQLite without external database dependencies.

### CMS & Data Integration
- [ ] Payload CMS exposes API endpoints populated with collection schemas for products, categories, hero blocks, reviews, and materials.
- [ ] Storefront fetches all content dynamically from Payload CMS API endpoints; no hardcoded product/category mock arrays are used.

### Storefront & Checkout UI
- [ ] Product detail modals open with active selectors for sizes and colors.
- [ ] Cart Drawer opens on adding an item, correctly displays items with selected colors/sizes, calculates the total price, and allows item removal.
- [ ] Mobile layouts adapt correctly without horizontal scrollbars, and focus rings are visible on keyboard navigation.
