import { CheckoutFormData, CheckoutFormErrors, CHECKOUT_FIELD_LABELS } from "./validation";

interface ShippingStepProps {
  form: CheckoutFormData;
  errors: CheckoutFormErrors;
  submitting: boolean;
  onFieldChange: (field: keyof CheckoutFormData, value: string) => void;
}

const renderField = (
  field: keyof CheckoutFormData,
  form: CheckoutFormData,
  errors: CheckoutFormErrors,
  submitting: boolean,
  type = "text",
  onFieldChange: (f: keyof CheckoutFormData, v: string) => void,
) => (
  <div className="checkout-field" key={field}>
    <label htmlFor={`checkout-${field}`}>{CHECKOUT_FIELD_LABELS[field]}</label>
    <input
      id={`checkout-${field}`}
      type={type}
      value={form[field]}
      disabled={submitting}
      onChange={(e) => onFieldChange(field, e.target.value)}
      autoComplete={field === "email" ? "email" : undefined}
    />
    {errors[field] && <span className="field-error">{errors[field]}</span>}
  </div>
);

export function ShippingStep({
  form,
  errors,
  submitting,
  onFieldChange,
}: ShippingStepProps) {
  return (
    <>
      <h2 style={{ fontSize: "18px", marginBottom: "16px" }}>Contact</h2>
      {renderField("email", form, errors, submitting, "email", onFieldChange)}

      <h2 style={{ fontSize: "18px", margin: "24px 0 16px" }}>Shipping Address</h2>
      {renderField("fullName", form, errors, submitting, "text", onFieldChange)}
      {renderField("address", form, errors, submitting, "text", onFieldChange)}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {renderField("city", form, errors, submitting, "text", onFieldChange)}
        {renderField("state", form, errors, submitting, "text", onFieldChange)}
      </div>
      {renderField("zip", form, errors, submitting, "text", onFieldChange)}

      <button
        type="submit"
        className="checkout-submit-btn pill-button"
        disabled={submitting}
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        Continue to Payment
      </button>
    </>
  );
}
