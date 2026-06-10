# Scope: E2E Testing Track

## Architecture
- **Test Runner**: Playwright (`@playwright/test`) configured to run against `http://127.0.0.1:5173` (Vite dev/preview port).
- **Test Structure**:
  - `e2e-tests/playwright.config.ts`: Main Playwright configuration.
  - `e2e-tests/tests/f1-product-options.spec.ts`: Tests for Product Options Selection.
  - `e2e-tests/tests/f2-cart-drawer.spec.ts`: Tests for Cart Drawer Flow.
  - `e2e-tests/tests/f3-cms-integration.spec.ts`: Tests for Dynamic CMS Integration.
  - `e2e-tests/tests/f4-brand-pages.spec.ts`: Tests for Brand Pages & Collection Filters.
  - `e2e-tests/tests/f5-asset-performance.spec.ts`: Tests for Asset & Performance loading.
  - `e2e-tests/tests/f6-accessibility.spec.ts`: Tests for Accessibility Pass.
  - `e2e-tests/tests/tier3-cross-feature.spec.ts`: Pairwise cross-feature integration tests.
  - `e2e-tests/tests/tier4-real-world.spec.ts`: Real-world application scenarios.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| 1 | Scaffold Test Infra | Create `e2e-tests/playwright.config.ts`, verify `@playwright/test` is installed, add test scripts to `package.json`, and run a smoke test. | None | DONE | 834d3118-02a6-4708-9b0f-723889fc1f96 |
| 2 | Implement Tier 1 Tests | Implement 30+ tests (>=5 per feature) covering F1-F6 happy path features. | M1 | IN_PROGRESS | 3080245c-daec-4e7c-a642-39eb2defa692 |
| 3 | Implement Tier 2 Tests | Implement 30+ tests (>=5 per feature) covering boundaries, edge cases, error cases, and accessibility trapping. | M2 | IN_PROGRESS | 3080245c-daec-4e7c-a642-39eb2defa692 |
| 4 | Implement Tiers 3 & 4 Tests | Implement >=6 cross-feature combinations and >=5 real-world application scenarios. | M3 | IN_PROGRESS | 3080245c-daec-4e7c-a642-39eb2defa692 |
| 5 | Verify Suite & Publish | Run tests against the storefront, verify framework parses all tests correctly, and publish `TEST_READY.md`. | M4 | PLANNED | TBD |

## Interface Contracts
- **Selectors / Elements**: Opaque-box selectors targeting standard user-visible text (e.g. `button:has-text("Add to Cart")`, `text=Men`, `role=tab`, accessibility-labeled selectors).
- **Vite Config**: Port `5173` for testing storefront locally.
