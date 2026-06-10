import { Database } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);
const dbPath = path.resolve(dirname, 'payload.db');

console.log('Opening database at:', dbPath);

try {
  const db = new Database(dbPath);
  
  // List all tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables found:', tables.map(t => t.name));

  // Count items in each collection table
  const collections = ['categories', 'products', 'materials', 'reviews', 'promo_tiles', 'hero_blocks', 'media', 'users'];
  for (const col of collections) {
    try {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${col}`).get();
      console.log(`Table ${col}: ${row.count} records`);
    } catch (e) {
      // Try with kebab case replaced by underscore, or just catch error if table doesn't exist
      try {
        const altName = col.replace(/-/g, '_');
        const row = db.prepare(`SELECT COUNT(*) as count FROM ${altName}`).get();
        console.log(`Table ${altName}: ${row.count} records`);
      } catch (err) {
        console.log(`Table ${col} (or variants) not found or query failed:`, e.message);
      }
    }
  }

  // Let's print some sample products to verify tags and sizes mapping
  try {
    const products = db.prepare(`SELECT id, name, price, fit, rating FROM products LIMIT 3`).all();
    console.log('Sample Products:', JSON.stringify(products, null, 2));
  } catch (e) {
    console.log('Could not fetch products:', e.message);
  }

} catch (err) {
  console.error('Failed to query database:', err);
}
