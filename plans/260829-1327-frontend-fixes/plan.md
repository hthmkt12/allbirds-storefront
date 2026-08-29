---
title: "Frontend & UI/UX Fixes — Responsive PDP, Size Selection, A11y, Performance"
description: "Four targeted fixes: PDP responsive grid, hardcoded size removal, SizeGuideModal focus trap, contrast/alert cleanup and N+1 guard."
status: pending
priority: P2
effort: 3h
branch: hthmkt12/catfish
tags: [frontend, a11y, responsive, performance]
created: 2026-08-29
---

# Frontend & UI/UX Fixes

## Scope

Four independent fixes. Each scoped to a single concern. No new abstractions introduced.

---

## Phase 1 — Responsive PDP Grid

**Goal:** move inline grid styles on `.pdp-container` (`:141`) into CSS; add mobile breakpoint at `<920px`.

### Files

| File | Change |
|---|---|
| `src/components/product-detail-view.tsx:141` | Remove `style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"40px", maxWidth:"1200px", margin:"0 auto", padding:"0 20px" }}` from the div |
| `src/styles.css` | Add `.pdp-container` rule + `@media (max-width:920px)` override |

### CSS to add (append after existing `@media (max-width:920px)` block at line 269)

```css
/* PDP two-column layout */
.pdp-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

@media (max-width: 920px) {
  .pdp-container {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 0 16px;
  }
}
```

### Acceptance criteria

- `npm run build` passes (TypeScript + Vite).
- No inline `style` grid props on `.pdp-container` element.
- Vitest snapshot / DOM test: render `ProductDetailView` at viewport width 800 — `.pdp-container` receives single-column class (CSS class present in DOM).
- Playwright: navigate `/products/:slug`, resize viewport to 600px wide — gallery and info columns stack vertically (gallery above info).

---

## Phase 2 — Dynamic Size Selection from Wishlist & Cart Recommendations

**Goal:** remove hardcoded `size: 9` in `wishlist-drawer.tsx:80` and `size: 8` in `cart-drawer.tsx:116,221`. "Add to Bag" from these surfaces must navigate to PDP (where user picks size) instead of silently injecting a wrong size.

### Decision

Navigating to PDP is the correct UX — user selects size there before adding to cart. This matches Allbirds' real flow and avoids introducing a size-picker UI inside the drawer (YAGNI).

### Files

| File | Line | Change |
|---|---|---|
| `src/components/wishlist-drawer.tsx` | 76–84 | "Move to Bag" button: replace `onAddToCart(...)` call with `onNavigate(\`/products/${encodeURIComponent(item.name)}\`)` + close drawer via `onClose()`. Remove hardcoded `size:9`. |
| `src/components/wishlist-drawer.tsx` | 10 | Ensure `onNavigate` is in `WishlistDrawerProps` — **already present** (`:11`). |
| `src/components/cart-drawer.tsx` | 110–123, 215–228 | Both "Add to Bag" buttons on recommended items: replace `onAddToCart(...)` + hardcoded `size:8` with `onNavigate(\`/products/${encodeURIComponent(prod.name)}\`)` + `onClose()`. |
| `src/components/cart-drawer.tsx` | 17–25 | `onAddToCart` prop may become unused — verify; remove prop if no longer called anywhere in this file. |

**Note on `WishlistDrawerProps.onNavigate`:** `onNavigate` is declared in the interface (`:11`) but **not destructured** from props (`:20` destructures only `isOpen, onClose, wishlist, onRemoveItem, onAddToCart`). Add `onNavigate` to destructure list.

**Note on `CartDrawer`:** `onNavigate` is already destructured (`:33`). No interface change needed. After removing the two `onAddToCart` calls in recommended sections, check if `onAddToCart` is called anywhere else in the file — it is NOT (only the two recommendation blocks). Remove the prop from `CartDrawerProps` interface and the destructure unless callers still pass it.

> Callers check required before removing prop — search `cart-drawer` usage in `src/`.

### Acceptance criteria

- No `size: 8` or `size: 9` literals remain in wishlist-drawer or cart-drawer.
- Clicking "Move to Bag" (wishlist) closes drawer and navigates to `/products/<name>`.
- Clicking "Add to Bag" on a recommended item (cart) closes drawer and navigates to `/products/<name>`.
- Vitest: mock `onNavigate`, click "Move to Bag" → assert `onNavigate` called with `/products/...`; assert `onAddToCart` NOT called.
- `npm run build` passes.

---

## Phase 3 — A11y: Focus Trap + Escape Handler for SizeGuideModal; Contrast Fix in AccountDrawer

### 3a — SizeGuideModal focus trap & Escape key

**File:** `src/components/size-guide-modal.tsx`

**Current state:** modal rendered via `if (!isOpen) return null`. No focus management. Overlay click closes. No Escape key handler.

**Changes:**

1. Add `useEffect` + `useRef` to trap focus within `.size-guide-modal` when open:
   - On open: focus first focusable element inside modal (the Close button).
   - On Tab/Shift+Tab: cycle within modal's focusable elements.
   - On Escape: call `onClose()`.
2. Move `role="dialog" aria-label aria-modal` from the overlay `div` to the inner `.size-guide-modal` div (correct ARIA placement — dialog role should be on the modal panel, not the backdrop).

Implementation pattern (reuse existing `useDrawerA11y` hook if it already handles focus trap — **check first**):
<br>
`src/utils/use-drawer-a11y.ts` — existing hook. Read it to determine if it can be reused for a modal or if a small inline `useEffect` is simpler.

**File:** `src/utils/use-drawer-a11y.ts` — read before implementing.

### 3b — Contrast fix: `#5cb85c` in AccountDrawer

**File:** `src/components/account-drawer.tsx:112`

```tsx
color: order.status === "delivered" ? "#5cb85c" : "var(--charcoal)"
```

`#5cb85c` (Bootstrap-era green) on white background: contrast ratio ≈ 2.9:1 — fails WCAG AA (4.5:1 for normal text).

**Fix:** replace with `#2d7a2d` (contrast ratio ≈ 5.1:1 on white — passes AA).

Check: is `#5cb85c` used elsewhere?

```
Grep pattern="#5cb85c" path=src/
```

If only this one instance, replace inline. If more, add CSS variable `--status-delivered: #2d7a2d` to `src/styles.css` and reference via `var(--status-delivered)`.

### Acceptance criteria (Phase 3)

- Vitest: open `SizeGuideModal`, press Escape → `onClose` called.
- Vitest: Tab key cycles only within modal (focus does not leave panel).
- axe-core / jest-axe: no contrast failures on order status badge.
- `npm run build` passes.

---

## Phase 4 — Client Performance & Storage: Replace alert(); N+1 guard

### 4a — Replace `alert()` with inline error notice

Two call sites:

| File | Line | Current | Fix |
|---|---|---|---|
| `src/components/account-drawer.tsx` | 55 | `alert("Please enter a valid email address")` | Add `const [emailError, setEmailError] = useState<string|null>(null)` state; set it instead of `alert()`; render `<p role="alert">` below the input. |
| `src/components/checkout/checkout-view.tsx` | 199 | `alert("Error placing order. Please try again.")` | Add error state; render inline `<p role="alert">` below the QR confirm button. |

Both states clear on successful action or on next input change.

### 4b — N+1 guard in order lookup

**File:** `src/utils/cms-client/orders.ts:63–74`

Current: sequential `for` loop — one `fetchWithTimeout` per token. If user has N orders, N serial HTTP requests fire.

**Fix:** replace serial loop with `Promise.all`:

```ts
const results = await Promise.all(
  tokens.map(async (token) => {
    try {
      const res = await fetchWithTimeout(
        `${CMS_BASE_URL}/api/orders/lookup?email=${encodeURIComponent(cleanEmail)}&token=${encodeURIComponent(token)}`,
      );
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return Array.isArray(data?.docs) ? (data.docs as CmsOrder[]) : [];
    } catch (err) {
      console.warn(`Order lookup failed for token ${token}, keeping local copy`, err);
      return [];
    }
  }),
);
const refreshed: CmsOrder[] = results.flat();
```

This is safe: lookups are independent reads with no ordering dependency.

