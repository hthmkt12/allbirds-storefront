import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { categories, products, promoTiles, valueBlocks, reviews } from "../../src/data/allbirds-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function escapeSql(val: string | null | undefined): string {
  if (val === null || val === undefined) return "NULL";
  return `'${val.replace(/'/g, "''")}'`;
}

function generateSql(): string {
  const lines: string[] = [
    "-- Seed data for Allbirds EmDash D1 Database (Generated via seed-d1.ts)",
    "",
    "-- 1. Hero Blocks",
    "INSERT OR REPLACE INTO hero_blocks (id, headline, body, cta_label, media, theme_swatch) VALUES",
    `(1, ${escapeSql('Light on your feet. Easy on the planet.')}, ${escapeSql('Iconic comfort made with natural materials like ZQ Merino wool, eucalyptus tree fiber, and sugarcane.')}, ${escapeSql('Shop New Arrivals')}, ${escapeSql('/allbirds-lifestyle-hero.png')}, ${escapeSql('#e0dacf')});`,
    "",
    "-- 2. Categories",
    "INSERT OR REPLACE INTO categories (id, name, slug, cta, swatch, image) VALUES",
  ];

  const catLines = categories.map((cat, idx) => {
    const slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `(${idx + 1}, ${escapeSql(cat.name)}, ${escapeSql(slug)}, ${escapeSql(cat.cta)}, ${escapeSql(cat.swatch)}, ${escapeSql(cat.image)})`;
  });
  lines.push(catLines.join(",\n") + ";");

  lines.push("", "-- 3. Products", "INSERT OR REPLACE INTO products (id, name, price, fit, rating, tags, sizes, slug, description, label, color, swatch, image, colorways) VALUES");

  const defaultSizes = JSON.stringify([7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12]);
  const prodLines = products.map((prod, idx) => {
    const slug = prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const tagsJson = JSON.stringify(prod.tags || []);
    const ratingNum = parseFloat(prod.rating) || 4.5;
    const colorwaysJson = JSON.stringify([
      { color: prod.color, swatch: prod.swatch, image: prod.image },
      { color: "Sage Brush", swatch: "var(--sage)", image: "/allbirds-mvp-lifestyle.png" },
      { color: "Pacific Blue", swatch: "var(--blue)", image: "/allbirds-travel-promo.png" },
    ]);
    const desc = `${prod.name} with natural comfort and sustainable materials.`;
    return `(${idx + 1}, ${escapeSql(prod.name)}, ${escapeSql(prod.price)}, ${escapeSql(prod.fit)}, ${ratingNum}, ${escapeSql(tagsJson)}, ${escapeSql(defaultSizes)}, ${escapeSql(slug)}, ${escapeSql(desc)}, ${escapeSql(prod.label || null)}, ${escapeSql(prod.color)}, ${escapeSql(prod.swatch)}, ${escapeSql(prod.image)}, ${escapeSql(colorwaysJson)})`;
  });
  lines.push(prodLines.join(",\n") + ";");

  lines.push("", "-- 4. Promo Tiles", "INSERT OR REPLACE INTO promo_tiles (id, title, swatch, image) VALUES");
  const promoLines = promoTiles.map((promo, idx) => {
    return `(${idx + 1}, ${escapeSql(promo.title)}, ${escapeSql(promo.swatch)}, ${escapeSql(promo.image)})`;
  });
  lines.push(promoLines.join(",\n") + ";");

  lines.push("", "-- 5. Materials", "INSERT OR REPLACE INTO materials (id, name, impact_note, texture_image, source_region) VALUES");
  const matLines = valueBlocks.map((val, idx) => {
    return `(${idx + 1}, ${escapeSql(val.title)}, ${escapeSql(val.body)}, ${escapeSql('/allbirds-crop-top-left.png')}, ${escapeSql('Global & Sustainable')})`;
  });
  lines.push(matLines.join(",\n") + ";");

  lines.push("", "-- 6. Reviews", "INSERT OR REPLACE INTO reviews (id, quote, customer_name, detail) VALUES");
  const reviewLines = reviews.map((rev, idx) => {
    return `(${idx + 1}, ${escapeSql(rev.quote)}, ${escapeSql(rev.name)}, ${escapeSql(rev.detail)})`;
  });
  lines.push(reviewLines.join(",\n") + ";");

  return lines.join("\n") + "\n";
}

const outputPath = path.join(__dirname, "seed-d1.sql");
const sql = generateSql();
fs.writeFileSync(outputPath, sql, "utf-8");
console.log(`Generated D1 seed SQL at: ${outputPath}`);
