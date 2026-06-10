# Scope: CMS Setup

## Architecture
- **Payload CMS**: Running in `payload-cms/` directory. Exposes REST API endpoints on port 3000 by default (e.g. `http://localhost:3000/api`).
- **Database**: Portable local SQLite database stored at `payload-cms/payload.db`.
- **Media**: Local file storage for media uploads.

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|---|---|---|---|---|
| 1 | Scaffolding | Initialize Payload CMS project using portable SQLite config | None | PLANNED | TBD |
| 2 | Collections | Define 6 collections with relationships (Media, Categories, Products, Materials, Reviews, HeroBlocks, PromoTiles) | M1 | PLANNED | TBD |
| 3 | Seeding | Seed Allbirds-inspired realistic data into SQLite database | M2 | PLANNED | TBD |
| 4 | Verification | Start CMS, check compile, build, run, and query API endpoints | M3 | PLANNED | TBD |

## Interface Contracts
### Payload CMS ↔ Frontend Storefront
All collections must expose REST API endpoints.
- `/api/hero-blocks`: Returns list of hero block configurations.
- `/api/categories`: Returns product categories list.
- `/api/products`: Returns list of products including colorways, sizes, category link, ratings.
- `/api/reviews`: Returns list of reviews linked to products.
- `/api/promo-tiles`: Returns list of promo tiles.
- `/api/materials`: Returns materials list.
- `/api/media`: Returns uploaded media assets details (URLs, etc.).
