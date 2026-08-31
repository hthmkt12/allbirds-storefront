// Pure, framework-free payment-confirmation logic for the orders webhook.
// Kept separate from the Astro route so the security-critical checks (caller
// authentication, amount verification, status mapping) can be unit-tested.

export type PaymentStatus = "paid" | "failed" | "unpaid";
export type OrderStatus = "confirmed" | "pending";

/** Cent-level tolerance when comparing a paid amount to the order total. */
export const AMOUNT_TOLERANCE = 0.01;

/**
 * Length-independent constant-time string comparison. Always scans the longer
 * of the two inputs so timing does not leak the secret's length.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const len = Math.max(a.length, b.length);
  let mismatch = a.length === b.length ? 0 : 1;
  for (let i = 0; i < len; i++) {
    mismatch |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  }
  return mismatch === 0;
}

/**
 * Whether the caller-supplied key authenticates against the configured secret.
 * A missing/empty secret or a non-string key never authenticates.
 */
export function isAuthorized(providedKey: unknown, secret: string | null | undefined): boolean {
  if (typeof secret !== "string" || secret.length === 0) return false;
  if (typeof providedKey !== "string") return false;
  return timingSafeEqual(providedKey, secret);
}

/**
 * Normalize the payload's paymentStatus. Only an explicit "failed" or "unpaid"
 * is preserved; anything else (including a missing/invalid value) resolves to
 * "paid", matching the webhook's original behavior.
 */
export function resolvePaymentStatus(input: unknown): PaymentStatus {
  return input === "failed" || input === "unpaid" ? input : "paid";
}

/**
 * A "paid" confirmation must match the server-computed order total to the cent.
 * A non-numeric amount never matches.
 */
export function amountMatches(amount: unknown, orderTotal: number): boolean {
  if (typeof amount !== "number" || Number.isNaN(amount)) return false;
  return Math.abs(amount - orderTotal) <= AMOUNT_TOLERANCE;
}

/** Map a payment status to the order's lifecycle status. */
export function orderStatusFor(paymentStatus: PaymentStatus): OrderStatus {
  return paymentStatus === "paid" ? "confirmed" : "pending";
}
