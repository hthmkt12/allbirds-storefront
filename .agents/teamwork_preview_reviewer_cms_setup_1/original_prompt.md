## 2026-06-09T17:30:58Z

Review the Payload CMS setup under `payload-cms/`.

Work Context Path: F:/Allbirds
Reports Path: F:/Allbirds/plans/reports/
Plans Path: F:/Allbirds
Working directory: F:/Allbirds/.agents/teamwork_preview_reviewer_cms_setup_1

Your task is to:
1. Review the SQLite config in `payload-cms/src/payload.config.ts`. Verify it points to `F:/Allbirds/payload-cms/payload.db` using an absolute path.
2. Verify that the 6 collections (`hero-blocks`, `categories`, `products`, `materials`, `reviews`, `promo-tiles` - checking their slugs) are defined with fields and relations exactly as specified in F:/Allbirds/PROJECT.md.
3. Verify that `products` has hooks for `tags` and `sizes` to return flat arrays of strings and numbers respectively.
4. Verify that the seed script (`payload-cms/src/seed.ts` or similar) correctly clears data, uploads local assets, and seeds categories, products, materials, reviews, promo tiles, and hero blocks with relations correctly mapped.
5. Check if the project compiles and builds successfully inside the `payload-cms/` directory.
6. Verify that the seeded data exists in the SQLite database `F:/Allbirds/payload-cms/payload.db`.

Write your report to `F:/Allbirds/.agents/teamwork_preview_reviewer_cms_setup_1/handoff.md` and complete with status DONE.
