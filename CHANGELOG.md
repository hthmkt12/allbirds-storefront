# Changelog

All notable changes to the Allbirds Storefront & Cloudflare Edge Backend are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-04

### Added
- **Order Tracking Self-Service UI & Route**: Added `/orders/track` route, standalone order tracking page with lookup form supporting both public Order ID and secret Order Token.
- **WAI-ARIA Stepper Accessibility**: Integrated standard `role="progressbar"` semantics (`aria-valuemin`, `aria-valuemax`, `aria-valuenow`, `aria-valuetext`) on order fulfillment steppers.
- **Cloudflare Edge D1 Backend (EmDash)**: Migrated backend to Astro on Cloudflare Workers backed by D1 SQLite database (`allbirds-emdash-db`).
- **Real-Time Order & Payment API**: Edge endpoints `POST /api/orders` and `GET /api/orders/lookup` with server-side pricing recalculation, rate limiting, and order token validation.
- **Dynamic SEO & Rich Snippets**: Route-aware OpenGraph tags, Twitter Card tags, and Schema.org `Product` JSON-LD metadata generator (`src/utils/seo.ts`).
- **Telemetry & Error Resilience**: Added client-side `ErrorBoundary`, telemetry reporter, and edge backend request logging middleware.
- **Visual Design System (Stitch)**: Refactored visual tokens in `src/styles.css` adhering to Allbirds luxury-minimalist aesthetic (`DESIGN.md`).

### Fixed
- Fixed selector collisions and strict-mode ambiguities in Playwright E2E suites (`f7-customer-account.spec.ts`, `f6-accessibility.spec.ts`, PDP option tests).
- Hardened order total verification to prevent client tampering.
- Added 4000ms resilient fetch timeout with in-memory caching and graceful fallback to offline mock data.

---

## [1.0.0] - 2026-08-18

### Added
- Initial release of the Allbirds interactive e-commerce storefront.
- React 19, Vite, TypeScript architecture with responsive design.
- Complete PDP selectors, Cart Drawer, item count editing, and pricing calculations.
- Collection pages, Brand story, accessibility features, and keyboard navigation.
- E2E testing framework with Playwright covering critical purchasing journeys.
