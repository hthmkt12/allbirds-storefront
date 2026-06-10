## 2026-06-10T01:57:22Z
Task: Remove all conditional check fallbacks (such as if-else branches, counts checks, or variable visibility conditions) in the Playwright E2E tests under `e2e-tests/tests/`. Make these assertions STRICT, directly verifying the presence and behavior of elements.
Specifically, modify:
1. `e2e-tests/tests/f4-brand-pages.spec.ts`:
   - Replace the desktop/mobile navigation `if` statements (lines 14-20, 28-34, 41-47) with `isMobile` project configuration skips (`test.skip(isMobile, 'Skip desktop-only nav test on mobile')`).
   - For Payload section navigation (lines 54-63), remove the `if (count > 0)` and make it a strict assertion: locate the footer link to payload, assert it is visible, click it, and expect the page URL to contain `#payload`.
2. `e2e-tests/tests/f5-asset-performance.spec.ts`:
   - Replace the `if (!isHidden)` statement in image alt validation (lines 60-64) with boolean logic assertion: `expect(altText !== null && altText.trim().length > 0 || isHidden === 'true').toBe(true)` directly.
   - Replace `window.performance.timing` (lines 35-38) with modern Navigation Timing API using `performance.getEntriesByType('navigation')[0]`.
3. `e2e-tests/tests/f6-accessibility.spec.ts`:
   - Replace the `if (count > 0)` check for `pillButtons` (lines 95-98) with a strict assertion: `await expect(pillButtons.first()).toBeVisible();` and check that it has class `/light/`.
4. `e2e-tests/tests/tier3-cross-feature.spec.ts`:
   - In the category navigation performance test (lines 97-111), add class assertions `await expect(categoryCards.nth(i)).toHaveClass(/selected/)` after clicking each category card to wait for the DOM to mutate before reading `performance.now()`.
   
Run `npm run build` and then verify compilation of the tests using `npx playwright test -c e2e-tests/playwright.config.ts --project=chromium --dry-run` or check that the tests run and fail as expected (exactly 21 failing tests are expected).
Write a progress update to `F:/Allbirds/.agents/worker_final_harden_replacement/progress.md` and a handoff report at `F:/Allbirds/.agents/worker_final_harden_replacement/handoff.md`.

Work directory: F:/Allbirds/.agents/worker_final_harden_replacement
Work context: F:/Allbirds
Reports: F:/Allbirds/plans/reports/
Plans: F:/Allbirds

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT
hardcode test results, create dummy/facade implementations, or
circumvent the intended task. A Forensic Auditor will independently
verify your work. Integrity violations WILL be detected and your
work WILL be rejected.
