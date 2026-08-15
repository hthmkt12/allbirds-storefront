---
phase: 5
title: E2E Helpers & Missing Coverage
status: completed
priority: P2
effort: 3h
dependencies:
  - 4
---

# Phase 5 — E2E Helpers & Missing Coverage

## Context / Problem

- No shared test helpers; `setupCheckout(page)` duplicated in f7/f8/tier3/tier4 and add-to-cart flows repeated.
- Zero coverage: `help-drawer.tsx`, `filter-sort-bar.tsx`, and functional PLP (`product-listing-page.tsx` only gets screenshot-only paths).
- Suite intentionally tuned to offline/fallback path (mock counts) — document this to avoid future confusion.

## Tasks

1. **Shared helper module** — create `e2e-tests/helpers.ts`
   - `addFirstProductToCart(page)` (shared flow), `setupCheckout(page)` (extract from f8), `assertNoHorizontalOverflow(page)` (extract from screenshots.spec.ts), `seedCart(page, items)` (addInitScript pattern from tier5/f2-challenger).
   - Refactor existing specs to import from helpers where the duplication is identical. Surgical — do not rewrite whole specs.

2. **New coverage — help drawer**
   - New `e2e-tests/tests/f9-help-drawer.spec.ts`: open Help via header button, assert FAQ sections render, Escape + close button close, mobile 390px no overflow.

3. **New coverage — PLP functional**
   - Extend or add `e2e-tests/tests/f10-plp.spec.ts`: navigate `/collections/mens`, assert product grid count, filter panel open/apply (sort by price low->high), clear filters. Base expectations on fallback mock data counts used elsewhere (8 products, 4 categories).

4. **Doc note** — comment in playwright.config.ts or helpers.ts that the suite is tuned to offline fallback; no behavior change.

## Verification

- New specs pass on chromium (and mobile projects if deterministic).
- Full chromium suite passes; no regressions in existing specs after helper refactor.
- `npx playwright test -c e2e-tests/playwright.config.ts --project=chromium --workers=1` green.

## Risks / Rollback

- Filter/sort interactions may be brittle (role=listbox without arrow-key support). Assert on visible outcome (rendered product order/grid) rather than aria internals.
- Helper refactor must be identical behavior; verify each touched spec before moving on.
