import { describe, it, expect, vi } from "vitest";
import { MockPaymentProvider } from "./payment-provider";
import { isAuthorized, amountMatches, resolvePaymentStatus } from "./payment";

const SECRET = "shared-webhook-secret";
const WEBHOOK = "https://api.example.com/api/orders/webhook";

describe("MockPaymentProvider", () => {
  it("confirms the authoritative order total via the webhook", async () => {
    const fake = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    const provider = new MockPaymentProvider();

    const res = await provider.confirmPayment(
      { orderToken: "tok-1", total: 129.99 },
      { webhookUrl: WEBHOOK, secret: SECRET, fetchImpl: fake as any },
    );

    expect(res.status).toBe(200);
    expect(fake).toHaveBeenCalledOnce();

    const [url, init] = fake.mock.calls[0];
    expect(url).toBe(WEBHOOK);
    const body = JSON.parse(init.body);

    // The confirmation the provider sends must pass the server's own checks.
    expect(isAuthorized(body.secretKey, SECRET)).toBe(true);
    expect(amountMatches(body.amount, 129.99)).toBe(true);
    expect(resolvePaymentStatus(body.paymentStatus)).toBe("paid");
    expect(body.orderToken).toBe("tok-1");
    expect(typeof body.transactionId).toBe("string");
  });

  it("never uses a client-supplied amount, only the order total", async () => {
    const fake = vi.fn(async () => new Response("{}", { status: 200 }));
    const provider = new MockPaymentProvider();

    await provider.confirmPayment(
      { orderId: "o9", total: 55.5 },
      { webhookUrl: WEBHOOK, secret: SECRET, fetchImpl: fake as any },
    );

    const body = JSON.parse(fake.mock.calls[0][1].body);
    expect(body.amount).toBe(55.5);
    // A different (tampered) total would be rejected server-side.
    expect(amountMatches(body.amount, 1)).toBe(false);
  });

  it("can report a failed payment", async () => {
    const fake = vi.fn(async () => new Response("{}", { status: 200 }));
    const provider = new MockPaymentProvider();

    await provider.confirmPayment(
      { orderId: "o1", total: 10 },
      { webhookUrl: WEBHOOK, secret: SECRET, status: "failed", fetchImpl: fake as any },
    );

    const body = JSON.parse(fake.mock.calls[0][1].body);
    expect(body.paymentStatus).toBe("failed");
  });
});
