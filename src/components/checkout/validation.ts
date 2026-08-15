import { CartItem } from "../cart-drawer";
import { TAX_RATE, FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT } from "../../utils/commerce-config";

export interface CheckoutFormData {
  email: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export type CheckoutFormErrors = Partial<Record<keyof CheckoutFormData, string>>;

export const CHECKOUT_FIELD_LABELS: Record<keyof CheckoutFormData, string> = {
  email: "Email",
  fullName: "Full Name",
  address: "Street Address",
  city: "City",
  state: "State",
  zip: "Zip Code",
};

/** Parse "$98" or "98.00" into a number */
export const parsePrice = (price: string): number =>
  parseFloat(price.replace(/[^0-9.]/g, "")) || 0;

export const fmt = (n: number): string => (n % 1 === 0 ? `${n}` : n.toFixed(2));

export function validateLuhn(cardNumber: string): boolean {
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

export function validateExpiry(expiry: string): boolean {
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

export function validateCvv(cvv: string): boolean {
  return /^\d{3,4}$/.test(cvv.trim());
}

export function validateShippingForm(form: CheckoutFormData): CheckoutFormErrors {
  const next: CheckoutFormErrors = {};
  (Object.keys(CHECKOUT_FIELD_LABELS) as (keyof CheckoutFormData)[]).forEach((key) => {
    if (!form[key].trim()) {
      next[key] = `${CHECKOUT_FIELD_LABELS[key]} is required`;
    }
  });
  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    next.email = "Enter a valid email address";
  }
  return next;
}

export function validateCard(
  cardNumber: string,
  cardExpiry: string,
  cardCvv: string,
): Record<string, string> {
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

  return cErrors;
}

export function computeTotals(cart: CartItem[]) {
  const subtotal = cart.reduce((s, i) => s + parsePrice(i.price) * i.quantity, 0);
  const tax = subtotal * TAX_RATE;
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
  const total = subtotal + tax + shipping;
  return { subtotal, tax, shipping, total };
}
