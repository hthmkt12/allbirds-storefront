---
phase: 5
title: "Search Account Help And Geo UX"
status: pending
priority: P2
effort: "3h"
dependencies: [2, 3, 4]
---

# Phase 5: Search Account Help And Geo UX

## Overview

Replace dead controls with useful lightweight UX: search results, account placeholder, help panel, and optional shipping-region modal inspired by Allbirds.

## Requirements
- Functional: search returns products/categories; account/help open meaningful panels; geo modal can set shipping threshold/copy.
- Non-functional: no fake login, no personal data storage beyond local preferences, keyboard dismiss works.

## Architecture
Search runs client-side over fetched products/categories. Account/help are drawers/modals. Shipping region stored in localStorage as display preference only.

## Related Code Files
- Modify: `src/App.tsx`
- Modify: `src/components/header-hero.tsx`
- Modify: `src/styles.css`
- Possibly create: `src/components/search-dialog.tsx`, `src/components/help-drawer.tsx`, `src/components/account-drawer.tsx`, `src/components/shipping-region-dialog.tsx`

## Implementation Steps

1. Replace search input-only modal with result list and empty state.
2. Add keyboard Escape/close and focus return for dialogs.
3. Add account drawer with sign-in placeholder and order lookup placeholder.
4. Add help drawer with contact, returns, shipping FAQ links/content.
5. Add optional shipping region prompt or settings panel; update announcement/free shipping copy from selected region.
6. Ensure no sensitive data persisted.

## Success Criteria

- [ ] Search for known product names returns clickable results.
- [ ] Empty search state is clear and non-broken.
- [ ] Account/help buttons no longer dead-end.
- [ ] Dialogs close via button, overlay, and Escape.
- [ ] Local preference survives reload without storing personal data.

## Risk Assessment
Geo modal can annoy users. Mitigation: make it dismissible and preference-based, not blocking every visit.
