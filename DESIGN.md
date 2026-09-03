# Allbirds Design System (`DESIGN.md`)

> **Stitch Specification v1.0** — Plain-text Design System for Allbirds E-Commerce Storefront.  
> Format inspired by Google Stitch & `VoltAgent/awesome-design-md`. Intended for human designers and LLM coding agents.

---

## 1. Visual Theme & Atmosphere

- **Brand Essence**: *Better Things In A Better Way*. Natural materials (ZQ Merino wool, Tree fibre, SweetFoam sugarcane, Trino).
- **Aesthetic**: Warm Organic Minimalist, Zen, Tactile, Modern Craft.
- **Tone**: Grounded, calm, unpretentious, premium yet approachable.
- **Visual Weight**: Lightweight, airy, generous negative space. Zero harsh contrasts, zero aggressive box-shadows.
- **Interface Density**: Spacious and breathable (Comfortable mode).

---

## 2. Color Palette & Semantic Roles

Allbirds draws directly from nature — stone, earth, unbleached wool, eucalyptus leaves, and volcanic charcoal.

### Core Swatches

| Token Name | Hex Code | Purpose & Usage |
|---|---|---|
| `--charcoal` | `#212121` | Primary text, primary CTA buttons, active states, brand wordmark |
| `--iron` | `#525252` | Secondary text, subtitles, breadcrumbs, specifications, metadata |
| `--muted` | `#767676` | Tertiary helper text, disabled copy, timestamps |
| `--canvas` | `#FFFFFF` | Primary surface, card background, button text on dark CTA |
| `--sand` | `#E0DACF` | Warm neutral accent, hero banner ground, category card background |
| `--oat` | `#ECE9E2` | Secondary surface, section bands, review/quote blocks |
| `--sage` | `#D4D9CF` | Organic herbal accent, sustainability highlights |
| `--blue` | `#C8D3D8` | Cloud mist accent, active material swatches |
| `--terracotta` | `#D1B0A4` | Earthy clay accent, limited edition flags, subtle badges |
| `--line` | `#E5E0D8` | Structural dividing lines, card borders, table separators |
| `--line-subtle` | `rgba(33, 33, 33, 0.08)` | Ultra-soft borders for nested containers and cards |

### Semantic Surfaces

- `--surface-default`: `#FFFFFF`
- `--surface-subtle`: `#ECE9E2` (Oat)
- `--surface-raised`: `#FFFFFF` with warm ambient shadow
- `--surface-overlay`: `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(12px)`
- `--surface-backdrop`: `rgba(33, 33, 33, 0.45)` with soft fade-in

---

## 3. Typography Rules

A dual-font hierarchy pairing a literary editorial serif with a clean geometric sans.

### Typefaces
- **Editorial & Display**: `"Playfair Display", "Self Modern", Georgia, serif` (`var(--serif)`)
- **Functional UI & Body**: `"Geograph", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` (`var(--sans)`)

### Scale Hierarchy

| Role | Font Family | Size | Weight | Line Height | Tracking |
|---|---|---|---|---|---|
| Display Hero | Serif | `clamp(38px, 5vw, 64px)` | 400–600 | `1.02` | `-0.01em` |
| Section Header | Serif | `clamp(28px, 4vw, 42px)` | 400 | `1.1` | `normal` |
| Product Title | Sans | `16px – 18px` | 600–700 | `1.25` | `uppercase, 0.05em` |
| Body Regular | Sans | `14px – 15px` | 400 | `1.5` | `normal` |
| Navigation Link | Sans | `12px` | 700 | `1` | `uppercase, 0.12em` |
| Tag / Badge / Kicker| Sans | `11px – 12px` | 700 | `1` | `uppercase, 0.08em` |

---

## 4. Component Stylings

### Buttons & CTAs
- **Primary Pill (`.pill-button`, `.hero-actions button`)**:
  - Height: `44px` min.
  - Shape: Pill rounded (`border-radius: 999px`).
  - Background: `var(--charcoal)`, Text: `var(--canvas)`.
  - Hover: `transform: translateY(-1px)`, subtle brightness boost, `box-shadow: var(--shadow-sm)`.
  - Active: `transform: translateY(0px) scale(0.98)`.
- **Secondary / Ghost Pill (`.pill-button.light`)**:
  - Background: `rgba(255, 255, 255, 0.85)`, border: `1px solid var(--charcoal)`.
  - Text: `var(--charcoal)`.
