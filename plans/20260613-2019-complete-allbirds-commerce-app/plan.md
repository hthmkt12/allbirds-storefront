---
title: Complete Allbirds Commerce App
description: >-
  Turn the current CMS-fed Allbirds storefront prototype into a complete local
  commerce app with PLP, PDP, cart, checkout, search, and backend catalog/order
  support.
status: in-progress
priority: P2
branch: master
tags: []
blockedBy: []
blocks: []
created: '2026-06-13T13:19:44.610Z'
createdBy: 'ck:plan'
source: skill
---

# Complete Allbirds Commerce App

## Overview

Complete the app in practical e-commerce layers. Do not clone every Allbirds/Shopify feature. Ship the missing shopper use cases that matter: browse, filter, inspect, add, cart edit, checkout, search, and CMS-backed catalog/content.

Reference inputs:
- Live Allbirds home, men's PLP, and sustainability pages checked on 2026-06-13.
- Brainstorm report: `../reports/brainstorm-20260613-allbirds-completion.md`
- Reference screenshots: `../reports/allbirds-reference-screenshots/`
- Local baseline screenshots: `../reports/local-baseline-screenshots/`

Key decision: keep the current React/Vite + Payload CMS architecture. Add only the backend data needed by visible storefront flows. No real payment, no full auth.

## Phases

| Phase | Name | Status |
|-------|------|--------|
| 1 | [Reference Research](./phase-01-reference-research.md) | Completed |
| 2 | [Storefront Navigation And PLP](./phase-02-storefront-navigation-and-plp.md) | In Progress |
| 3 | [Product Detail Cart And Checkout](./phase-03-product-detail-cart-and-checkout.md) | Pending |
| 4 | [CMS Backend Commerce Data](./phase-04-cms-backend-commerce-data.md) | Pending |
| 5 | [Search Account Help And Geo UX](./phase-05-search-account-help-and-geo-ux.md) | Pending |
| 6 | [Testing Documentation And Hardening](./phase-06-testing-documentation-and-hardening.md) | Pending |

## Dependencies

- `README.md`, `PROJECT.md`, `ORIGINAL_REQUEST.md`
- `src/App.tsx`, `src/components/*`, `src/utils/cms-client.ts`, `src/styles.css`
- `payload-cms/src/collections/*`, `payload-cms/src/seed.ts`
- `e2e-tests/tests/*`

## Acceptance Gates

- `npm run build` passes after each implementation phase.
- Payload CMS build/seed still works after backend schema changes.
- Desktop and 390px mobile screenshots show no broken layout or horizontal overflow.
- E2E coverage updated for new PLP/PDP/cart/checkout/search flows.

## Out Of Scope

- Real payment provider.
- Real customer auth/session backend.
- Full inventory reservation.
- Exact pixel clone of allbirds.com.
