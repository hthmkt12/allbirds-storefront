import { useState, useMemo } from "react";
import { CartItem } from "./cart-drawer";
import { createOrder } from "../utils/cms-client";

interface CheckoutViewProps {
  cart: CartItem[];
  onNavigate: (path: string) => void;
  onClearCart: () => void;
}

interface FormData {
  email: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

const FIELD_LABELS: Record<keyof FormData, string> = {
  email: "Email",
  fullName: "Full Name",
  address: "Street Address",
  city: "City",
  state: "State",
  zip: "Zip Code",
};

const INITIAL_FORM: FormData = {
  email: "",
  fullName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
};

/** Parse "$98" or "98.00" into a number */
const parsePrice = (price: string): number =>
  parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

const fmt = (n: number): string => (n % 1 === 0 ? `${n}` : n.toFixed(2));

function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, "");
  if (!digits || digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let val = parseInt(digits.charAt(i), 10);
    if (shouldDouble) {
      val *= 2;
      if (val > 9) val -= 9;
    }
    sum += val;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function validateExpiry(expiry: string): boolean {
  const clean = expiry.trim();
  if (!/^\d{2}\/\d{2}$/.test(clean)) return false;
  const [mmStr, yyStr] = clean.split("/");
  const month = parseInt(mmStr, 10);
  const year = parseInt(yyStr, 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth() + 1;
  if (year < curYear) return false;
  if (year === curYear && month < curMonth) return false;
  return true;
}

function validateCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv.trim());
}

