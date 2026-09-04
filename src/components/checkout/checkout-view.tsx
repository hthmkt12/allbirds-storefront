import { useState } from "react";
import { CartItem } from "../cart-drawer";
import { createOrder } from "../../utils/cms-client";
import {
  CheckoutFormData,
  CheckoutFormErrors,
  validateShippingForm,
  validateCard,
  computeTotals,
} from "./validation";
import { ShippingStep } from "./shipping-step";
import { PaymentStep } from "./payment-step";
import { OrderSummary } from "./order-summary";

interface CheckoutViewProps {
  cart: CartItem[];
  onNavigate: (path: string) => void;
  onClearCart: () => void;
}

const INITIAL_FORM: CheckoutFormData = {
  email: "",
  fullName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
};

export function CheckoutView({ cart, onNavigate, onClearCart }: CheckoutViewProps) {
  const [form, setForm] = useState<CheckoutFormData>(() => ({
    ...INITIAL_FORM,
    email: localStorage.getItem("customer_email") || "",
  }));
  const [errors, setErrors] = useState<CheckoutFormErrors>({});
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

  const { subtotal, tax, shipping, total } = computeTotals(cart);

  const handleChange = (field: keyof CheckoutFormData, value: string) => {
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

  const handlePaymentMethodChange = (method: 'card' | 'qr') => {
    setPaymentMethod(method);
    setPaymentError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (step === "shipping") {
      const next = validateShippingForm(form);
      setErrors(next);
      if (Object.keys(next).length === 0) {
        setStep("payment");
      }
      return;
    }

    if (step === "payment") {
      if (paymentMethod === "card") {
        const cErrors = validateCard(cardNumber, cardExpiry, cardCvv);
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
              const created = await createOrder({
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
              const targetOrderId = created.orderToken || created.id;
              onNavigate(
                `/checkout/confirmation?email=${encodeURIComponent(
                  created.email
                )}&orderId=${encodeURIComponent(targetOrderId)}`
              );
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
            const created = await createOrder({
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
            const targetOrderId = created.orderToken || created.id;
            onNavigate(
              `/checkout/confirmation?email=${encodeURIComponent(
                created.email
              )}&orderId=${encodeURIComponent(targetOrderId)}`
            );
          } catch (err) {
            console.error("Error creating order with QR:", err);
            setPaymentError("Error placing order. Please try again.");
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

  return (
    <div className="checkout-page">
      <h1 style={{ fontFamily: "var(--serif)", marginBottom: "24px" }}>Checkout</h1>

      <div className="checkout-grid">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {step === "shipping" ? (
            <ShippingStep
              form={form}
              errors={errors}
              submitting={submitting}
              onFieldChange={handleChange}
            />
          ) : (
            <PaymentStep
              paymentMethod={paymentMethod}
              onPaymentMethodChange={handlePaymentMethodChange}
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              cardCvv={cardCvv}
              onCardNumberChange={handleCardNumberChange}
              onCardExpiryChange={handleCardExpiryChange}
              onCardCvvChange={handleCardCvvChange}
              cardErrors={cardErrors}
              paymentError={paymentError}
              submitting={submitting}
              total={total}
              onBack={() => setStep("shipping")}
              showQrModal={showQrModal}
              txnId={txnId}
            />
          )}
        </form>

        <OrderSummary cart={cart} />
      </div>
    </div>
  );
}
