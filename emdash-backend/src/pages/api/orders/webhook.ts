import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, privateCorsHeaders } from "../../../lib/cors";
import { getDb } from "../../../lib/db";
import { isAuthorized, resolvePaymentStatus, amountMatches, orderStatusFor } from "../../../lib/payment";
// @ts-ignore - provided by the Cloudflare Workers runtime
import { env as cfEnv } from "cloudflare:workers";

export const prerender = false;

interface WebhookPayload {
  orderId?: string;
  orderToken?: string;
  transactionId?: string;
  amount?: number;
  paymentStatus?: "paid" | "failed" | "unpaid";
  secretKey?: string;
}

/** Read the shared webhook secret from the Workers env or local dev fallback. */
function getWebhookSecret(locals?: any): string | null {
  const fromEnv = (cfEnv as any)?.PAYMENT_WEBHOOK_SECRET;
  if (typeof fromEnv === "string" && fromEnv.length > 0) return fromEnv;
  const fromLocals = locals && typeof locals === "object" ? locals.PAYMENT_WEBHOOK_SECRET : undefined;
  if (typeof fromLocals === "string" && fromLocals.length > 0) return fromLocals;
  return null;
}

export const POST: APIRoute = async ({ request, locals }) => {
  const cors = privateCorsHeaders(request, locals);
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503, cors);
  }

  // Fail closed: without a configured secret we cannot authenticate the caller,
  // so we must not allow any order to be marked paid.
  const secret = getWebhookSecret(locals);
  if (!secret) {
    console.error("webhook: PAYMENT_WEBHOOK_SECRET is not configured");
    return errorResponse("Payment confirmation is not configured", 503, cors);
  }

  let body: WebhookPayload;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload", 400, cors);
  }

  // Authenticate the payment provider before trusting any field in the payload.
  if (!isAuthorized(body.secretKey, secret)) {
    return errorResponse("Unauthorized", 401, cors);
  }

  const { orderId, orderToken } = body;
  const paymentStatus = resolvePaymentStatus(body.paymentStatus);

  if (!orderId && !orderToken) {
    return errorResponse("Either orderId or orderToken is required", 400, cors);
  }

  try {
    // Load the authoritative order so we can verify the amount before confirming.
    const order: any = orderToken
      ? await db.prepare("SELECT id, total FROM orders WHERE order_token = ? LIMIT 1").bind(orderToken).first()
      : await db.prepare("SELECT id, total FROM orders WHERE id = ? LIMIT 1").bind(orderId).first();

    if (!order) {
      return errorResponse("Order not found", 404, cors);
    }

    // A "paid" confirmation must match the server-computed total to the cent.
    if (paymentStatus === "paid" && !amountMatches(body.amount, order.total)) {
      return errorResponse("Payment amount does not match order total", 400, cors);
    }

    const nowIso = new Date().toISOString();
    const newStatus = orderStatusFor(paymentStatus);
    await db.prepare(`
      UPDATE orders
      SET payment_status = ?, status = ?, updated_at = ?
      WHERE id = ?
    `).bind(paymentStatus, newStatus, nowIso, order.id).run();

    return jsonResponse({
      success: true,
      message: "Order payment status updated successfully",
      updatedAt: nowIso,
    }, 200, cors);
  } catch (err: any) {
    console.error("webhook: failed to update payment status", err);
    return errorResponse("Failed to update payment status", 500, cors);
  }
};
