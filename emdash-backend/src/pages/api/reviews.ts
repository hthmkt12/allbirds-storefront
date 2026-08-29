import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, contentCacheHeaders } from "../../lib/cors";
import { getDb } from "../../lib/db";

export const prerender = false;

interface ReviewRow {
  id: number;
  quote: string;
  customer_name: string;
  detail: string;
}

export const GET: APIRoute = async ({ locals }) => {
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const { results } = await db.prepare("SELECT * FROM reviews ORDER BY id ASC").all();
    const docs = (results as ReviewRow[]).map((row) => ({
      quote: row.quote,
      customerName: row.customer_name,
      detail: row.detail,
    }));
    return jsonResponse({ docs }, 200, contentCacheHeaders);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch reviews", 500);
  }
};
