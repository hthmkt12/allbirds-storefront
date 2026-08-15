---
phase: 4
title: A11y — Skip Link & Drawer Focus Trap
status: completed
priority: P1
effort: 2h
dependencies:
  - 3
---

# Phase 4 — A11y Hardening

## Context / Problem

Scout + review found real gaps despite f6 passing:
- No skip link / "Skip to content"; nav has no target `<main>`.
- Drawers (`role="dialog"` + `aria-label` on cart, account, help, search) lack `aria-modal` and **no focus trap** — focus is not moved in or restored on close.
- Hero audience tabs use `role="tablist"`/`role="tab"` but no `tabpanel`/`aria-controls`, no arrow-key nav.

## Tasks (surgical, test-preserving)

1. **Skip link**
   - In `SiteHeader` (header-hero.tsx) add a visually-hidden skip link `a.skip-link[href="#main-content"]` before nav.
   - Add `id="main-content"` + `tabIndex={-1}` to the page `<main>` wrapper in `App.tsx`; visible-on-focus CSS in `styles.css`.
   - Do not collide with existing `sr-only` utility; reuse it.

2. **Drawer focus trap + aria-modal**
   - Scope: carts/account/help drawers + search dialog. Implement a minimal shared hook `src/utils/use-drawer-a11y.ts`:
     - On open: save `document.activeElement`, focus first focusable inside panel, add `aria-modal="true"`.
     - Trap Tab/Shift+Tab within the panel.
     - On close: restore focus, remove `aria-modal`.
   - Wire into `cart-drawer.tsx`, `account-drawer.tsx`, `help-drawer.tsx`, `search-dialog.tsx`. Keep all existing close gestures (overlay click, Escape, close button).

3. **Hero tabs (audience selector)**
   - Add `aria-controls` pointing to a `tabpanel` wrapping the audience content; minimal `role="tabpanel"` + `aria-labelledby`. Arrow-key navigation only if low-risk; otherwise stop after correct `tab`/`tabpanel` wiring to avoid breaking f1/tier3 selectors.

## Verification

- Keyboard-only check via Playwright: Tab reaches skip link, navigating highlights it; opening drawers traps focus; Escape closes and returns focus to the opener.
- E2E `f6-accessibility.spec.ts` + `f2-cart-drawer.spec.ts` + `f7` (close gestures) stay green.
- `npm run build` passes.

## Risks / Rollback

- Focus trap can break existing tests that click elements behind the drawer overlay. If so, keep the trap but ensure overlay click (outside) still closes. Monitor f2/f7.
- Do not change any selector text/aria-label used by E2E.
