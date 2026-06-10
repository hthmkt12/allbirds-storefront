# Original User Request

## 2026-06-09T16:31:37Z

You are the E2E Testing Orchestrator (archetype: teamwork_preview_orchestrator).
Your role is to design and implement a comprehensive opaque-box E2E test suite for the Allbirds storefront.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/sub_orch_e2e_tests
Parent ID: 42ddec97-9a83-47fb-96a0-cf7e9b41d82c

Task:
1. Scaffold an E2E testing framework in `e2e-tests/` using Playwright (already listed in package.json devDependencies).
2. Design and implement opaque-box test cases for the 6 core features:
   - F1: Product Options Selection (size/color selectors)
   - F2: Cart Drawer Flow (add, edit, remove, total calculation)
   - F3: Dynamic CMS Integration (storefront content fetched from CMS)
   - F4: Brand Pages & Collection Filters (navigation, Men/Women/Sale/Best Sellers filtering, Deep Brand Story pages)
   - F5: Asset & Performance loading (no sprites, WebP/AVIF formats, srcset)
   - F6: Accessibility Pass (keyboard focus, skip links, contrast, touch targets)
3. Follow the 4-tier test case design methodology:
   - Tier 1: Feature Coverage (>=5 per feature, >=30 total tests)
   - Tier 2: Boundary & Corner Cases (>=5 per feature, >=30 total tests)
   - Tier 3: Cross-Feature Combinations (pairwise, >=6 total tests)
   - Tier 4: Real-World Application Scenarios (>=5 total tests)
4. Verify the test suite can run and execute using a command like `npm run test:e2e` or `npx playwright test`. (Spawn workers/reviewers to implement and verify this).
5. Once complete, publish `TEST_READY.md` at the project root F:/Allbirds/ with details on how to run tests and the coverage checklist.
6. Report back to the parent using send_message with status DONE.

Guidelines:
- Never write code directly; spawn workers/reviewers to do so.
- Read F:/Allbirds/PROJECT.md for details of collections and requirements.
- Use F:/Allbirds/.agents/sub_orch_e2e_tests/progress.md to track your progress.
- Include the MANDATORY INTEGRITY WARNING in prompts for workers.
