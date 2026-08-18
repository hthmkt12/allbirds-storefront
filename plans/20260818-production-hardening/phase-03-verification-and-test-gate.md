# Phase 03: Verification & Test Suite Gate

## Objective
Verify all changes across unit, build, and E2E tiers without regressions.

## Implementation Steps
1. **Frontend & CMS Build Verification**:
   - `npm run build` (Storefront: `tsc -b && vite build`)
   - `npm run build` inside `payload-cms/`
2. **Vitest Unit Tests**:
   - `npm test -- --run`
3. **Playwright E2E Tests**:
   - Run checkout & tier 5 adversarial specs to verify order flow:
     `npx playwright test e2e-tests/tests/tier4-journeys.spec.ts e2e-tests/tests/tier5-adversarial.spec.ts`

## Acceptance Gate
- Zero compilation / type errors.
- All unit & E2E tests passing.
- Update `docs/common-issues.md` if any fixes or edge cases were resolved.
