## Challenge Summary

**Overall risk assessment**: MEDIUM

## Challenges

### [High] Challenge 1: Port Collision & Wrong Server Testing
- Assumption challenged: Port 5173 is unique and always runs the current storefront version.
- Attack scenario: A developer or CI environment has another Vite/React app running on port 5173. When running `npm run test:e2e`, Playwright sees the port is occupied, does NOT launch the storefront preview, and runs the assertions against the other app, causing failure.
- Blast radius: Confusing test failures during development/CI.
- Mitigation: Change `reuseExistingServer: !process.env.CI` and use a dedicated testing port (e.g., 5173 is default, use 5178).

### [Medium] Challenge 2: Fragile Heading Verification
- Assumption challenged: The storefront main heading text is static.
- Attack scenario: When the storefront is integrated with Payload CMS (Milestone 2), a CMS editor changes the hero headline to "Super natural comfort." The smoke test immediately fails on the hardcoded `'Wildly Comfortable. Super Natural.'` check.
- Blast radius: Broken CI pipeline on valid CMS content updates.
- Mitigation: Assert heading visibility or match key substrings instead of strict exact matching, e.g., `expect(heading).toHaveText(/Comfortable/i)`.

### [Medium] Challenge 3: Blind Spot in Mobile Responsiveness
- Assumption challenged: Storefront layout correctness on desktop guarantees correctness on mobile.
- Attack scenario: A UI change introduces a layout issue that causes a horizontal scrollbar or overlapping elements on mobile screens. Since Playwright is only configured with `Desktop Chrome`, the test suite completely misses the regression.
- Blast radius: Degraded mobile UX in production (R4 violation).
- Mitigation: Add a `Mobile Safari` and `Mobile Chrome` project config.

### [Low] Challenge 4: Testing Stale Builds
- Assumption challenged: The `dist` directory is always up to date when running tests.
- Attack scenario: A developer modifies React code and runs `npm run test:e2e` without running `npm run build` first. Playwright starts the preview server which serves the outdated files in `dist`, resulting in false positives.
- Blast radius: Stale code tested, undetected regressions.
- Mitigation: Add a `pretest:e2e` script in `package.json` that runs `npm run build` automatically.

## Stress Test Results

- Port occupied by Clipdrop → Playwright reuses server → test fails on `.brand` assertion → FAIL (verified in worker run)
- Run test without building changes → Playwright preview runs stale code → test passes despite local bug → FAIL (predicted behavior)
- Change H1 heading text in source → smoke test fails on hardcoded assertion → FAIL (predicted behavior)

## Unchallenged Areas

- E2E tests for CMS syncing, Cart, and PDP — reason not challenged: These features and tests are not yet implemented in Milestone 1 scaffolding.
