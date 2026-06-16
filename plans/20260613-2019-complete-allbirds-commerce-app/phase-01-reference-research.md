---
phase: 1
title: Reference Research
status: completed
priority: P1
effort: 1h
dependencies: []
---

# Phase 1: Reference Research

## Overview

Lock the product direction from live Allbirds research and local baseline. This phase produces the constraints that implementation must follow.

## Requirements
- Functional: document target use cases, gap list, and implementation scope.
- Non-functional: keep scope small, avoid full Shopify clone, keep existing stack.

## Architecture
Research-only phase. Inputs are live Allbirds pages, local screenshots, current source files, and existing docs.

## Related Code Files
- Modify: none.
- Create: `plans/reports/brainstorm-20260613-allbirds-completion.md` already created.
- Read: `README.md`, `PROJECT.md`, `ORIGINAL_REQUEST.md`, `src/App.tsx`, `src/components/*`, `payload-cms/src/collections/*`.

## Implementation Steps

1. Review live Allbirds home, PLP, sustainability, cart/search signals.
2. Capture and save desktop/mobile reference screenshots.
3. Build local app and capture local baseline screenshots.
4. Write usecase/gap report.
5. Confirm scope: practical prototype, not full production Shopify.

## Success Criteria

- [x] Reference screenshots saved.
- [x] Local baseline screenshots saved.
- [x] Brainstorm report written.
- [ ] User approves this plan before code implementation.

## Risk Assessment
Biggest risk is scope creep into payments/auth/inventory. Mitigation: keep those explicitly out of scope.
