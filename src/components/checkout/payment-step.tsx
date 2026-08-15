import { fmt } from "./validation";

interface PaymentStepProps {
  paymentMethod: "card" | "qr";
  onPaymentMethodChange: (m: "card" | "qr") => void;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  onCardNumberChange: (v: string) => void;
  onCardExpiryChange: (v: string) => void;
  onCardCvvChange: (v: string) => void;
  cardErrors: Record<string, string>;
  paymentError: string | null;
  submitting: boolean;
  total: number;
  onBack: () => void;
  showQrModal: boolean;
  txnId: string;
}

export function PaymentStep({
  paymentMethod,
  onPaymentMethodChange,
  cardNumber,
  cardExpiry,
  cardCvv,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCvvChange,
  cardErrors,
  paymentError,
  submitting,
  total,
  onBack,
  showQrModal,
  txnId,
}: PaymentStepProps) {
  return (
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
              onPaymentMethodChange("card");
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
              onPaymentMethodChange("qr");
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
              onChange={(e) => onCardNumberChange(e.target.value)}
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
                onChange={(e) => onCardExpiryChange(e.target.value)}
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
                onChange={(e) => onCardCvvChange(e.target.value)}
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
          onClick={onBack}
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
    </>
  );
}
