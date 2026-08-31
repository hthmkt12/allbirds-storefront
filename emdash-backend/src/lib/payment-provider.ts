// Reference contract for a payment provider, plus a mock implementation.
//
// A real gateway integration (Stripe, VNPay, MoMo, ...) implements
// PaymentProvider.confirmPayment by mapping its own success callback/webhook to
// buildConfirmationPayload() + postConfirmation(). MockPaymentProvider shows the
// full loop end-to-end without any external service, and is what the tests and
// local `wrangler dev` flow exercise. Swap it for a concrete provider once one
// is chosen; the webhook contract (see webhook-client.ts) stays identical.
import type { PaymentStatus } from "./payment";
import { buildConfirmationPayload, postConfirmation } from "./webhook-client";

/** Minimal authoritative order reference a provider needs to confirm payment. */
export interface OrderRef {
  orderId?: string;
  orderToken?: string;
  /** Server-computed order total; the confirmed amount must equal this. */
  total: number;
}

export interface ConfirmOptions {
  /** Webhook endpoint, e.g. https://<host>/api/orders/webhook */
  webhookUrl: string;
  /** Shared webhook secret (PAYMENT_WEBHOOK_SECRET). */
  secret: string;
  /** Provider transaction reference, for audit. */
  transactionId?: string;
  /** Defaults to "paid". */
  status?: PaymentStatus;
  /** Injectable transport; defaults to global fetch. */
  fetchImpl?: typeof fetch;
}

export interface PaymentProvider {
  readonly name: string;
  /**
   * Confirm a completed payment for an order by notifying the webhook. The
   * amount is taken from the authoritative order total, never from client input.
   */
  confirmPayment(order: OrderRef, opts: ConfirmOptions): Promise<Response>;
}

/**
 * A provider that simulates a successful charge and confirms it through the
 * real webhook client. Useful for local dev, sandbox flows, and tests. It never
 * invents an amount: it always confirms the authoritative order total.
 */
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async confirmPayment(order: OrderRef, opts: ConfirmOptions): Promise<Response> {
    const payload = buildConfirmationPayload({
      orderId: order.orderId,
      orderToken: order.orderToken,
      amount: order.total,
      secret: opts.secret,
      status: opts.status ?? "paid",
      transactionId: opts.transactionId ?? `mock_${Date.now()}`,
    });
    return postConfirmation(opts.webhookUrl, payload, opts.fetchImpl);
  }
}
