import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, privateCorsHeaders } from "../../../lib/cors";
import { getDb } from "../../../lib/db";
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

/** Length-independent constant-time string comparison. */
function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
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
  if (typeof body.secretKey !== "string" || !timingSafeEqual(body.secretKey, secret)) {
    return errorResponse("Unauthorized", 401, cors);
  }

  const { orderId, orderToken } = body;
  const paymentStatus = body.paymentStatus === "failed" || body.paymentStatus === "unpaid"
    ? body.paymentStatus
    : "paid";

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
    if (paymentStatus === "paid") {
      if (typeof body.amount !== "number" || Math.abs(body.amount - order.total) > 0.01) {
        return errorResponse("Payment amount does not match order total", 400, cors);
      }
    }

    const nowIso = new Date().toISOString();
    const newStatus = paymentStatus === "paid" ? "confirmed" : "pending";
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
