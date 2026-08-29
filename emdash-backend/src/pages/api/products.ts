import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, contentCacheHeaders } from "../../lib/cors";

export const prerender = false;

interface ProductRow {
  id: number;
  name: string;
  price: string;
  fit: string;
  rating: number;
  tags: string;
  sizes: string;
  slug: string | null;
  description: string | null;
  label: string | null;
  color: string | null;
  swatch: string | null;
  image: string | null;
  colorways: string;
}

function safeJsonParse<T>(jsonStr: string | null | undefined, fallback: T): T {
  if (!jsonStr) return fallback;
  try {
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as { runtime?: { env?: { DB?: any } } }).runtime?.env?.DB;
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const { results } = await db.prepare("SELECT * FROM products ORDER BY id ASC").all();
    const docs = (results as ProductRow[]).map((row) => ({
      name: row.name,
      price: row.price,
      fit: row.fit,
      rating: row.rating,
      tags: safeJsonParse<string[]>(row.tags, []),
      sizes: safeJsonParse<number[]>(row.sizes, []),
      slug: row.slug || undefined,
      description: row.description || undefined,
      label: row.label || undefined,
      color: row.color || undefined,
      swatch: row.swatch || undefined,
      image: row.image || undefined,
      colorways: safeJsonParse<Array<{ color: string; swatch: string; image: string }>>(row.colorways, []),
    }));
    return jsonResponse({ docs }, 200, contentCacheHeaders);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch products", 500);
  }
};
