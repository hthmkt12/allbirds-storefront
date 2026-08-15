---
title: Hardening Phase — CMS Types, Orders Access, Git Hygiene
description: >-
  Fix stale Payload generated types (Order payment fields, Products afterRead
  shape), lock down Orders update/delete access, add automatic product slug
  generation, and clean up repo hygiene (.agents/.claude gitignore), then
  refactor oversized frontend files (checkout-view modularization + size guide
  dedupe) and round out a11y/E2E gaps.
status: completed
priority: P1
branch: master
tags: []
blockedBy: []
blocks: []
created: '2026-08-15T00:00:00.000Z'
createdBy: 'ck:plan'
source: skill
---

# Hardening Phase — Allbirds Storefront

## Overview

Executed after a full project-state analysis (scout/code-review/watzup). The
storefront, CMS, and E2E suite all build and pass; this phase removes technical
debt that will bite later work: stale CMS generated types, open Orders
write-access, missing product slugs, oversized frontend files, duplicated UI
logic, and missing a11y + E2E coverage.

Priority groups (executed in order):
- **Group A (critical/housekeeping)** — CMS types + Orders access + slug hook + gitignore/docs.
- **Group B (frontend refactor)** — modularize checkout-view, extract constants, dedupe size-guide modal.
- **Group C (a11y + E2E)** — skip link, drawer focus trap, E2E helpers, missing coverage.

## Phase Status

| Phase | Name | Status |
|-------|------|--------|
| 1 | [CMS Types & Orders Access & Slugs](./phase-01-cms-hardening.md) | Completed |
| 2 | [Git Hygiene & Docs](./phase-02-git-hygiene-docs.md) | Completed |
| 3 | [Frontend Refactor — Checkout Modular + Size Guide Dedupe](./phase-03-frontend-refactor.md) | Completed |
| 4 | [A11y — Skip Link & Drawer Focus Trap](./phase-04-a11y.md) | Completed |
| 5 | [E2E Helpers & Missing Coverage](./phase-05-e2e.md) | Completed |

## Dependencies

- `payload-cms/src/collections/Orders.ts`, `Products.ts`, `Media.ts`
- `payload-cms/src/payload-types.ts` (regenerated)
- `src/components/checkout-view.tsx`, `commerce-sections.tsx`, `product-listing-page.tsx`, `product-detail-view.tsx`, `src/utils/cms-client.ts`
- `src/styles.css`, `src/App.tsx`, `src/components/header-hero.tsx`
- `e2e-tests/tests/*`

## Acceptance Gates

- Root `npm run build` passes with zero errors after each phase.
- `cd payload-cms && npm run build` compiles cleanly after CMS changes.
- Generated `payload-types.ts` includes `paymentMethod`/`paymentStatus` on `Order`.
- Orders collection denies update/delete to anonymous clients.
- Products auto-generate `slug` from `name` when left empty (both API and seed).
- `git status` clean of `.agents/` / `.claude/` noise.
- Desktop and 390px mobile screenshots show no horizontal overflow regression.
- Existing E2E suite still green (chromium at minimum) at the end.

## Out Of Scope

- Real payment provider, real auth, real inventory.
- Router rewrite, new test framework, new features beyond hardening.
- Rewriting `payload-types.ts` by hand — always regenerate.
