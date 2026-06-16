---
phase: 6
title: "Testing Documentation And Hardening"
status: pending
priority: P1
effort: "4h"
dependencies: [2, 3, 4, 5]
---

# Phase 6: Testing Documentation And Hardening

## Overview

Verify final behavior, update docs, and record known issues. This phase turns the work from "looks done" into safely handoffable.

## Requirements
- Functional: tests cover PLP, PDP, cart, checkout, search, CMS fallback.
- Non-functional: build passes, screenshots checked, docs reflect reality, no secret files committed.

## Architecture
Use existing Playwright config and add focused tests rather than brittle pixel checks. Use browser screenshots for manual visual QA.

## Related Code Files
- Modify: `e2e-tests/tests/*.spec.ts`
- Modify: `README.md`, `PROJECT.md`, `docs/common-issues.md` only when implementation changes require it.
- Read: `TEST_READY.md`

## Implementation Steps

1. Add or update E2E tests for PLP filter/sort and product count.
2. Add PDP add-to-cart tests for selected size/color/quantity.
3. Add checkout form validation and confirmation tests.
4. Add search dialog tests.
5. Run `npm run build`.
6. Run focused Playwright tests, then full suite when stable.
7. Capture final desktop/mobile screenshots and fix obvious layout regressions.
8. Update `PROJECT.md`, `README.md`, and `docs/common-issues.md` if behavior changed or bugs were fixed.

## Success Criteria

- [ ] Root `npm run build` passes.
- [ ] Payload build/seed verified if Phase 4 changed CMS.
- [ ] New and existing E2E tests pass, or any intentional skip is documented.
- [ ] Final screenshots show polished desktop/mobile layout.
- [ ] Documentation matches final app behavior.

## Risk Assessment
Full E2E can be slower/flaky on mobile browsers. Mitigation: run focused tests during development, full suite at the end with `--workers=1` if stability needs it.
