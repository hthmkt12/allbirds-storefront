# Synthesis: Payload CMS Setup Strategy

## Consensus
All three Explorer agents agree on the following:
1. **Payload CMS Version**: Use Payload CMS 3.x. The storefront workspace uses React 19.2.3. Payload 2.x is locked to React 18, which creates severe NPM peer dependency conflict issues. Payload 3.x natively runs Next.js 15 and supports React 19.
2. **Database Adapter**: Use `@payloadcms/db-sqlite` database adapter configured with a portable SQLite database located at `F:/Allbirds/payload-cms/payload.db`. Use absolute path resolution (`path.resolve`) to prevent the SQLite file from being created in arbitrary temp or OS directories during build or run steps.
3. **Slugs & Endpoints**: Slugs should be mapped as:
   - `hero-blocks` -> `/api/hero-blocks`
   - `categories` -> `/api/categories`
   - `products` -> `/api/products`
   - `materials` -> `/api/materials`
   - `reviews` -> `/api/reviews`
   - `promo-tiles` -> `/api/promo-tiles`
   - `media` -> `/api/media`
4. **Data Modeling**:
   - `colorways` inside `products` will be an array of objects containing `color` (or `colorName`), `swatch` (or `swatchColor`), and `image` (relation to `media`).
   - `tags` (array of strings) and `sizes` (array of numbers) can be modeled as Payload array fields with `afterRead` hooks to transform the database structure (`[{ tag: 'Canvas' }]`) into the flat structure (`['Canvas']`) expected by the storefront.
5. **Seeding Strategy**: Programmatic seeding script using Payload Local API to clear existing data, upload media assets first, map their IDs, and then seed the rest of the collections referencing those IDs.

## Resolved Conflicts
- **Colorway Field Names**: Explorer 1 proposed `color` / `swatch` / `image` while Explorer 2 proposed `colorName` / `swatchColor` / `image`.
  - *Resolution*: We will use `color` / `swatch` / `image` for `colorways` fields, matching the exact spelling in `PROJECT.md` line 29: `colorways (array of: color name, swatch color, image relation to Media)`.
- **Seeding Source Dir**: Image assets should be uploaded from `F:/Allbirds/public`. We will read them directly using `fs` and path helpers.

## Verification Method
1. Run `npm run build` and `payload db:migrate` (or let Payload generate SQLite schema dynamically on start).
2. Start dev server and confirm `/api/products`, etc., return the correct seeded items.
