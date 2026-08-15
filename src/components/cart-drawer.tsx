import { useMemo } from "react";
import { ResponsiveImage } from "./responsive-image";
import { products } from "../data/allbirds-data";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD } from "../utils/commerce-config";
import { useDrawerA11y } from "../utils/use-drawer-a11y";

export interface CartItem {
  id: string;
  name: string;
  price: string;
  size: number;
  color: string;
  image: string;
  quantity: number;
}

export interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigate: (path: string) => void;
  onAddToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onNavigate,
  onAddToCart,
}: CartDrawerProps) {
  // 1. Calculate subtotal
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0;
      return sum + (numericPrice * item.quantity);
    }, 0);
  }, [cart]);

  // 2. Calculate estimated tax (8%)
  const estimatedTax = useMemo(() => {
    return subtotal * TAX_RATE;
  }, [subtotal]);

  // Formatted subtotal for display
  const formattedSubtotal = subtotal % 1 === 0 ? subtotal : subtotal.toFixed(2);

  // 3. Recommended products (pick 2 products not in cart)
  const recommendedProducts = useMemo(() => {
    const notInCart = products.filter(
      (prod) => !cart.some((item) => item.name === prod.name)
    );
    return notInCart.slice(0, 2);
  }, [cart]);

  const panelRef = useDrawerA11y(isOpen, onClose);

  return (
    <>
      <div
        className={`cart-drawer-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`cart-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Shopping Cart"
        aria-modal="true"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)" }}>Your Bag</h2>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        {cart.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
            <div className="cart-empty-message" style={{ margin: "40px auto", textAlign: "center", fontSize: "16px", color: "var(--iron)" }}>
              Your bag is empty
            </div>

            {/* Recommended Products when empty */}
            {isOpen && recommendedProducts.length > 0 && (
              <div className="recommended-section" style={{ borderTop: "1px solid var(--line)", paddingTop: "16px", marginTop: "auto" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.1em" }}>Recommended for You</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {recommendedProducts.map((prod) => (
                    <div key={prod.name} className="recommended-item" style={{ display: "flex", gap: "12px", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
                      <ResponsiveImage
                        image={prod.image}
                        alt={prod.name}
                        style={{ width: "50px", height: "50px", objectFit: "cover", border: "1px solid var(--line)" }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "bold", fontSize: "12px" }}>{prod.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--iron)" }}>{prod.price}</div>
                      </div>
                      <button
                        type="button"
                        className="pill-button"
                        onClick={() => onAddToCart({
                          name: prod.name,
                          price: prod.price,
                          size: 8, // default size
                          color: prod.color,
                          image: prod.image,
                        })}
                        style={{ padding: "4px 12px", minHeight: "30px", fontSize: "11px", background: "var(--charcoal)", color: "var(--canvas)", border: "none" }}
                      >
                        Add to Bag
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            {/* Free Shipping Progress Bar */}
            <div className="shipping-progress-bar" style={{
              padding: "12px",
              backgroundColor: "var(--oat)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "bold",
            }}>
              {subtotal >= FREE_SHIPPING_THRESHOLD ? (
                "You qualified for free shipping!"
              ) : (
                `$${(FREE_SHIPPING_THRESHOLD - subtotal) % 1 === 0 ? FREE_SHIPPING_THRESHOLD - subtotal : (FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)} away from free shipping`
              )}
              <div className="progress-bar-track" style={{ height: "4px", background: "#e0e0e0", marginTop: "8px", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    height: "100%",
                    background: "var(--charcoal)",
                    width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="cart-items-list" style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
              {cart.map((item) => (
                <div className="cart-item" key={item.id} style={{
                  display: "flex",
                  gap: "12px",
                  paddingBottom: "16px",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--line)",
                }}>
                  <ResponsiveImage
                    image={item.image}
                    alt={item.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid var(--line)", display: "block" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>{item.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--iron)", margin: "2px 0" }}>{item.color}</div>
                    <div className="item-size" style={{ fontSize: "13px", color: "var(--iron)" }}>Size: {item.size}</div>
                    <div style={{ fontWeight: "bold", marginTop: "6px" }}>{item.price}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div className="quantity-selector" style={{ display: "flex", alignItems: "center", border: "1px solid var(--charcoal)", borderRadius: "999px", overflow: "hidden" }}>
                      <button className="minus" type="button" onClick={() => onUpdateQuantity(item.id, -1)} style={{ border: "none", background: "none", padding: "4px 10px", cursor: "pointer" }}>-</button>
                      <span className="quantity-value" style={{ padding: "0 4px", fontWeight: "bold", fontSize: "13px" }}>{item.quantity}</span>
                      <button className="plus" type="button" onClick={() => onUpdateQuantity(item.id, 1)} style={{ border: "none", background: "none", padding: "4px 10px", cursor: "pointer" }}>+</button>
                    </div>
                    <button
                      className="remove-item"
                      type="button"
                      onClick={() => onRemoveItem(item.id)}
                      style={{ border: "none", background: "none", textDecoration: "underline", fontSize: "12px", color: "var(--iron)", cursor: "pointer" }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Recommended Products when cart is not empty */}
              {isOpen && recommendedProducts.length > 0 && (
                <div className="recommended-section" style={{ borderTop: "1px solid var(--line)", paddingTop: "16px", marginTop: "16px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "12px", letterSpacing: "0.1em" }}>Recommended for You</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {recommendedProducts.map((prod) => (
                      <div key={prod.name} className="recommended-item" style={{ display: "flex", gap: "12px", alignItems: "center", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
                        <ResponsiveImage
                          image={prod.image}
                          alt={prod.name}
                          style={{ width: "50px", height: "50px", objectFit: "cover", border: "1px solid var(--line)" }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: "bold", fontSize: "12px" }}>{prod.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--iron)" }}>{prod.price}</div>
                        </div>
                        <button
                          type="button"
                          className="pill-button"
                          onClick={() => onAddToCart({
                            name: prod.name,
                            price: prod.price,
                            size: 8, // default size
                            color: prod.color,
                            image: prod.image,
                          })}
                          style={{ padding: "4px 12px", minHeight: "30px", fontSize: "11px", background: "var(--charcoal)", color: "var(--canvas)", border: "none" }}
                        >
                          Add to Bag
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="cart-drawer-footer" style={{ borderTop: "1px solid var(--charcoal)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "var(--iron)", marginBottom: "8px" }}>
                <span>Estimated Tax (8%):</span>
                <span>${estimatedTax.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", marginBottom: "16px" }}>
                <span>Subtotal:</span>
                <span className="cart-subtotal">${formattedSubtotal}</span>
              </div>
              <button
                type="button"
                className="checkout-button pill-button"
                onClick={() => onNavigate("/checkout")}
                style={{ width: "100%", background: "var(--charcoal)", color: "var(--canvas)", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: "bold" }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
