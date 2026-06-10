# Project Execution Plan - Allbirds CMS & Storefront Flow

## Objective
Implement local Payload CMS integration (R1), Product Details & Cart Flow (R2), Asset & Performance Polish (R3), and Accessible Design & Brand Depth (R4).

## Dual-Track Execution Strategy
We run two tracks in parallel:
1. **E2E Testing Track**: Build E2E test infra, write Tier 1-4 tests, publish `TEST_READY.md`.
2. **Implementation Track**: Sequential implementation of milestones:
   - Milestone 1: Local Payload CMS setup (SQLite, 6 collections, seeded data).
   - Milestone 2: Storefront API Integration (fetch dynamic data from CMS).
   - Milestone 3: PDP & Cart Drawer (selectors, cart drawer CRUD, calculations).
   - Milestone 4: Brand Pages & Accessibility (collections filter, story pages, keyboard navigation/skip link).
   - Milestone 5: Performance Polish (WebP/AVIF images, srcset, remove sprite crops).
   - Milestone 6: Final Verification & Hardening (pass 100% E2E tests, write Tier 5 adversarial tests, verify audits).

## Step-by-Step Schedule & Verifications

### Step 1: Initialize Tracks
- **Action**: Spawn E2E Testing Orchestrator to begin test planning and E2E test case implementation.
- **Action**: Spawn CMS Setup Sub-Orchestrator to begin Milestone 1.
- **Verification**: `e2e-tests/` directory scaffolded; `payload-cms/` directory scaffolded with sqlite database.

### Step 2: E2E Test Suite and CMS Setup Completion
- **Action**: Monitor E2E Testing Orchestrator until `TEST_READY.md` is published.
- **Action**: Monitor CMS Setup Sub-Orchestrator until CMS endpoints are live and seeded.
- **Verification**: `TEST_READY.md` exists and details test runner command. Payload API endpoints returning data successfully.

### Step 3: Frontend API Integration
- **Action**: Spawn Sub-Orchestrator to replace static mock arrays with API fetches.
- **Verification**: Storefront builds and runs, displaying content loaded from CMS API.

### Step 4: PDP & Cart Drawer Implementation
- **Action**: Spawn Sub-Orchestrator to implement product detail selectors and interactive side-out Cart Drawer.
- **Verification**: Sizes and colors selector works, adding items opens drawer, prices update correctly.

### Step 5: Brand Pages, Filters & Accessibility
- **Action**: Spawn Sub-Orchestrator to add collection pages, brand story pages, and perform accessibility pass.
- **Verification**: Collection pages filter correctly, skip link works, keyboard focus works, no keyboard traps.

### Step 6: Asset & Performance Polish
- **Action**: Spawn Sub-Orchestrator to convert images to WebP/AVIF, implement responsive images, and remove sprite crops.
- **Verification**: Assets optimized, pages load fast, no sprites used.

### Step 7: Final E2E Test Pass and Hardening
- **Action**: Run the complete E2E test suite.
- **Action**: Spawn Challengers to write Tier 5 adversarial test cases and find remaining bugs.
- **Action**: Spawn Forensic Auditor to verify integrity of code.
- **Verification**: E2E test suite reports 100% pass rate. Forensic Auditor verdict is CLEAN.
