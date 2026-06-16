---
phase: 4
title: "CMS Backend Commerce Data"
status: pending
priority: P2
effort: "4h"
dependencies: [2, 3]
---

# Phase 4: CMS Backend Commerce Data

## Overview

Extend Payload CMS only where storefront use cases require backend data: richer products, collection metadata, optional order capture, and seed data matching filters/PDP.

## Requirements
- Functional: CMS product data supports PLP filters, PDP details, colorways, badges, stock/availability, sale prices where needed.
- Non-functional: SQLite remains portable; public read stays safe; no secrets in repo.

## Architecture
Keep Payload public read for catalog/content. Add optional `orders` collection for simulated checkout if frontend needs persistence. Do not add real auth/payment.

## Related Code Files
- Modify: `payload-cms/src/collections/Products.ts`
- Modify: `payload-cms/src/collections/Categories.ts`
- Modify: `payload-cms/src/payload.config.ts`
- Modify: `payload-cms/src/seed.ts`
- Modify: `src/utils/cms-client.ts`
- Possibly create: `payload-cms/src/collections/Orders.ts`

## Implementation Steps

1. Add product fields only if needed by UI: slug, description, productType, material, gender/audience, salePrice, badge, inventoryBySize, gallery.
2. Add category/collection fields for route slug, hero copy, hero image, sort priority.
3. Add order collection only for simulated checkout persistence.
4. Update seed data to include varied filters and enough product rows for PLP tests.
5. Update CMS client interfaces and mapping/fallbacks.
6. Run Payload seed/build and storefront build.

## Success Criteria

- [ ] Payload seed creates products with filter/PDP fields.
- [ ] Storefront fetches enriched product/category data with fallback compatibility.
- [ ] CMS offline fallback still works.
- [ ] `npm run build` in root passes.
- [ ] `npm run build` in `payload-cms/` passes after schema changes.

## Risk Assessment
Payload schema changes can break seed/build. Mitigation: update seed and client together; keep optional fields backward compatible.
