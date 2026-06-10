## 2026-06-09T16:32:28Z
Task: Initialize Playwright E2E test infrastructure under `e2e-tests/` in the workspace.
Working Directory: F:/Allbirds/.agents/worker_scaffold_test_infra

Steps:
1. Check if `@playwright/test` is installed. If not, install `@playwright/test` and save it to devDependencies. (Ensure it uses npm/npx).
2. Create `e2e-tests/playwright.config.ts` configuration file:
   - Set testDir to './tests'
   - Configure local webServer to run `npm run preview` on port 5173, reuseExistingServer: true
   - Configure browser projects: chromium (headless)
   - Use standard reporters (list, html)
3. Add a test script in `package.json`:
   - `"test:e2e": "playwright test -c e2e-tests/playwright.config.ts"`
4. Create a simple smoke test `e2e-tests/tests/smoke.spec.ts` that navigates to the storefront home page and asserts the page runs (e.g. checks that the site header or a heading is present).
5. Verify the setup by building the storefront (`npm run build`) and running the test runner command (`npm run test:e2e` or `npx playwright test -c e2e-tests/playwright.config.ts`) to verify that the smoke test passes.
6. Record your progress in `F:/Allbirds/.agents/worker_scaffold_test_infra/progress.md` and write a handoff report at `F:/Allbirds/.agents/worker_scaffold_test_infra/handoff.md` summarizing files created/modified, command execution results, and any warnings.

Work context: F:/Allbirds
Reports: F:/Allbirds/plans/reports/
Plans: F:/Allbirds
