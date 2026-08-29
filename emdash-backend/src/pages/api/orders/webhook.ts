import type { APIRoute } from "astro";
import { jsonResponse, errorResponse } from "../../../lib/cors";
import { getDb } from "../../../lib/db";

export const prerender = false;

interface WebhookPayload {
  orderId?: string;
  orderToken?: string;
  transactionId?: string;
  amount?: number;
  paymentStatus?: "paid" | "failed" | "unpaid";
  secretKey?: string;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  let body: WebhookPayload;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload", 400);
  }

  const { orderId, orderToken, paymentStatus = "paid" } = body;

  if (!orderId && !orderToken) {
    return errorResponse("Either orderId or orderToken is required", 400);
  }

  try {
    const nowIso = new Date().toISOString();
    let result: any;

    if (orderToken) {
      result = await db.prepare(`
        UPDATE orders
        SET payment_status = ?, status = 'confirmed', updated_at = ?
        WHERE order_token = ?
      `).bind(paymentStatus, nowIso, orderToken).run();
    } else {
      result = await db.prepare(`
        UPDATE orders
        SET payment_status = ?, status = 'confirmed', updated_at = ?
        WHERE id = ?
      `).bind(paymentStatus, nowIso, orderId).run();
    }

    if (result.meta?.changes === 0) {
      return errorResponse("Order not found or no change applied", 404);
    }

    return jsonResponse({
      success: true,
      message: "Order payment status updated successfully",
      updatedAt: nowIso,
    });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to update payment status", 500);
  }
};