export function CheckoutView({ cart, onNavigate, onClearCart }: CheckoutViewProps) {
  const [form, setForm] = useState<FormData>(() => ({
    ...INITIAL_FORM,
    email: localStorage.getItem("customer_email") || "",
  }));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'shipping' | 'payment'>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr'>("card");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [txnId, setTxnId] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);

  // Order math
  const subtotal = useMemo(
    () => cart.reduce((s, i) => s + parsePrice(i.price) * i.quantity, 0),
    [cart],
  );
  const tax = subtotal * 0.08;
  const shipping = subtotal >= 150 ? 0 : 7.5;
  const total = subtotal + tax + shipping;

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleCardNumberChange = (val: string) => {
    setCardNumber(val);
    if (cardErrors.cardNumber) {
      setCardErrors(prev => {
        const next = { ...prev };
        delete next.cardNumber;
        return next;
      });
    }
  };

  const handleCardExpiryChange = (val: string) => {
    setCardExpiry(val);
    if (cardErrors.cardExpiry) {
      setCardErrors(prev => {
        const next = { ...prev };
        delete next.cardExpiry;
        return next;
      });
    }
  };

  const handleCardCvvChange = (val: string) => {
    setCardCvv(val);
    if (cardErrors.cardCvv) {
      setCardErrors(prev => {
        const next = { ...prev };
        delete next.cardCvv;
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    (Object.keys(FIELD_LABELS) as (keyof FormData)[]).forEach((key) => {
      if (!form[key].trim()) {
        next[key] = `${FIELD_LABELS[key]} is required`;
      }
    });
    // Basic email format check
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (step === "shipping") {
      if (validate()) {
        setStep("payment");
      }
      return;
    }

    if (step === "payment") {
      if (paymentMethod === "card") {
        const cErrors: Record<string, string> = {};
        if (!cardNumber.trim()) {
          cErrors.cardNumber = "Card Number is required";
        } else if (!validateLuhn(cardNumber)) {
          cErrors.cardNumber = "Invalid Card Number";
        }

        if (!cardExpiry.trim()) {
          cErrors.cardExpiry = "Expiration Date is required";
        } else if (!validateExpiry(cardExpiry)) {
          cErrors.cardExpiry = "Invalid Expiration Date";
        }

        if (!cardCvv.trim()) {
          cErrors.cardCvv = "CVV is required";
        } else if (!validateCvv(cardCvv)) {
          cErrors.cardCvv = "Invalid CVV";
        }

        if (Object.keys(cErrors).length > 0) {
          setCardErrors(cErrors);
          return;
        }

        setCardErrors({});
        setPaymentError(null);
        setSubmitting(true);

        setTimeout(async () => {
          if (cardNumber.trim().endsWith("9999")) {
            setPaymentError("Payment Failed: Card Declined");
            setSubmitting(false);
          } else {
            try {
              await createOrder({
                email: form.email.trim(),
                shippingName: form.fullName.trim(),
                shippingAddress: form.address.trim(),
                shippingCity: form.city.trim(),
                shippingState: form.state.trim(),
                shippingZip: form.zip.trim(),
                items: cart.map(item => ({
                  id: item.id,
                  name: item.name,
                  price: item.price,
                  size: item.size,
                  color: item.color,
                  image: item.image,
                  quantity: item.quantity,
                })),
                subtotal,
                tax,
                shipping,
                total,
                paymentMethod: "card",
                paymentStatus: "paid",
              });
              
              onClearCart();
              onNavigate("/checkout/confirmation");
            } catch (err) {
              console.error("Error creating order:", err);
              setPaymentError("Payment Failed: Error saving order");
            } finally {
              setSubmitting(false);
            }
          }
        }, 2000);
      } else if (paymentMethod === "qr") {
        const generatedTxnId = `TXN-${Date.now()}`;
        setTxnId(generatedTxnId);
        setShowQrModal(true);

        setTimeout(async () => {
          try {
            await createOrder({
              email: form.email.trim(),
              shippingName: form.fullName.trim(),
              shippingAddress: form.address.trim(),
              shippingCity: form.city.trim(),
              shippingState: form.state.trim(),
              shippingZip: form.zip.trim(),
              items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                size: item.size,
                color: item.color,
                image: item.image,
                quantity: item.quantity,
              })),
              subtotal,
              tax,
              shipping,
              total,
              paymentMethod: "qr",
              paymentStatus: "paid",
            });
            
            onClearCart();
            setShowQrModal(false);
            onNavigate("/checkout/confirmation");
          } catch (err) {
            console.error("Error creating order with QR:", err);
            alert("Error placing order. Please try again.");
            setShowQrModal(false);
          }
        }, 3000);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page" style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--serif)" }}>Checkout</h1>
        <p style={{ color: "var(--iron)" }}>Your cart is empty.</p>
        <button
          type="button"
          className="pill-button"
          onClick={() => onNavigate("/")}
          style={{ background: "var(--charcoal)", color: "var(--canvas)", border: "none" }}
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const renderField = (field: keyof FormData, type = "text") => (
    <div className="checkout-field" key={field}>
      <label htmlFor={`checkout-${field}`}>{FIELD_LABELS[field]}</label>
      <input
        id={`checkout-${field}`}
        type={type}
        value={form[field]}
        disabled={submitting}
        onChange={(e) => handleChange(field, e.target.value)}
        autoComplete={field === "email" ? "email" : undefined}
      />
      {errors[field] && <span className="field-error">{errors[field]}</span>}
    </div>
  );

  return (
    <div className="checkout-page">
      <h1 style={{ fontFamily: "var(--serif)", marginBottom: "24px" }}>Checkout</h1>

      {showQrModal && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px"
        }}>
          <div className="vietqr-modal-content" style={{
            background: "var(--canvas, #fff)",
            padding: "32px",
            borderRadius: "8px",
            maxWidth: "350px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid var(--line)",
            boxSizing: "border-box"
          }}>
            <h3 style={{ fontSize: "20px", marginBottom: "16px", fontFamily: "var(--serif)" }}>Scan to Pay</h3>
            <div style={{
              background: "#eee",
              width: "120px",
              height: "120px",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ddd"
            }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="20" height="20" fill="black" />
                <rect x="15" y="15" width="10" height="10" fill="white" />
                <rect x="70" y="10" width="20" height="20" fill="black" />
                <rect x="75" y="15" width="10" height="10" fill="white" />
                <rect x="10" y="70" width="20" height="20" fill="black" />
                <rect x="15" y="75" width="10" height="10" fill="white" />
                <rect x="40" y="40" width="20" height="20" fill="black" />
                <rect x="45" y="45" width="10" height="10" fill="white" />
                <rect x="70" y="70" width="10" height="10" fill="black" />
                <rect x="80" y="80" width="10" height="10" fill="black" />
                <rect x="70" y="80" width="10" height="10" fill="black" />
                <rect x="80" y="70" width="10" height="10" fill="black" />
              </svg>
            </div>
            <p style={{ fontSize: "14px", marginBottom: "8px" }}>
              Total Amount: <strong>${fmt(total)}</strong>
            </p>
            <p style={{ fontSize: "12px", color: "var(--iron)" }}>
              Transaction ID: <span className="qr-txn-id">{txnId}</span>
            </p>
            <p style={{ fontSize: "13px", color: "#27ae60", marginTop: "16px", fontWeight: "bold" }}>
              Processing payment...
            </p>
          </div>
        </div>
      )}

      <div className="checkout-grid">
        {/* Form */}
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {step === "shipping" ? (
            <>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Contact</h2>
              {renderField("email", "email")}

              <h2 style={{ fontSize: "18px", margin: "24px 0 16px" }}>Shipping Address</h2>
              {renderField("fullName")}
              {renderField("address")}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {renderField("city")}
                {renderField("state")}
              </div>
              {renderField("zip")}

              <button 
                type="submit" 
                className="checkout-submit-btn pill-button" 
                disabled={submitting}
                style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
              >
                Continue to Payment
              </button>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Payment Method</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={() => {
                      setPaymentMethod("card");
                      setPaymentError(null);
                    }}
                  />
                  <span>Credit Card</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="qr"
                    checked={paymentMethod === "qr"}
                    onChange={() => {
                      setPaymentMethod("qr");
                      setPaymentError(null);
                    }}
                  />
                  <span>QR Code (Mobile Banking)</span>
                </label>
              </div>

              {paymentMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="checkout-field">
                    <label htmlFor="checkout-cardNumber">Card Number</label>
                    <input
                      id="checkout-cardNumber"
                      type="text"
                      placeholder="Card Number"
                      value={cardNumber}
                      disabled={submitting}
                      onChange={(e) => handleCardNumberChange(e.target.value)}
                    />
                    {cardErrors.cardNumber && <span className="field-error">{cardErrors.cardNumber}</span>}
                  </div>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <div className="checkout-field">
                      <label htmlFor="checkout-cardExpiry">Expiration Date (MM/YY)</label>
                      <input
                        id="checkout-cardExpiry"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        disabled={submitting}
                        onChange={(e) => handleCardExpiryChange(e.target.value)}
                      />
                      {cardErrors.cardExpiry && <span className="field-error">{cardErrors.cardExpiry}</span>}
                    </div>
                    <div className="checkout-field">
                      <label htmlFor="checkout-cardCvv">CVV/CVC</label>
                      <input
                        id="checkout-cardCvv"
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        disabled={submitting}
                        onChange={(e) => handleCardCvvChange(e.target.value)}
                      />
                      {cardErrors.cardCvv && <span className="field-error">{cardErrors.cardCvv}</span>}
                    </div>
                  </div>
                </div>
              )}

              {paymentError && (
                <div className="payment-error-message" style={{ color: "#c0392b", fontSize: "14px", marginTop: "12px", fontWeight: "bold" }}>
                  {paymentError}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  className="pill-button"
                  onClick={() => setStep("shipping")}
                  disabled={submitting}
                  style={{
                    flex: 1,
                    background: "transparent",
                    color: "var(--charcoal)",
                    border: "1px solid var(--charcoal)",
                    cursor: "pointer",
                    fontWeight: "bold",
                    minHeight: "44px"
                  }}
                >
                  Back to Shipping
                </button>
                <button
                  type="submit"
                  className="checkout-submit-btn pill-button"
                  disabled={submitting}
                  style={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer"
                  }}
                >
                  {submitting ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <svg
                        style={{
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          border: "2px solid currentColor",
                          borderTopColor: "transparent",
                          animation: "spin 1s linear infinite"
                        }}
                        viewBox="0 0 24 24"
                      ></svg>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Order Summary */}
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
      </div>
    </div>
  );
}
