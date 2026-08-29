import type { APIRoute } from "astro";
import { jsonResponse, errorResponse } from "../../../lib/cors";
import { getDb } from "../../../lib/db";

export const prerender = false;

interface OrderRow {
  id: string;
  order_token: string;
  email: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_zip: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  payment_method: 'card' | 'qr' | null;
  payment_status: 'unpaid' | 'paid' | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  name: string;
  price: string;
  size: number;
  color: string;
  image: string;
  quantity: number;
}

export const GET: APIRoute = async ({ request, locals }) => {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const token = url.searchParams.get("token");

  if (!email || !token) {
    return errorResponse("Missing email or token", 400);
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  const db = getDb(locals);
  if (!db) {
    return errorResponse("Database unavailable", 503);
  }

  try {
    const orderResult = await db
      .prepare("SELECT * FROM orders WHERE email = ? AND order_token = ? LIMIT 1")
      .bind(cleanEmail, cleanToken)
      .first();

    if (!orderResult) {
      return jsonResponse({ docs: [] });
    }

    const order = orderResult as OrderRow;

    const { results: itemsResult } = await db
      .prepare("SELECT * FROM order_items WHERE order_id = ?")
      .bind(order.id)
      .all();

    const items = (itemsResult as OrderItemRow[]).map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      size: item.size,
      color: item.color,
      image: item.image,
      quantity: item.quantity,
    }));

    const doc = {
      id: order.id,
      orderToken: order.order_token,
      email: order.email,
      shippingName: order.shipping_name,
      shippingAddress: order.shipping_address,
      shippingCity: order.shipping_city,
      shippingState: order.shipping_state,
      shippingZip: order.shipping_zip,
      items,
      subtotal: order.subtotal,
      tax: order.tax,
      shipping: order.shipping,
      total: order.total,
      status: order.status,
      paymentMethod: order.payment_method || undefined,
      paymentStatus: order.payment_status || undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    };

    return jsonResponse({ docs: [doc] });
  } catch (err: any) {
    return errorResponse(err.message || "Failed to lookup order", 500);
  }
};