- **Icon Button (`.icon-button`)**:
  - Dimensions: `42px × 42px`, circular.
  - Hover: background `var(--oat)`.

### Product Cards (`.product-card`)
- Background: `var(--canvas)`.
- Border: `1px solid var(--line)` (not harsh charcoal).
- Radius: `12px` or clean rectangular with subtle `1px` crisp outline.
- Image Crop: Soft aspect ratio, background neutral tint.
- Hover Effect: Image zooms slightly (`scale(1.03)` with `transition: transform 0.4s var(--ease-out-spring)`), card gains `--shadow-md`.

### Drawers (`.drawer-panel`)
- Position: Fixed right, `width: 440px`, `max-width: 100vw`.
- Surface: `var(--canvas)`.
- Border: Left border `1px solid var(--line)`.
- Shadow: `-8px 0 24px var(--shadow-ambient-lg)`.
- Transition: `transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)`.

### Input Fields (`input`, `select`)
- Min Height: `44px`.
- Border: `1px solid var(--line)`.
- Focus: `outline: 2px solid var(--charcoal)`, `outline-offset: 1px`.
- Padding: `0 16px`.

---

## 5. Layout & Spacing Principles

- **Grid System**: 8pt spacing standard (`8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`).
- **Max Width**: Standard page shell capped at `1280px` (`.section-shell`).
- **Gutters**: Responsive padding `clamp(20px, 4vw, 40px)`.
- **Whitespace**: Sections are separated by `64px – 96px` vertical breathing room.

---

## 6. Depth & Elevation

Warm, diffused shadows using tinted charcoal instead of cold black:

- `--shadow-sm`: `0 2px 6px rgba(33, 33, 33, 0.04), 0 1px 2px rgba(33, 33, 33, 0.02)`
- `--shadow-md`: `0 8px 20px rgba(33, 33, 33, 0.06), 0 3px 6px rgba(33, 33, 33, 0.03)`
- `--shadow-lg`: `0 16px 36px rgba(33, 33, 33, 0.09), 0 6px 12px rgba(33, 33, 33, 0.04)`
- `--shadow-drawer`: `-8px 0 32px rgba(33, 33, 33, 0.12)`
- `--ease-out-spring`: `cubic-bezier(0.16, 1, 0.3, 1)`
- `--duration-normal`: `250ms`

---

## 7. Do's and Don'ts

### Do
- **Do** prioritize large high-resolution natural material textures (wool fleece, tree bark, sugar cane).
- **Do** preserve the serif italic script for key brand accents (`.script` font).
- **Do** keep button labels in clean uppercase with tracking (`letter-spacing: 0.12em`).
- **Do** ensure interactive elements have touch-friendly hits (`>= 44px`).
- **Do** use warm ambient shadows that feel like soft sunlight, not neon office lights.

### Don't
- **Don't** use cold pure gray (`#707070` or blue-tinged `#64748B`). Always use earthy neutrals.
- **Don't** apply harsh black shadows (`box-shadow: 0 4px 10px rgba(0,0,0,0.5)`).
- **Don't** put high-contrast saturated primary colors (no bright reds, purples, or neon greens).
- **Don't** use cartoonish rounded corners (`border-radius: 30px` on square cards). Keep radii refined (`8px - 14px`) or full pill (`999px`).

---

## 8. Responsive Behavior

- **Breakpoints**:
  - Mobile: `< 560px` (Single column, stacked navigation, drawer full-width `100vw`).
  - Tablet: `561px – 920px` (2 columns grid, compact header).
  - Desktop: `> 921px` (4 columns grid, full horizontal navigation, floating top bar).
- **Touch Rules**: All tap targets (size selectors, swatches, close icons) have a minimum boundary of `44px × 44px`.

---

## 9. Agent Prompt Guide

When asking an AI agent to build a new component for Allbirds, inject this snippet:

```markdown
Follow the Allbirds Design System (DESIGN.md):
- Tone: Warm Organic Minimalist e-commerce.
- Palette: Charcoal (#212121), Canvas (#FFFFFF), Sand (#E0DACF), Oat (#ECE9E2), Line (#E5E0D8).
- Headings: Serif ("Playfair Display", Georgia, serif).
- UI/Body: Sans ("Geograph", Inter, sans-serif).
- Buttons: Pill rounded (border-radius: 999px), uppercase, letter-spacing: 0.12em, min-height 44px.
- Elevation: Soft warm shadows (0 8px 20px rgba(33, 33, 33, 0.06)). No harsh black drop shadows.
```
