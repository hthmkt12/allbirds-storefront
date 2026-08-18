# Plan: Production Hardening, Security & Infrastructure Alignment

- **Status**: Ready
- **Date**: 2026-08-18
- **Goal**: Hardening Payload CMS Orders collection against PII leaks, adding order lookup token mechanism, fixing Docker volume SQLite & uploads paths, enforcing production secret verification.
- **Reference**: `plans/reports/advise-20260818-production-hardening-and-security.md`

---

## Phases

1. [Phase 01: Orders Security & Lookup Token](phase-01-orders-security-and-token.md)
2. [Phase 02: Storage & Docker Alignment](phase-02-storage-and-docker-alignment.md)
3. [Phase 03: Verification & Test Suite Gate](phase-03-verification-and-test-gate.md)

---

## Acceptance Criteria
- [ ] `GET /api/orders` without authenticated CMS admin returns unauthorized / empty array.
- [ ] Orders created by Storefront contain auto-generated `orderToken`.
- [ ] Storefront checkout flow completes successfully and saves `orderToken` locally for confirmation display.
- [ ] `DATABASE_PATH` and media uploads directory properly configurable via environment variables in `payload.config.ts` and `docker-compose.yml`.
- [ ] `npm run build` passes with zero TypeScript errors.
- [ ] Vitest unit tests and Playwright E2E tests pass 100%.
