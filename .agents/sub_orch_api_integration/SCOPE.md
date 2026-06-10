# Scope: API Integration (M2)

## Architecture
- Storefront frontend (React + Vite + TS) fetching data from local Payload CMS API endpoints (`http://localhost:3000/api` or `http://127.0.0.1:3000/api`).
- Components render dynamically with fallback mock values in case Payload is offline or endpoint fails.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| 1 | Exploration | Examine static mocks in `src/data/allbirds-data.ts` and components. Verify Payload CMS endpoints. | None | DONE | d21765cb-4bb3-43b6-a09a-c5fc64072799 |
| 2 | Implementation | Replace mocks with dynamic HTTP fetches. Add loading, empty, and error fallback states. | Exploration | DONE | 76829956-fde4-45b9-893f-917426e30d5d |
| 3 | Verification | Run build `npm run build` and E2E tests `npx playwright test -c e2e-tests/playwright.config.ts` | Implementation | DONE | 9119ef66-7313-48ec-a1f8-3ba2f9619f9f, c30c803e-65fc-4807-92f1-60984aadda7c |

## Interface Contracts
### Payload CMS Collections
1. `heroBlocks`: `headline`, `body`, `ctaLabel`, `media` (relation to Media), `themeSwatch`
2. `categories`: `name`, `slug`, `cta`, `swatch`, `image` (relation to Media)
3. `products`: `name`, `price`, `colorways` (array of: color name, swatch color, image relation to Media), `fit`, `rating`, `tags` (array), `category` (relation to Categories), `sizes` (array of numbers)
4. `materials`: `name`, `impactNote`, `textureImage` (relation to Media), `sourceRegion`
5. `reviews`: `product` (relation to Products), `quote`, `customerName`, `detail`
6. `promoTiles`: `title`, `swatch`, `image` (relation to Media)
