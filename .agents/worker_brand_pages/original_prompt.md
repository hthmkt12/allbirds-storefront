## 2026-06-10T03:36:26Z

You are the Brand Pages and Accessibility Worker. Your task is to implement the requested storefront navigation, filtering, brand story pages, and accessibility fixes in the Allbirds storefront.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/worker_brand_pages

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Detailed Tasks:
1. Update `src/App.tsx` layout structure:
   - Adjust `SiteHeader`, `main`, and `NewsletterFooter` layout to have correct semantic HTML5 landmarks: `<header>` (SiteHeader), `<main>` (containing Hero, CategoryStrip, ProductSection, MvpSection, PromoSection, MaterialStory, ReviewsSection, PayloadContract), and `<footer>` (NewsletterFooter) as top-level siblings rather than nesting header/footer inside main.
   - Implement `handleCategoryChange(catName)` and `handleAudienceChange(audienceName)` to keep `activeCategory` and `audience` synchronized and avoid conflicts (e.g. if category is "Mens", set audience to "Shop Men", and vice versa; if audience is "Shop Men" and category is "Womens", set category to "Mens", etc.).
2. Update `src/components/commerce-sections.tsx`:
   - In `ProductSection`, implement proper product filtering:
     - If `activeCategory` is "Mens", show only products with "Men's" in the name.
     - If `activeCategory` is "Womens", show only products with "Women's" in the name.
     - For other categories (e.g., "New Arrivals", "Best Sellers"), filter by `audience`:
       - If `audience` is "Shop Men", show only products with "Men's" in the name.
       - If `audience` is "Shop Women", show only products with "Women's" in the name.
       - If `activeCategory` is "Best Sellers", also filter by rating (e.g., rating >= 4.7).
   - Ensure the category cards selection updates activeCategory correctly.
3. Update `src/styles.css`:
   - Add focus/focus-visible styles to `a`, `button`, `[role="button"]`, and `input` so focus outline is always visible when navigated via keyboard. For example:
     ```css
     a:focus, button:focus, [role="button"]:focus, input:focus {
       outline: 2px solid var(--charcoal) !important;
       outline-offset: 2px !important;
     }
     ```
   - Add `.sr-only` class to support visually hidden labels for accessibility.
     ```css
     .sr-only {
       position: absolute;
       width: 1px;
       height: 1px;
       padding: 0;
       margin: -1px;
       overflow: hidden;
       clip: rect(0, 0, 0, 0);
       white-space: nowrap;
       border: 0;
     }
     ```
4. Verify accessibility of all interactive controls and headings:
   - Ensure the homepage contains exactly one visible `<h1>` element (which is the hero headline).
   - Ensure the footer email input has a matching label.
   - Add a screen-reader-only label for the search modal's text input (e.g., `<label htmlFor="search-input" className="sr-only">Search products</label>` and matching `id="search-input"`).
5. Build and verify the storefront:
   - Run `npm run build` and ensure it completes with no TypeScript/Vite errors.
6. Run the Playwright E2E tests:
   - `npx playwright test -c e2e-tests/playwright.config.ts -g "Brand Pages|Accessibility"`
   - Verify all tests under those suites pass.

Please write a handoff report (handoff.md) in your working directory `F:/Allbirds/.agents/worker_brand_pages/` explaining the changes made, build output, and test results.
Then, report back to the parent agent with your status.
