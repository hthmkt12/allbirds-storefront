import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, contentCacheHeaders } from "../../lib/cors";

export const prerender = false;

interface PromoTileRow {
  id: number;
  title: string;
  swatch: string;
  image: string;
}

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as { runtime?: { env?: { DB?: any } } }).runtime?.env?.DB;
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const { results } = await db.prepare("SELECT * FROM promo_tiles ORDER BY id ASC").all();
    const docs = (results as PromoTileRow[]).map((row) => ({
      title: row.title,
      swatch: row.swatch,
      image: row.image,
    }));
    return jsonResponse({ docs }, 200, contentCacheHeaders);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch promo tiles", 500);
  }
};
