# Scope: Performance Polish

## Architecture
- **Frontend Assets**: Images located in `F:/Allbirds/public`.
- **Storefront Components**: React components rendering images (e.g. products, banners, grid layouts) under `src/`.
- **E2E Testing**: Playwright tests defined in `e2e-tests/` specifically verifying asset and page performance.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Identify images in `public/` and components in `src/` rendering them | None | DONE |
| 2 | Image Conversion | Convert large/mock images to optimized WebP/AVIF formats | M1 | DONE |
| 3 | Responsive Images & Crop Removal | Implement `srcset` / `sizes` on image elements, and remove sprite sheet crops / CSS crops | M2 | DONE |
| 4 | Verification | Build storefront cleanly and pass E2E tests | M3 | DONE |
| 5 | Forensic Audit | Perform integrity checks with the Forensic Auditor | M4 | IN_PROGRESS (Auditor running) |

## Interface Contracts
- Storefront image rendering must support standard responsive sizes, fallbacks, and formats.
- E2E Tests verify CLS (< 0.1), layout, and loading performance.
