---
phase: 2
title: Storefront Navigation And PLP
status: in-progress
priority: P1
effort: 4h
dependencies:
  - 1
---

# Phase 2: Storefront Navigation And PLP

## Overview

Build a real collection browsing experience: routeable Men/Women/Sale/Best Sellers/New Arrivals views, PLP hero, product count, filter/sort controls, and product cards that all support quick add.

## Requirements
- Functional: routes update URL; filters include audience, size, color, price, product type/material; sort supports featured, price low/high, rating, newest.
- Non-functional: no horizontal overflow, 44px touch targets, accessible controls, no dead nav links.

## Architecture
Keep routing in React state/history unless adding a router becomes clearly cheaper. Derive filter options from loaded products and category fields. Keep product data in one fetched collection state to avoid duplicate API calls.

## Related Code Files
- Modify: `src/App.tsx`
- Modify: `src/components/header-hero.tsx`
- Modify: `src/components/commerce-sections.tsx`
- Modify: `src/components/storefront-sections.tsx`
- Modify: `src/styles.css`
- Possibly create: `src/components/product-listing-page.tsx`, `src/components/product-card.tsx`, `src/components/filter-sort-bar.tsx`

## Implementation Steps

1. Extract product grid/card/filter concerns from `commerce-sections.tsx` if needed to keep files readable.
2. Add route state for `/collections/:slug` style paths while preserving home anchors.
3. Implement PLP hero and breadcrumb inspired by Allbirds but using local assets/content.
4. Add filter drawer/bar with size, color, price, material/type.
5. Add sort menu and visible product count.
6. Make every product card support color selection, size selection, and quick add.
7. Update mobile nav to use a compact menu rather than cramped full nav.

## Success Criteria

- [ ] `/collections/mens`, `/collections/womens`, `/collections/sale`, `/collections/best-sellers`, `/collections/new-arrivals` render useful PLP views.
- [ ] Filtering changes visible product count and grid.
- [ ] Sorting reorders grid deterministically.
- [ ] Every product card can add selected size/color to cart.
- [ ] Mobile viewport has no horizontal overflow.

## Risk Assessment
Product schema may lack enough fields for filters. Start with derived/optional fields and align Phase 4 schema after UI contract is proven.
