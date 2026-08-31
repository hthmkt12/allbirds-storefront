import { describe, it, expect } from "vitest";
import { computeOrderTotals, parsePrice, unitPrice } from "./pricing";

describe("order pricing (server-authoritative)", () => {
  it("ignores a tampered client price when the catalog knows the product", () => {
    const catalog = new Map<string, number>([["Wool Runner", 95]]);
    // Attacker sends $1 for a $95 product.
    const items = [{ name: "Wool Runner", price: "$1.00", quantity: 2 }];

    const totals = computeOrderTotals(items, catalog);

    // Subtotal must use the catalog price (95 * 2 = 190), not 1 * 2 = 2.
    expect(totals.subtotal).toBe(190);
    expect(unitPrice(items[0], catalog)).toBe(95);
  });

  it("falls back to the client line price only for unknown items", () => {
    const catalog = new Map<string, number>();
    const items = [{ name: "Legacy Item", price: "$42.50", quantity: 1 }];

    expect(computeOrderTotals(items, catalog).subtotal).toBe(42.5);
  });

  it("applies tax, flat shipping under threshold, and rounds to cents", () => {
    const catalog = new Map<string, number>([["Tee", 30]]);
    const totals = computeOrderTotals([{ name: "Tee", price: "$0", quantity: 1 }], catalog);

    expect(totals.subtotal).toBe(30);
    expect(totals.tax).toBe(2.4); // 30 * 0.08
    expect(totals.shipping).toBe(7.5); // below free-shipping threshold
    expect(totals.total).toBe(39.9);
  });

  it("gives free shipping at or above the threshold", () => {
    const catalog = new Map<string, number>([["Jacket", 150]]);
    const totals = computeOrderTotals([{ name: "Jacket", price: "$150", quantity: 1 }], catalog);

    expect(totals.shipping).toBe(0);
    expect(totals.total).toBe(162); // 150 + 12 tax + 0 shipping
  });

  it("parsePrice strips currency formatting and defaults to 0", () => {
    expect(parsePrice("$1,299.99")).toBe(1299.99);
    expect(parsePrice(undefined)).toBe(0);
    expect(parsePrice("free")).toBe(0);
  });
});
