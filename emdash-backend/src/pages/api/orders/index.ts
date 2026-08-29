import type { APIRoute } from "astro";
import { jsonResponse, errorResponse } from "../../../lib/cors";
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
  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  let body: OrderInput;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON payload", 400);
  }

  // 1. Validation
  const email = (body.email || "").trim().toLowerCase();
  const shippingName = (body.shippingName || "").trim();
  const shippingAddress = (body.shippingAddress || "").trim();
  const shippingCity = (body.shippingCity || "").trim();
  const shippingState = (body.shippingState || "").trim();
  const shippingZip = (body.shippingZip || "").trim();

  if (!email || !email.includes("@")) {
    return errorResponse("Valid email is required", 400);
  }
  if (!shippingName || !shippingAddress || !shippingCity || !shippingState || !shippingZip) {
    return errorResponse("All shipping fields are required", 400);
  }
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return errorResponse("Order must include at least one item", 400);
  }

  // 2. Compute totals
  const subtotal = typeof body.subtotal === "number" && body.subtotal >= 0
    ? body.subtotal
    : body.items.reduce((sum, item) => {
        const num = parseFloat((item.price || "").replace(/[^0-9.]/g, "")) || 0;
        return sum + num * (item.quantity || 1);
      }, 0);

  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const shipping = subtotal >= 50 ? 0 : 5;
  const total = Math.round((subtotal + tax + shipping) * 100) / 100;

  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `order-${Date.now()}`;
  const orderToken = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `token-${Date.now()}`;
  const nowIso = new Date().toISOString();
  const status = "pending";
  const paymentMethod = body.paymentMethod || "card";
  const paymentStatus = body.paymentStatus || "paid";

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

    return jsonResponse({ doc }, 201);
  } catch (err: any) {
    return errorResponse(err.message || "Failed to create order", 500);
  }
};
