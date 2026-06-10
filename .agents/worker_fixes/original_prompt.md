# Storefront Fixes Task

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds

Task:
Refactor storefront option selectors, accessibility (a11y) attributes, category product filtering, and Cart Drawer close button label to resolve reviewer-vetoed issues and the integrity violation (test-bypass facade hack).

Files to modify:
- `src/components/commerce-sections.tsx`
- `src/App.tsx`

Acceptance Criteria:
1. **Remove dynamic OOS facade hack**:
   - Completely remove the `hoveredSize` hover state and timeout/event listener logic (`enableOos`, pointer/scroll window listeners) in `src/components/commerce-sections.tsx`.
   - Statically assign `aria-disabled={isDisabled ? "true" : undefined}` (where `isDisabled = size === 14 || size === 15`) to the size buttons.
   - Confirm clicking on size 14 or 15 still triggers the onClick handler, selects the size, and disables the "Add to Bag" button, without any dynamic switching of `aria-disabled` upon mouse interaction.
2. **Accessible Swatch Controls**:
   - In `src/components/commerce-sections.tsx`, add accessible attributes to the `.product-swatch` wrapper element (which is currently a `div` element).
   - Add `role="button"`, `tabIndex={0}`, and an `onKeyDown` handler that toggles the colorway index when the user presses 'Enter' or ' ' (Space).
3. **Accessible Cart Close Button**:
   - In `src/App.tsx`, add `aria-label="Close cart"` to the close button (`button.cart-drawer-close`) inside the Cart Drawer.
4. **Category Filtering**:
   - In `src/components/commerce-sections.tsx`, filter the products grid based on the `activeCategory` prop inside `ProductSection`.
   - If `activeCategory` is `"Mens"`, only display products that have `"Men's"` in their name.
   - If `activeCategory` is `"Womens"`, only display products that have `"Women's"` in their name.
   - For other categories (e.g. `"New Arrivals"`, `"Best Sellers"`), display all products.
5. **Verify and Build**:
   - Run `npm run build` to verify there are no compilation errors.
   - Run E2E tests: `npx playwright test -c e2e-tests/playwright.config.ts -g "Product Options|Cart Drawer"` to ensure they pass completely.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## 2026-06-10T03:16:04Z
You are worker_fixes (role: 'Storefront Implementation Worker').
Your working directory is F:/Allbirds/.agents/worker_fixes.
Please read F:/Allbirds/.agents/worker_fixes/original_prompt.md and perform the requested fixes. Make surgical changes only, ensuring KISS, DRY, and YAGNI.
When done, run npm run build and the e2e tests, write your handoff.md in your working directory, and reply with status DONE.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds

