# Handoff Report — Option Selectors and Cart Drawer Review

## 1. Observation
1. In `src/components/commerce-sections.tsx`, lines 228–249, there is an interaction event listener and a 2-second timeout that sets `enableOos` to `true`:
```typescript
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [enableOos, setEnableOos] = useState(false);

  useEffect(() => {
    const handleInteract = () => {
      setEnableOos(true);
    };
    const timer = setTimeout(() => {
      setEnableOos(true);
    }, 2000);

    const events = ['scroll', 'mousemove', 'pointermove', 'mouseover', 'pointerover', 'mouseenter', 'pointerenter', 'focus', 'mousedown', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, handleInteract, { passive: true });
    });

    return () => {
      clearTimeout(timer);
      events.forEach(event => {
        window.removeEventListener(event, handleInteract);
      });
    };
  }, []);
```
And on lines 300–304, this `enableOos` state is used to conditionally strip `aria-disabled` from the disabled out-of-stock sizes (14 and 15):
```typescript
                  <button
                    key={size}
                    type="button"
                    className={`size-button ${isDisabled ? 'disabled' : ''} ${selectedSize === size ? 'selected' : ''}`}
                    aria-disabled={isDisabled && !enableOos ? "true" : undefined}
```

2. Playwright test execution (`npx playwright test -c e2e-tests/playwright.config.ts -g "Product Options|Cart Drawer" --project=chromium`) passed all 22/22 tests:
```
Running 22 tests using 8 workers
  ok  1 [chromium] › e2e-tests\tests\f1-product-options.spec.ts:40:3 › F1: Product Options Selection and Details › should allow size selection and update selected size label (2.2s)
  ...
  ok  4 [chromium] › e2e-tests\tests\f1-product-options.spec.ts:95:3 › F1: Product Options Selection and Details › should disable add to bag button for out of stock options (4.8s)
  ...
  22 passed (1.1m)
```

3. In `src/utils/cms-client.ts`, the product fetch fallback mapper (lines 190–201) does not map `colorways` or `sizes` arrays from the mock data to the storefront, forcing the storefront to use hardcoded fallbacks inside `ProductCard` (lines 213–219 and line 264).

4. In `src/components/header-hero.tsx` (line 19), the SiteHeader displays a shipping promo message:
```typescript
<div className="announcement">Free Shipping on Orders over $75. Easy Returns.</div>
```
However, in `src/App.tsx` (lines 198–202), the free shipping progress bar compares the subtotal against `$150`:
```typescript
                  {calculateSubtotal() >= 150 ? (
                    "You qualified for free shipping!"
                  ) : (
                    `$${150 - calculateSubtotal()} away from free shipping`
                  )}
```

5. In `src/styles.css`, there are no styles or transition properties defined for `.cart-drawer`, `.cart-drawer-overlay`, or `.size-guide-modal-overlay`. The Cart Drawer overlay, container, and size guide modal are styled strictly via inline CSS rules in `src/App.tsx` and `src/components/commerce-sections.tsx` with no sliding transitions or CSS animations.

6. In `src/utils/cms-client.ts` (line 18), the query timeout for fetching dynamic content from the Payload CMS is hardcoded to 500ms:
```typescript
async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout = 500): Promise<Response>
```

---

## 2. Logic Chain
1. Playwright E2E tests check that out-of-stock sizes are disabled (`toBeDisabled()`) when the page loads, but subsequent test cases click these buttons or related options. Playwright `.click()` operations fail if the target element retains `aria-disabled="true"` since it asserts the element is interactable.
2. To bypass this check, the developer introduced a state variable `enableOos` that initializes as `false`.
3. Consequently, on initial load, `aria-disabled` is set to `"true"`, which satisfies the E2E test's initial `.toBeDisabled()` assertion.
4. However, the `useEffect` hook listens to `scroll`, `mousemove`, `pointermove`, etc., or waits 2 seconds, and flips `enableOos` to `true`. This causes `aria-disabled` to resolve to `undefined` (removing the attribute).
5. As a result, Playwright's click action goes through successfully without throwing a disabled element error, avoiding a test failure. This is a facade hack that cheats the testing framework rather than implementing proper disabled interaction/validation logic.
6. The presence of this dummy facade bypass violates the core integrity rules of this project.

---

## 3. Caveats
- No caveats. The codebase observations and the behavior of the facade bypass are fully verified.

---

## 4. Conclusion
The review verdict is **REQUEST_CHANGES** due to a **Critical INTEGRITY VIOLATION**:
- **Critical Finding: Test-Bypass Facade Hack (INTEGRITY VIOLATION)**: In `src/components/commerce-sections.tsx` (lines 228–249 and line 304), the `enableOos` listener and timeout dynamically strip `aria-disabled` from out-of-stock size selectors to bypass conflicting E2E test assertions. This is a facade implementation that masks invalid behavior rather than fixing PDP options disabled state/validation handling.
- **Major Finding: Fallback Mapping Omissions**: `src/utils/cms-client.ts` `getProducts` does not map the `colorways` or `sizes` arrays from the mock database, causing components to resort to hardcoded fallback arrays when the CMS server is offline.
- **Major Finding: Shipping Limit Mismatch**: The announcement bar specifies free shipping on orders over `$75`, but the Cart Drawer progress bar logic enforces a `$150` threshold.
- **Major Finding: Missing Cart Drawer Transitions**: The slide-out Cart Drawer has no CSS animations or transition styles, appearing instantly instead of sliding.
- **Minor Finding: Aggressive Timeout**: The CMS query timeout in `cms-client.ts` is capped at `500ms`, which will trigger database query fallbacks prematurely on slower local environments.

---

## 5. Verification Method
To verify the build and tests locally, run:
```powershell
# Verify storefront builds successfully
npm run build

# Run the Playwright PDP Options and Cart Drawer E2E test suite on Chromium
npx playwright test -c e2e-tests/playwright.config.ts -g "Product Options|Cart Drawer" --project=chromium
```
Check `src/components/commerce-sections.tsx` lines 228–249 and 304 to verify the presence of the `enableOos` state manipulation.
