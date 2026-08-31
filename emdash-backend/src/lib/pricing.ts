// Pure, framework-free order pricing. Kept separate from the Astro route so it
// can be unit-tested and reused. These constants must stay aligned with the
// storefront commerce-config (TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT).
export const TAX_RATE = 0.08;
export const FREE_SHIPPING_THRESHOLD = 150;
export const SHIPPING_FLAT = 7.5;

export interface PricedItem {
  name?: string;
  price?: string;
  quantity?: number;
}

export interface OrderTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Parse a display price like "$95.00" into a number; invalid input -> 0. */
export function parsePrice(raw: string | undefined): number {
  return parseFloat((raw || "").replace(/[^0-9.]/g, "")) || 0;
}

/**
 * Authoritative unit price for an item. The catalog price (by product name)
 * always wins; the client-supplied line price is only a fallback for items the
 * catalog does not know about, so a tampered client price cannot lower a charge
 * for a known product.
 */
export function unitPrice(item: PricedItem, priceByName: Map<string, number>): number {
  const authoritative = item.name ? priceByName.get(item.name) : undefined;
  return typeof authoritative === "number" && authoritative > 0
    ? authoritative
    : parsePrice(item.price);
}

/** Compute subtotal/tax/shipping/total from authoritative catalog prices. */
export function computeOrderTotals(
  items: PricedItem[],
  priceByName: Map<string, number>,
): OrderTotals {
  const subtotal = round2(
    items.reduce((sum, item) => sum + unitPrice(item, priceByName) * (item.quantity || 1), 0),
  );
  const tax = round2(subtotal * TAX_RATE);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = round2(subtotal + tax + shipping);
  return { subtotal, tax, shipping, total };
}
