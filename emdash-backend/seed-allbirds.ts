import { Database } from "bun:sqlite";

const db = new Database("data.db");

console.log("Seeding Allbirds catalog to DashCommerce ec_products table...");

const allbirdsProducts = [
  {
    id: "01M13ALLBIRDS001RUNNER",
    slug: "mens-canvas-runner-nz",
    title: "Men's Canvas Runner NZ",
    sku: "AB-RUN-001",
    prices: JSON.stringify({ USD: { amount: 10000 } }),
    description: "Canvas, Lightweight, True to size",
    stock_quantity: 50,
  },
  {
    id: "01M13ALLBIRDS002GLIDER",
    slug: "womens-tree-glider",
    title: "Women's Tree Glider",
    sku: "AB-GLI-002",
    prices: JSON.stringify({ USD: { amount: 14000 } }),
    description: "Tree Fiber, Breathable, Runs narrow",
    stock_quantity: 45,
  },
  {
    id: "01M13ALLBIRDS003CRUISER",
    slug: "mens-canvas-cruiser",
    title: "Men's Canvas Cruiser",
    sku: "AB-CRU-003",
    prices: JSON.stringify({ USD: { amount: 7500 } }),
    description: "Canvas, Travel, Relaxed fit",
    stock_quantity: 30,
  },
  {
    id: "01M13ALLBIRDS004BREEZER",
    slug: "womens-breezer-mary-jane",
    title: "Women's Breezer Mary Jane",
    sku: "AB-BRZ-004",
    prices: JSON.stringify({ USD: { amount: 11500 } }),
    description: "Mary Jane, Breezy, True to size",
    stock_quantity: 20,
  },
  {
    id: "01M13ALLBIRDS005DASHER",
    slug: "mens-dasher-nz",
    title: "Men's Dasher NZ",
    sku: "AB-DSH-005",
    prices: JSON.stringify({ USD: { amount: 14000 } }),
    description: "Running, Cushioned, Performance fit",
    stock_quantity: 60,
  },
  {
    id: "01M13ALLBIRDS006VARSITY",
    slug: "womens-varsity-strap",
    title: "Women's Varsity Strap",
    sku: "AB-VAR-006",
    prices: JSON.stringify({ USD: { amount: 11500 } }),
    description: "Retro, Everyday, Adjustable strap",
    stock_quantity: 25,
  }
];

const insertStmt = db.prepare(`
  INSERT OR REPLACE INTO ec_products (
    id, slug, status, created_at, updated_at, published_at, version, locale, translation_group,
    title, type, sku, prices, manage_stock, stock_quantity, stock_status, backorders,
    tax_class, featured, is_downloadable, is_virtual, description
  ) VALUES (
    $id, $slug, 'published', datetime('now'), datetime('now'), datetime('now'), 1, 'en', $id,
    $title, 'simple', $sku, $prices, 1, $stock_quantity, 'instock', 'no',
    'standard', 1, 0, 0, $description
  )
`);

for (const p of allbirdsProducts) {
  insertStmt.run({
    $id: p.id,
    $slug: p.slug,
    $title: p.title,
    $sku: p.sku,
    $prices: p.prices,
    $stock_quantity: p.stock_quantity,
    $description: p.description
  });
}

console.log("Successfully seeded", allbirdsProducts.length, "Allbirds products into ec_products!");
