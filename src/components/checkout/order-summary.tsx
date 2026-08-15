import { CartItem } from "../cart-drawer";
import { fmt, parsePrice, computeTotals } from "./validation";

export function OrderSummary({ cart }: { cart: CartItem[] }) {
  const { subtotal, tax, shipping, total } = computeTotals(cart);

  return (
    <aside className="checkout-summary">
      <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Order Summary</h2>
      {cart.map((item) => (
        <div className="checkout-summary-item" key={item.id}>
          <div style={{ flex: 1 }}>
            <strong>{item.name}</strong>
            <div style={{ fontSize: "13px", color: "var(--iron)" }}>
              {item.color} / Size {item.size} / Qty {item.quantity}
            </div>
          </div>
          <span>${fmt(parsePrice(item.price) * item.quantity)}</span>
        </div>
      ))}

      <div className="checkout-totals">
        <div><span>Subtotal</span><span>${fmt(subtotal)}</span></div>
        <div><span>Estimated Tax (8%)</span><span>${tax.toFixed(2)}</span></div>
        <div>
          <span>Shipping</span>
          <span>{shipping === 0 ? "FREE" : `$${fmt(shipping)}`}</span>
        </div>
        <div style={{ fontWeight: "bold", fontSize: "18px", borderTop: "2px solid var(--charcoal)", paddingTop: "12px" }}>
          <span>Total</span><span>${fmt(total)}</span>
        </div>
      </div>
    </aside>
  );
}
