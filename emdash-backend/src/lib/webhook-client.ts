// Provider-agnostic client for confirming an order against the payment webhook.
//
// This is the integration seam a real payment gateway plugs into: when a
// provider reports a successful (or failed) charge, it builds a confirmation
// payload with buildConfirmationPayload() and POSTs it to /api/orders/webhook.
// The payload here mirrors, by construction, exactly what the webhook's
// payment.ts checks (isAuthorized / amountMatches / resolvePaymentStatus)
// accept, so the two stay in lockstep. It does NOT itself integrate any
// gateway — a concrete provider still supplies orderId/amount/secret.
import type { PaymentStatus } from "./payment";

export interface ConfirmationInput {
  /** One of orderId or orderToken must be provided. */
  orderId?: string;
  orderToken?: string;
  /** Amount actually charged; must equal the order total to the cent. */
  amount: number;
  /** Shared webhook secret (from PAYMENT_WEBHOOK_SECRET). */
  secret: string;
  /** Defaults to "paid". */
  status?: PaymentStatus;
  /** Optional provider transaction reference for audit. */
  transactionId?: string;
}

export interface ConfirmationPayload {
  orderId?: string;
  orderToken?: string;
  amount: number;
  paymentStatus: PaymentStatus;
  secretKey: string;
  transactionId?: string;
}

/** Build the exact JSON body /api/orders/webhook expects. Throws on bad input. */
export function buildConfirmationPayload(input: ConfirmationInput): ConfirmationPayload {
  if (!input.orderId && !input.orderToken) {
    throw new Error("buildConfirmationPayload requires orderId or orderToken");
  }
  if (typeof input.amount !== "number" || Number.isNaN(input.amount)) {
    throw new Error("buildConfirmationPayload requires a numeric amount");
  }
  if (typeof input.secret !== "string" || input.secret.length === 0) {
    throw new Error("buildConfirmationPayload requires a non-empty secret");
  }

  const payload: ConfirmationPayload = {
    amount: input.amount,
    paymentStatus: input.status ?? "paid",
    secretKey: input.secret,
  };
  if (input.orderId) payload.orderId = input.orderId;
  if (input.orderToken) payload.orderToken = input.orderToken;
  if (input.transactionId) payload.transactionId = input.transactionId;
  return payload;
}

/**
 * POST a confirmation to the webhook. `fetchImpl` is injectable so callers (and
 * tests) can supply a sandbox/mock transport instead of the global fetch.
 */
export async function postConfirmation(
  webhookUrl: string,
  payload: ConfirmationPayload,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