**Mock data cleanup:** `getOrders` returns a hardcoded mock order when `combined.length === 0` (`:86–114`). Per `coding.C1`: "Never fabricate mock/fixture data as a runtime fallback for a missing dependency." The backend may genuinely return empty — this mock hides that. **Remove the mock fallback block** and return `[]` instead.

> Verify this mock was intentional for dev visibility (commit message `7f0e9da` notes "project is mock-first; backend content APIs not yet served") — the `getOrders` mock may be intentional given the project's current state. **Flag as decision point: leave mock or remove it?**

### Acceptance criteria (Phase 4)

- No `alert(` calls remain in `src/`.
- Vitest: submit invalid email in AccountDrawer → `<p role="alert">` rendered, no `window.alert` called.
- Vitest: `getOrders` with 3 tokens → `fetchWithTimeout` called 3 times in parallel (spy on fetch, check concurrent invocation).
- `npm run build` passes.

---

## File Ownership (no conflicts between phases)

| Phase | Files owned |
|---|---|
| 1 | `src/components/product-detail-view.tsx`, `src/styles.css` |
| 2 | `src/components/wishlist-drawer.tsx`, `src/components/cart-drawer.tsx` |
| 3 | `src/components/size-guide-modal.tsx`, `src/components/account-drawer.tsx`, `src/styles.css` (CSS var only if needed) |
| 4 | `src/components/account-drawer.tsx`, `src/components/checkout/checkout-view.tsx`, `src/utils/cms-client/orders.ts` |

**Conflict:** Phase 3 and Phase 4 both touch `account-drawer.tsx`. Must be implemented sequentially or in the same pass.

---

## Dependency Order

```
Phase 1  (standalone)
Phase 2  (standalone)
Phase 3a (standalone)
Phase 3b + Phase 4a  → same file, implement together in one pass on account-drawer.tsx
Phase 4b (standalone)
```

---

## Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PDP CSS specificity collision with existing `.pdp-container` inline styles | Low | Low | Inline style removed; class rule is sole owner. |
| Removing `onAddToCart` from `CartDrawerProps` breaks a caller | Medium | High | Grep all call sites in `src/` before removing prop. |
| Focus trap conflicts with existing `useDrawerA11y` hook | Low | Medium | Read hook first; reuse if compatible, else small inline effect. |
| `Promise.all` on order lookup: one failed fetch throws and rejects all | Low | Medium | Each token wrapped in individual try/catch returning `[]` on failure. |
| Mock order removal breaks dev flow | Medium | Low | Flagged as decision point above; do not remove unless confirmed. |

---

## Test Matrix

| Fix | Unit (Vitest) | Integration | E2E (Playwright) |
|---|---|---|---|
| PDP responsive grid | DOM render at 800px — class check | — | Viewport 600px — stack check |
| Hardcoded size removal | onNavigate called; onAddToCart not called | — | Click "Move to Bag" → PDP route |
| SizeGuideModal Escape | onClose called on Escape key | — | — |
| Focus trap | Tab cycles within modal | — | — |
| Contrast fix | jest-axe no failures | — | — |
| alert() → inline notice | window.alert not called; role="alert" renders | — | — |
| Promise.all order lookup | fetch spy concurrent calls | — | — |

---

## Rollback

All changes are stateless UI edits with no DB migration or external side effects. Revert via `git revert` per commit. No user data is affected.

---

## Unresolved Questions

1. **Mock order removal (orders.ts:86–114):** commit `7f0e9da` marks project as mock-first. Should the `getOrders` empty-state mock remain until real backend is served? Recommend: keep it until Phase 1 of `plan-backend-emdash` ships the `/api/orders/lookup` endpoint.
2. **`onAddToCart` prop removal from `CartDrawer`:** need to grep all call sites in `src/` to confirm the prop is safe to remove. If callers still pass it, removing causes a TypeScript error. Implementer must verify before removing.
3. **`useDrawerA11y` reuse for modal:** the hook was written for drawer panels. Check if it handles the Tab-cycle focus trap or only Escape + initial focus. If not, a small 20-line inline `useEffect` is sufficient.
