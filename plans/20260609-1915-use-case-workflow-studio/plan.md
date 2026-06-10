# Allbirds Natural Materials Storefront

## Context
- Workspace: `F:\Allbirds`
- README: missing, no existing project files found.
- Style source: Refero Allbirds design system.
- Workflow source: saved Tony's Friends use-case driven workflow article, used only to shape backend-readiness and Payload CMS contracts.

## Phases
- [x] Research style and workflow references.
- [x] Scaffold React/Vite frontend.
- [x] Implement Allbirds storefront UI.
- [x] Validate build and browser render.
- [x] Deploy Cloudflare Pages.

## Key Requirements
- Build real frontend app, not a static mock.
- Use Allbirds-style white/sand palette, flat surfaces, pill controls, tracked labels.
- Keep structure ready for future Payload CMS backend.
- Use workflow file only as implementation discipline and backend contract reference.
- Include storefront content models: hero blocks, categories, products, materials, use-case rules.

## Dependencies
- React + Vite for frontend app.
- Wrangler for Cloudflare Pages direct upload.

## Validation
- `npm run build` passed.
- Playwright local desktop/mobile QA passed.
- Cloudflare Pages production QA passed at `https://allbirds-natural-materials-storefront.pages.dev`.

## Unresolved Questions
- None.
