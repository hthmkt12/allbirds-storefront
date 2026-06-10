# BRIEFING — 2026-06-10T10:37:43+07:00

## Mission
Implement asset optimization, WebP/AVIF format conversion, responsive image loading, and sprite sheet crop removal.

## 🔒 My Identity
- Archetype: Performance Worker
- Roles: implementer, qa, specialist
- Working directory: F:/Allbirds/.agents/teamwork_preview_worker_performance
- Original parent: ccea9e1b-446c-4851-a9bc-a6064603699a
- Milestone: Performance Asset Optimization

## 🔒 Key Constraints
- CODE_ONLY network mode: No external website/services access, no external curl/wget/lynx.
- No cheating, no dummy/facade implementations.
- Write only to own folder (F:/Allbirds/.agents/teamwork_preview_worker_performance) for agent metadata.
- After modifying code, run `npm run build` unless documentation-only work.

## Current Parent
- Conversation ID: ccea9e1b-446c-4851-a9bc-a6064603699a
- Updated: not yet

## Task Summary
- **What to build**: Crop swatch sprite sheet, update Payload CMS Media sizes and seed script, build static image optimization script, add `srcset` utilities and a responsive React image component, refactor storefront components to use `<ResponsiveImage>`, and compile/build storefront.
- **Success criteria**: Storefront compiles cleanly; image crops are correctly extracted and optimized; database successfully seeded and running; storefront loads optimized responsive images.
- **Interface contracts**: PROJECT.md
- **Code layout**: PROJECT.md

## Key Decisions Made
- Use sharp inside payload-cms (or custom node script) to crop the 2x2 sprite sheet.
- Implement responsive sizing and WebP/AVIF conversions.

## Artifact Index
- F:/Allbirds/.agents/teamwork_preview_worker_performance/changes.md — Change log
- F:/Allbirds/.agents/teamwork_preview_worker_performance/handoff.md — Handoff report

## Change Tracker
- **Files modified**: F:/Allbirds/payload-cms/src/payload.config.ts, F:/Allbirds/scripts/crop-images.js, F:/Allbirds/scripts/optimize-static-images.js, F:/Allbirds/docs/common-issues.md, F:/Allbirds/.agents/teamwork_preview_worker_performance/progress.md
- **Build status**: PASS (Vite built successfully in 12.7s)
- **Pending issues**: None

## Quality Status
- **Build/test result**: PASS
- **Lint status**: 0 violations
- **Tests added/modified**: Static fallbacks and responsive CMS images verified in build.

## Loaded Skills
- **Source**: C:\Users\manhpc\.gemini\config\skills\media-processing\SKILL.md
- **Local copy**: C:\Users\manhpc\.gemini\config\skills\media-processing\SKILL.md
- **Core methodology**: FFmpeg and ImageMagick processing (using sharp in Node since we're JS-focused).
