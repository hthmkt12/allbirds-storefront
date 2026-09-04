import { useEffect, useState } from "react";
import { getOrders, CmsOrder } from "../utils/cms-client";
import { useDrawerA11y } from "../utils/use-drawer-a11y";

interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

export function AccountDrawer({ isOpen, onClose, onNavigate }: AccountDrawerProps) {
  const panelRef = useDrawerA11y(isOpen, onClose);
  const [customerEmail, setCustomerEmail] = useState<string | null>(() => {
    return localStorage.getItem("customer_email");
  });
  const [signInEmail, setSignInEmail] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupOrderId, setLookupOrderId] = useState("");
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [orders, setOrders] = useState<CmsOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Load email on open or update
  useEffect(() => {
    if (isOpen) {
      setCustomerEmail(localStorage.getItem("customer_email"));
    }
  }, [isOpen]);

  // Fetch orders when email changes or when drawer is opened while logged in
  useEffect(() => {
    if (!isOpen || !customerEmail) {
      setOrders([]);
      return;
    }

    const fetchCustomerOrders = async () => {
      setLoadingOrders(true);
      setOrdersError(null);
      try {
        const fetched = await getOrders(customerEmail);
        setOrders(fetched);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setOrdersError("Failed to load your order history.");
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchCustomerOrders();
  }, [customerEmail, isOpen]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError(null);
    const cleanEmail = signInEmail.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSignInError("Please enter a valid email address");
      return;
    }
    localStorage.setItem("customer_email", cleanEmail);
    setCustomerEmail(cleanEmail);
    setSignInEmail("");
  };

  const handleSignOut = () => {
    localStorage.removeItem("customer_email");
    setCustomerEmail(null);
    setOrders([]);
  };

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div
        ref={panelRef}
        className={`account-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Account"
        aria-modal="true"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)" }}>Account</h2>
          <button
            type="button"
            aria-label="Close account"
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
          >&times;</button>
        </div>

        {customerEmail ? (
          /* Signed In View */
          <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid var(--line)" }}>
              <div style={{ fontSize: "12px", color: "var(--iron)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "4px" }}>Signed In As</div>
              <strong style={{ fontSize: "16px", wordBreak: "break-all" }}>{customerEmail}</strong>
            </div>

            <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "16px" }}>Order History</h3>
            
            <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px", marginBottom: "16px" }}>
              {loadingOrders ? (
                <p style={{ fontSize: "14px", color: "var(--iron)" }}>Loading orders...</p>
              ) : ordersError ? (
                <p style={{ fontSize: "14px", color: "var(--rose)" }}>{ordersError}</p>
              ) : orders.length === 0 ? (
                <p style={{ fontSize: "14px", color: "var(--iron)" }}>No orders found.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {orders.map((order) => (
                    <div key={order.id} className="order-card" style={{ border: "1px solid var(--line)", borderRadius: "8px", padding: "16px", background: "var(--canvas)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13px", color: "var(--iron)" }}>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span style={{ textTransform: "capitalize", fontWeight: 600, color: order.status === "delivered" ? "#2d7a2d" : "var(--charcoal)" }}>{order.status}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, marginBottom: "12px", fontSize: "14px" }}>
                        <span style={{ wordBreak: "break-all", marginRight: "8px" }}>Order #{order.id.slice(-8).toUpperCase()}</span>
                        <span>${order.total.toFixed(2)}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {order.items.map((item, idx) => (
                          <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                            <img src={item.image} alt={item.name} style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--line)" }} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: "13px", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</div>
                              <div style={{ fontSize: "11px", color: "var(--iron)" }}>
                                {item.color} / Size {item.size} / Qty {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          if (onNavigate) {
                            onNavigate(
                              `/orders/track?email=${encodeURIComponent(
                                order.email
                              )}&orderId=${encodeURIComponent(
                                order.orderToken || order.id
                              )}`
                            );
                          }
                        }}
                        style={{
                          marginTop: "12px",
                          width: "100%",
                          padding: "8px 12px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: "none",
                          border: "1px solid var(--line)",
                          borderRadius: "4px",
                          cursor: "pointer",
                          color: "var(--charcoal)",
                        }}
                      >
                        Track Order
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              className="pill-button"
              onClick={handleSignOut}
              style={{ width: "100%", background: "var(--canvas)", border: "1px solid var(--charcoal)", fontWeight: 700, marginTop: "auto" }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          /* Signed Out / Login View */
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            {/* Sign In Form */}
            <form onSubmit={handleSignIn} style={{ display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Sign In</h3>
              <p style={{ fontSize: "14px", color: "var(--iron)", marginBottom: "16px" }}>
                Sign in to view your orders, manage returns, and check your rewards.
              </p>
              <label htmlFor="signin-email-input" className="sr-only">Email address</label>
              <input
                id="signin-email-input"
                type="email"
                required
                placeholder="Enter your email..."
                value={signInEmail}
                onChange={(e) => {
                  setSignInEmail(e.target.value);
                  if (signInError) setSignInError(null);
                }}
                style={{ width: "100%", padding: "12px", fontSize: "14px", border: "1px solid var(--line)", borderRadius: "4px", boxSizing: "border-box", marginBottom: signInError ? "6px" : "12px" }}
              />
              {signInError && (
                <p role="alert" style={{ color: "#c0392b", fontSize: "12px", margin: "0 0 12px 0" }}>
                  {signInError}
                </p>
              )}
              <button
                type="submit"
                className="pill-button"
                style={{ width: "100%", background: "var(--charcoal)", color: "var(--canvas)", border: "none", fontWeight: 700 }}
              >
                Sign In
              </button>
            </form>

            {/* Order Lookup */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!lookupEmail.trim() || !lookupOrderId.trim()) {
                  setLookupError("Please enter both email and order number.");
                  return;
                }
                onClose();
                if (onNavigate) {
                  onNavigate(
                    `/orders/track?email=${encodeURIComponent(
                      lookupEmail.trim()
                    )}&orderId=${encodeURIComponent(lookupOrderId.trim())}`
                  );
                }
              }}
              style={{ borderTop: "1px solid var(--line)", paddingTop: "24px" }}
            >
              <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px" }}>Order Lookup</h3>
              <p style={{ fontSize: "13px", color: "var(--iron)", marginBottom: "12px" }}>
                Quickly check fulfillment and tracking for a single order.
              </p>
              <label htmlFor="order-lookup-email-input" className="sr-only">Email address</label>
              <input
                id="order-lookup-email-input"
                type="email"
                required
                placeholder="Order email address..."
                value={lookupEmail}
                onChange={(e) => {
                  setLookupEmail(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                style={{ width: "100%", padding: "12px", fontSize: "14px", border: "1px solid var(--line)", borderRadius: "4px", boxSizing: "border-box", marginBottom: "8px" }}
              />
              <label htmlFor="order-lookup-input" className="sr-only">Order number</label>
              <input
                id="order-lookup-input"
                type="text"
                required
                placeholder="Enter order number or token..."
                value={lookupOrderId}
                onChange={(e) => {
                  setLookupOrderId(e.target.value);
                  if (lookupError) setLookupError(null);
                }}
                style={{ width: "100%", padding: "12px", fontSize: "14px", border: "1px solid var(--line)", borderRadius: "4px", boxSizing: "border-box", marginBottom: lookupError ? "6px" : "12px" }}
              />
              {lookupError && (
                <p role="alert" style={{ color: "#c0392b", fontSize: "12px", margin: "0 0 12px 0" }}>
                  {lookupError}
                </p>
              )}
              <button
                type="submit"
                className="pill-button"
                style={{ width: "100%", background: "var(--canvas)", border: "1px solid var(--charcoal)", fontWeight: 700 }}
              >
                Look Up Order
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
