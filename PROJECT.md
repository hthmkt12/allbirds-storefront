# Project: Allbirds E-Commerce Storefront & Payload CMS Integration

## Architecture
- **Frontend Storefront**: React + Vite application running on client (default port 5173). It fetches content dynamically from the CMS API endpoints and falls back to local mock data when the CMS is unreachable.
- **CMS Backend (EmDash)**: An Astro-based backend deployed to Cloudflare Workers, backed by a Cloudflare D1 database (`allbirds-emdash-db`). Source lives under `emdash-backend/`. The storefront targets the deployed edge endpoint by default (`https://allbirds-emdash-backend.worldnew.workers.dev`), overridable via the `VITE_CMS_URL` env var.
- **Database**: Cloudflare D1 (`allbirds-emdash-db`, binding `DB`) bound to the Worker.
- **E2E Tests**: Comprehensive test suite under `e2e-tests/` covering PDP, Cart, CMS syncing, and accessibility.
- **Legacy backend (deprecated)**: The original Payload CMS + SQLite implementation under `payload-cms/` is retained for reference only and is no longer the active backend.

## Code Layout
- Frontend: `src/`
- CMS Source: `emdash-backend/` (active); `payload-cms/` (deprecated, legacy)
- Tests: `e2e-tests/`

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|------|-------|--------------|--------|-----------------|
| 1 | E2E Testing Track | Build test runner, cases T1-T4, publish TEST_READY.md | None | DONE | 443a3f9d-eaf4-4341-a4fd-1fa4b2f4dae7 |
| 2 | CMS Setup (M1) | Setup Payload CMS under `/payload-cms`, SQLite db, define 6 collections, seed data | None | DONE | 577ad584-709b-4d21-9e78-19dadf5947dd |
| 3 | API Integration (M2) | Frontend CMS client + fetch/fallback wired to the API contract below | M1 | DONE | 2eedaf07-3504-4419-a01c-ac22446490a9 |
| 4 | PDP & Cart Drawer (M3) | Implement PDP selectors, Cart Drawer, item count edit/delete, price totals | M2 | DONE | 0d2f5db9-29ec-426d-9a6f-0aa5465d0d84 |
| 5 | Brand Pages & Accessibility (M4) | Collection pages, Brand story, accessibility fixes, skip link, keyboard focus | M3 | DONE | ee7299f7-3a91-43c3-97b4-bd8a62033126 |
| 6 | Performance Polish (M5) | WebP/AVIF image generation, srcset, responsive images, remove sprite crops | M3 | DONE | bf8902d5-159a-429a-92f9-d7e8efcc9c9b |
| 7 | Final E2E & Hardening (M6) | Pass all E2E tests, write Tier 5 adversarial tests, verify audits | M4, M5, M1 | DONE | 5835f5a7-d55b-44ac-9ca6-5de3411efc59 |
| 8 | Order Tracking & Edge Lookup (M7) | Full Order Tracking UI, route /orders/track, confirmation deep link, Cloudflare D1 lookup by id/token | M2, M3, M6 | DONE | 8a6c77f4-8e43-4e04-9e49-f109275ce69e |

## Backend Status (live edge active)

The EmDash CMS backend deployed to Cloudflare Workers (`https://allbirds-emdash-backend.worldnew.workers.dev`) actively serves all 6 content API routes backed by Cloudflare D1 (`hero-blocks`, `categories`, `products`, `materials`, `reviews`, `promo-tiles`) along with the orders subsystem (`POST /api/orders`, `GET /api/orders/lookup`). The frontend client (`src/utils/cms-client/`) consumes these live edge endpoints dynamically with an in-memory caching layer and a resilient 4000ms timeout fallback to local mock data (`src/data/allbirds-data.ts`).

## Interface Contracts
### CMS Collections & Fields
1. `heroBlocks`: `headline`, `body`, `ctaLabel`, `media` (relation to Media), `themeSwatch`
2. `categories`: `name`, `slug`, `cta`, `swatch`, `image` (relation to Media)
3. `products`: `name`, `price`, `colorways` (array of: color name, swatch color, image relation to Media), `fit`, `rating`, `tags` (array), `category` (relation to Categories), `sizes` (array of numbers)
4. `materials`: `name`, `impactNote`, `textureImage` (relation to Media), `sourceRegion`
5. `reviews`: `product` (relation to Products), `quote`, `customerName`, `detail`
6. `promoTiles`: `title`, `swatch`, `image` (relation to Media)
7. `orders`: `id` (UUID), `order_token` (UUID), `email`, `shipping_name`, `shipping_address`, `shipping_city`, `shipping_state`, `shipping_zip`, `items` (JSON), `subtotal`, `tax`, `shipping`, `total`, `status` (pending | processing | shipped | delivered), `payment_method`, `payment_status` (paid | unpaid)

### CMS API Endpoint Responses (live edge active)
- `GET /api/hero-blocks` -> JSON list of hero blocks.
- `GET /api/categories` -> JSON list of categories.
- `GET /api/products` -> JSON list of products with colorways, sizes, ratings.
- `GET /api/promo-tiles` -> JSON list of promotion tiles.
- `GET /api/materials` -> JSON list of materials.
- `GET /api/reviews` -> JSON list of reviews.
- `POST /api/orders` -> Creates an order in Cloudflare D1 database.
- `GET /api/orders/lookup?email=...&token=...` or `?email=...&id=...` -> Looks up order by customer email and either public order ID or private order token.
