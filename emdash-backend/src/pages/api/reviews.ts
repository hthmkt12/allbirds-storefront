import type { APIRoute } from "astro";
import { jsonResponse, errorResponse } from "../../lib/cors";

export const prerender = false;

interface ReviewRow {
  id: number;
  quote: string;
  customer_name: string;
  detail: string;
}

export const GET: APIRoute = async ({ locals }) => {
  const db = (locals as { runtime?: { env?: { DB?: any } } }).runtime?.env?.DB;
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
    return jsonResponse({ docs });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to fetch reviews", 500);
  }
};
