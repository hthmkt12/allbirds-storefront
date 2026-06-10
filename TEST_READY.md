# E2E Test Suite Ready

## Test Runner
- Command: `npx playwright test -c e2e-tests/playwright.config.ts`
- Expected behavior: 50 tests pass and 22 tests fail (failing exactly on unimplemented features of the mock storefront like Cart Drawer, checkout navigation, size selection, and newsletter success). Once the storefront is fully implemented, all 72 tests should pass with exit code 0.

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 30 | Happy path verification for F1-F6 (5 tests per feature) |
| 2. Boundary & Corner | 30 | Edge cases, boundaries, disabled states, and validation (5 tests per feature) |
| 3. Cross-Feature | 6 | Pairwise combination and integration tests between features |
| 4. Real-World Application | 5 | End-to-end shopping user journeys and search flows |
| Smoke Test | 1 | Basic storefront loading smoke test |
| **Total** | **72** | |

## Feature Checklist
| Feature | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|:------:|:------:|:------:|:------:|
| F1: Product Options Selection | 5 | 5 | ✓ | ✓ |
| F2: Cart Drawer Flow | 5 | 5 | ✓ | ✓ |
| F3: Dynamic CMS Integration | 5 | 5 | ✓ | ✓ |
| F4: Brand Pages & Collection Filters | 5 | 5 | ✓ | ✓ |
| F5: Asset & Performance loading | 5 | 5 | ✓ | ✓ |
| F6: Accessibility Pass | 5 | 5 | ✓ | ✓ |
