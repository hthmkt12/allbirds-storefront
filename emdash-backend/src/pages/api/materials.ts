import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, contentCacheHeaders } from "../../lib/cors";

export const prerender = false;

interface MaterialRow {
  id: number;
  name: string;
  impact_note: string;
  texture_image: string | null;
  source_region: string | null;
}

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as { runtime?: { env?: { DB?: any } } }).runtime?.env?.DB;
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const { results } = await db.prepare("SELECT * FROM materials ORDER BY id ASC").all();
    const docs = (results as MaterialRow[]).map((row) => ({
      name: row.name,
      impactNote: row.impact_note,
      textureImage: row.texture_image || undefined,
      sourceRegion: row.source_region || undefined,
    }));
    return jsonResponse({ docs }, 200, contentCacheHeaders);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch materials", 500);
  }
};
