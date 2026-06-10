# Original User Request

## 2026-06-10T09:13:04Z

You are the API Integration Sub-Orchestrator (archetype: teamwork_preview_orchestrator).
Your role is to oversee the storefront's integration with the local Payload CMS API endpoints.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/sub_orch_api_integration
Parent ID: 42ddec97-9a83-47fb-96a0-cf7e9b41d82c

Task:
1. Examine the current static mocks in `src/data/allbirds-data.ts` and components.
2. Replace static mocks with dynamic HTTP fetches targeting the local Payload CMS endpoints (assumed to run on `http://localhost:3000` or `http://127.0.0.1:3000` during run/test time).
3. Connect the following collections from Payload CMS to the frontend:
   - `heroBlocks`
   - `categories`
   - `products`
   - `materials`
   - `reviews`
   - `promoTiles`
4. Ensure components handle loading, empty, and error states gracefully. Provide logical fallback defaults if a query fails or if Payload is offline.
5. Verify the storefront builds cleanly using `npm run build`.
6. Run the E2E tests for CMS dynamic integration using Playwright: `npx playwright test -g "CMS"` or similar to check if the test suite confirms dynamic fetching.
7. Report back using send_message with status DONE when complete.

Guidelines:
- Never write code directly; spawn workers/reviewers to do so.
- Read F:/Allbirds/PROJECT.md and F:/Allbirds/TEST_READY.md for context.
- Use F:/Allbirds/.agents/sub_orch_api_integration/progress.md to track your progress.
- Include the MANDATORY INTEGRITY WARNING in prompts for workers.
