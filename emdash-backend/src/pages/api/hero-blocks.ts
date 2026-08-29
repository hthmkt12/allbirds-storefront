import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, contentCacheHeaders } from "../../lib/cors";
import { getDb } from "../../lib/db";

export const prerender = false;

interface HeroBlockRow {
  id: number;
  headline: string;
  body: string;
  cta_label: string;
  media: string | null;
  theme_swatch: string | null;
}

export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const { results } = await db.prepare("SELECT * FROM hero_blocks ORDER BY id ASC").all();
    const docs = (results as HeroBlockRow[]).map((row) => ({
      headline: row.headline,
      body: row.body,
      ctaLabel: row.cta_label,
      media: row.media || undefined,
      themeSwatch: row.theme_swatch || undefined,
    }));
    return jsonResponse({ docs }, 200, contentCacheHeaders);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch hero blocks", 500);
  }
};
