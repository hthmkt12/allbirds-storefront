import type { APIRoute } from "astro";
import { jsonResponse, errorResponse, privateCorsHeaders } from "../../../lib/cors";
import { getDb } from "../../../lib/db";

export const prerender = false;

interface OrderItemInput {
  id: string;
  name: string;
  price: string;
  size: number;
  color: string;
  image: string;
  quantity: number;
}

interface OrderInput {
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  items: OrderItemInput[];
  subtotal: number;
  paymentMethod?: "card" | "qr";
  paymentStatus?: "unpaid" | "paid";
}

export const POST: APIRoute = async ({ request, locals }) => {
  const cors = privateCorsHeaders(request, locals);
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503, cors);
  }

  let body: OrderInput;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload", 400, cors);
  }

  // 1. Validation
  const email = (body.email || "").trim().toLowerCase();
  const shippingName = (body.shippingName || "").trim();
  const shippingAddress = (body.shippingAddress || "").trim();
  const shippingCity = (body.shippingCity || "").trim();
  const shippingState = (body.shippingState || "").trim();
  const shippingZip = (body.shippingZip || "").trim();

  if (!email || !email.includes("@")) {
    return errorResponse("Valid email is required", 400, cors);
  }
  if (!shippingName || !shippingAddress || !shippingCity || !shippingState || !shippingZip) {
    return errorResponse("All shipping fields are required", 400, cors);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return errorResponse("Order must include at least one item", 400, cors);
  }

  // 2. Compute totals server-side. Never trust the client-supplied subtotal.
  // Prices are taken from the authoritative catalog by product name; unknown
  // items (e.g. legacy carts) fall back to the parsed line price so valid
  // orders are never rejected.
  const parsePrice = (raw: string | undefined): number =>
    parseFloat((raw || "").replace(/[^0-9.]/g, "")) || 0;

  const priceByName = new Map<string, number>();
  try {
    const { results } = await db.prepare("SELECT name, price FROM products").all();
    for (const row of (results || []) as Array<{ name: string; price: string }>) {
      priceByName.set(row.name, parsePrice(row.price));
    }
  } catch (err: any) {
    // If the catalog is unavailable we degrade to client line prices below.
    console.error("orders: failed to load authoritative prices", err);
  }

  const unitPrice = (item: OrderItemInput): number => {
    const authoritative = priceByName.get(item.name);
    return typeof authoritative === "number" && authoritative > 0
      ? authoritative
      : parsePrice(item.price);
  };

  const subtotal = Math.round(
    body.items.reduce((sum, item) => sum + unitPrice(item) * (item.quantity || 1), 0) * 100,
  ) / 100;

  // Keep these aligned with the storefront's commerce-config (TAX_RATE,
  // FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT) so the server total matches the
  // amount the customer sees and pays; the webhook verifies that amount.
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 150 ? 0 : 7.5;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`;
  const orderToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `token-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const status = "pending";
  const paymentMethod = body.paymentMethod || "card";
  // Orders are always created unpaid. Payment is confirmed only via the
  // authenticated /api/orders/webhook endpoint, never by the client.
  const paymentStatus = "unpaid";

  // 3. Prepare Batch statements for D1
  try {
    const statements = [
      db.prepare(`
        INSERT INTO orders (
          id, order_token, email, shipping_name, shipping_address, shipping_city,
          shipping_state, shipping_zip, subtotal, tax, shipping, total, status,
          payment_method, payment_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id, orderToken, email, shippingName, shippingAddress, shippingCity,
        shippingState, shippingZip, subtotal, tax, shipping, total, status,
        paymentMethod, paymentStatus, nowIso, nowIso
      ),
      ...body.items.map((item) =>
        db.prepare(`
          INSERT INTO order_items (id, order_id, name, price, size, color, image, quantity)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          item.id || `item-${Date.now()}-${Math.random()}`,
          id,
          item.name || "Item",
          item.price || "$0",
          item.size || 0,
          item.color || "",
          item.image || "",
          item.quantity || 1
        )
      ),
    ];

    await db.batch(statements);

    const doc = {
      id,
      orderToken,
      email,
      shippingName,
      shippingAddress,
      shippingCity,
      shippingState,
      shippingZip,
      items: body.items,
      subtotal,
      tax,
      shipping,
      total,
      status,
      paymentMethod,
      paymentStatus,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    return jsonResponse({ doc }, 201, cors);
  } catch (err: any) {
    console.error("orders: failed to create order", err);
    return errorResponse("Failed to create order", 500, cors);
  }
};
