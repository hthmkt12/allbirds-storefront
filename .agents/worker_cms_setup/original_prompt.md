## 2026-06-09T16:34:32Z

Implement the Payload CMS setup for the storefront backend.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/worker_cms_setup

Read the following reference files for guidance:
1. Scope specification: `F:/Allbirds/.agents/sub_orch_cms_setup/SCOPE.md`
2. Synthesis plan: `F:/Allbirds/.agents/sub_orch_cms_setup/synthesis.md`
3. Explorer reports: `F:/Allbirds/.agents/teamwork_preview_explorer_cms_setup_1/handoff.md` and `F:/Allbirds/.agents/teamwork_preview_explorer_cms_setup_2/handoff.md`

Your tasks are:
1. Initialize the Payload CMS 3.x backend under the `payload-cms/` directory (you may use npx create-payload-app with flags or construct package.json and config files directly).
2. Configure the database adapter to use SQLite with the file located at `F:/Allbirds/payload-cms/payload.db`. Make sure connection string is an absolute path to prevent it writing to temp folders on Windows.
3. Implement the 6 required collections (heroBlocks, categories, products, materials, reviews, promoTiles) + Users & Media collections. Ensure they have public read access (`access: { read: () => true }`).
4. Apply the required field mapping for arrays: products.sizes (array of numbers) and products.tags (array of strings) using afterRead hooks to transform array objects to flat arrays to match the expected API structure.
5. Create a seed script (e.g. `payload-cms/src/seed.ts` or `payload-cms/src/seed/index.ts`) that:
   - Clears existing documents.
   - Uploads the image files from `F:/Allbirds/public/` to the media collection.
   - Populates categories, products, materials, reviews, promoTiles, and heroBlocks referencing the media IDs.
   - Run the seed command to populate the database.
6. Verify that the build succeeds (`npm run build` inside `payload-cms`).

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Write your report to `F:/Allbirds/.agents/worker_cms_setup/handoff.md` and complete with status DONE.
