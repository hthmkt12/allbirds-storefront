import { useState, useEffect, type FormEvent } from "react";
import { Check, Package, Truck, CheckCircle2, Clock, Search } from "lucide-react";
import { lookupOrder, type CmsOrder } from "../utils/cms-client";
import { useSeoMetadata } from "../utils/seo";

export interface OrderTrackingViewProps {
  initialEmail?: string;
  initialOrderId?: string;
  onNavigate: (path: string) => void;
}

const ORDER_STEPS = [
  { key: "pending", label: "Order Confirmed", icon: Clock },
  { key: "processing", label: "Preparing", icon: Package },
  { key: "shipped", label: "In Transit", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
] as const;

function getStepIndex(status: string): number {
  switch (status.toLowerCase()) {
    case "pending":
      return 0;
    case "processing":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

export function OrderTrackingView({
  initialEmail = "",
  initialOrderId = "",
  onNavigate,
}: OrderTrackingViewProps) {
  const [email, setEmail] = useState(initialEmail);
  const [orderId, setOrderId] = useState(initialOrderId);
  const [order, setOrder] = useState<CmsOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useSeoMetadata({
    title: order ? `Tracking Order #${order.id.slice(-8).toUpperCase()}` : "Track Your Order",
    description: "Check real-time delivery status, tracking progress, and order details with Allbirds.",
    url: "/orders/track",
    type: "website",
  });

  const performLookup = async (lookupEmail: string, lookupId: string) => {
    if (!lookupEmail.trim() || !lookupId.trim()) {
      setError("Please provide both your email address and order number.");
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const result = await lookupOrder(lookupEmail, lookupId);
      if (result) {
        setOrder(result);
        setError(null);
      } else {
        setOrder(null);
        setError("We could not find an order matching that email and order number. Please verify your information.");
      }
    } catch {
      setOrder(null);
      setError("An unexpected error occurred while looking up your order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialEmail && initialOrderId) {
      performLookup(initialEmail, initialOrderId);
    }
  }, [initialEmail, initialOrderId]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    performLookup(email, orderId);
  };

  const currentStepIdx = order ? getStepIndex(order.status) : 0;

  return (
    <main
      className="order-tracking-view"
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "48px 20px 80px 20px",
        fontFamily: "inherit",
        color: "var(--charcoal)",
      }}
    >
      <nav aria-label="Breadcrumb" style={{ marginBottom: "24px", fontSize: "13px", color: "var(--iron)" }}>
        <button
          type="button"
          onClick={() => onNavigate("/")}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }}
        >
          Home
        </button>
        <span aria-hidden="true" style={{ margin: "0 8px" }}>/</span>
        <span aria-current="page" style={{ color: "var(--charcoal)", fontWeight: 600 }}>Track Order</span>
      </nav>

      <header style={{ marginBottom: "32px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--serif)", fontSize: "36px", marginBottom: "8px" }}>
          Track Your Order
        </h1>
        <p style={{ color: "var(--iron)", fontSize: "15px", maxWidth: "500px", margin: "0 auto" }}>
          Enter your order confirmation details below to track real-time fulfillment and delivery progress.
        </p>
      </header>

      {/* Lookup Form */}
      <form
        onSubmit={handleSubmit}
        className="order-lookup-form"
        style={{
          background: "var(--canvas)",
          border: "1px solid var(--line)",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "36px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label htmlFor="track-email-input" style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Order Email
            </label>
            <input
              id="track-email-input"
              type="email"
              required
              placeholder="e.g. jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <label htmlFor="track-orderid-input" style={{ display: "block", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "6px" }}>
              Order Number or Token
            </label>
            <input
              id="track-orderid-input"
              type="text"
              required
              placeholder="e.g. order-12345 or UUID token"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                fontSize: "14px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              padding: "12px 16px",
              backgroundColor: "rgba(192, 57, 43, 0.08)",
              border: "1px solid rgba(192, 57, 43, 0.2)",
              borderRadius: "8px",
              color: "#c0392b",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="pill-button"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            width: "100%",
            padding: "14px 24px",
            background: "var(--charcoal)",
            color: "var(--canvas)",
            border: "none",
            borderRadius: "9999px",
            fontWeight: 700,
            fontSize: "15px",
            cursor: loading ? "wait" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "opacity 0.2s",
          }}
        >
          <Search size={16} />
          {loading ? "Locating Order..." : "Track Order"}
        </button>
      </form>

      {/* Result Display */}
      {order && (
        <section
          className="order-result-card"
          style={{
            background: "var(--canvas)",
            border: "1px solid var(--line)",
            borderRadius: "16px",
            padding: "32px 24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header info */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "12px",
              paddingBottom: "24px",
              borderBottom: "1px solid var(--line)",
              marginBottom: "32px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--iron)", display: "block", marginBottom: "4px" }}>
                Order #{order.id.slice(-8).toUpperCase()}
              </span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                Placed on {new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </h2>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "20px", fontWeight: 700 }}>
                ${order.total.toFixed(2)}
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  marginTop: "4px",
                  backgroundColor: order.paymentStatus === "paid" ? "rgba(46, 204, 113, 0.15)" : "rgba(241, 196, 15, 0.15)",
                  color: order.paymentStatus === "paid" ? "#27ae60" : "#d35400",
                }}
              >
                {order.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
              </span>
            </div>
          </div>

          {/* Stepper Progress */}
          <div style={{ marginBottom: "40px" }}>
            <h3 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--iron)", marginBottom: "20px" }}>
              Fulfillment Status
            </h3>

            <div
              className="tracking-stepper"
              role="progressbar"
              aria-label="Order fulfillment progress"
              aria-valuemin={0}
              aria-valuemax={ORDER_STEPS.length - 1}
              aria-valuenow={currentStepIdx}
              aria-valuetext={ORDER_STEPS[currentStepIdx]?.label || "Order Confirmed"}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                position: "relative",
                gap: "8px",
              }}
            >
              {ORDER_STEPS.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const IconComponent = step.icon;

                return (
                  <div
                    key={step.key}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: "8px",
                        backgroundColor: isPassed ? "var(--charcoal)" : "var(--sand)",
                        color: isPassed ? "var(--canvas)" : "var(--iron)",
                        border: isCurrent ? "3px solid #27ae60" : "none",
                        transition: "all 0.3s ease",
                      }}
                    >
                      {idx < currentStepIdx ? <Check size={18} /> : <IconComponent size={18} />}
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: isPassed ? 700 : 500,
                        color: isPassed ? "var(--charcoal)" : "var(--iron)",
                        lineHeight: 1.3,
                      }}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "24px",
              paddingTop: "24px",
              borderTop: "1px solid var(--line)",
              marginBottom: "32px",
            }}
          >
            <div>
              <h4 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--iron)", marginBottom: "8px" }}>
                Shipping Details
              </h4>
              <p style={{ fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                <strong>{order.shippingName}</strong><br />
                {order.shippingAddress}<br />
                {order.shippingCity}, {order.shippingState} {order.shippingZip}
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--iron)", marginBottom: "8px" }}>
                Summary
              </h4>
              <div style={{ fontSize: "14px", lineHeight: 1.8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Subtotal:</span>
                  <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Shipping:</span>
                  <span>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Items Purchased */}
          <div>
            <h4 style={{ fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--iron)", marginBottom: "16px" }}>
              Items in this shipment ({order.items.length})
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {order.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    padding: "12px",
                    border: "1px solid var(--line)",
                    borderRadius: "10px",
                    background: "#ffffff",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: "56px",
                      height: "56px",
                      objectFit: "cover",
                      borderRadius: "6px",
                      border: "1px solid var(--line)",
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "4px" }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--iron)" }}>
                      {item.color} / Size {item.size} / Qty {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    {item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {hasSearched && !order && !loading && !error && (
        <div style={{ textAlign: "center", padding: "40px", color: "var(--iron)" }}>
          No order records available.
        </div>
      )}
    </main>
  );
}
