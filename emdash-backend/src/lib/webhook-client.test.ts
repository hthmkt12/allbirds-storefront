import { describe, it, expect, vi } from "vitest";
import { buildConfirmationPayload, postConfirmation } from "./webhook-client";
import { isAuthorized, amountMatches, resolvePaymentStatus } from "./payment";

const SECRET = "shared-webhook-secret";

describe("buildConfirmationPayload", () => {
  it("defaults to paid and carries the identifier", () => {
    const p = buildConfirmationPayload({ orderId: "o1", amount: 42, secret: SECRET });
    expect(p.paymentStatus).toBe("paid");
    expect(p.orderId).toBe("o1");
    expect(p.secretKey).toBe(SECRET);
    expect(p.orderToken).toBeUndefined();
  });

  it("throws without an identifier, amount, or secret", () => {
    expect(() => buildConfirmationPayload({ amount: 1, secret: SECRET } as any)).toThrow();
    expect(() => buildConfirmationPayload({ orderId: "o1", secret: SECRET } as any)).toThrow();
    expect(() => buildConfirmationPayload({ orderId: "o1", amount: 1, secret: "" })).toThrow();
  });

  // The whole point: a payload built by the client must satisfy the server's checks.
  it("produces a payload the webhook's own verifiers accept", () => {
    const orderTotal = 129.99;
    const p = buildConfirmationPayload({
      orderToken: "tok-123",
      amount: orderTotal,
      secret: SECRET,
      transactionId: "txn_9",
    });

    expect(isAuthorized(p.secretKey, SECRET)).toBe(true);
    expect(amountMatches(p.amount, orderTotal)).toBe(true);
    expect(resolvePaymentStatus(p.paymentStatus)).toBe("paid");
    expect(p.transactionId).toBe("txn_9");
  });

  it("a wrong secret or amount is rejected by the server verifiers", () => {
    const p = buildConfirmationPayload({ orderId: "o1", amount: 100, secret: "attacker" });
    expect(isAuthorized(p.secretKey, SECRET)).toBe(false);
    expect(amountMatches(p.amount, 200)).toBe(false);
  });
});

describe("postConfirmation", () => {
  it("POSTs JSON to the webhook URL via the injected transport", async () => {
    const fake = vi.fn(async () => new Response(JSON.stringify({ success: true }), { status: 200 }));
    const p = buildConfirmationPayload({ orderId: "o1", amount: 10, secret: SECRET });

    const res = await postConfirmation("https://api.example.com/api/orders/webhook", p, fake as any);

    expect(res.status).toBe(200);
    expect(fake).toHaveBeenCalledOnce();
    const [url, init] = fake.mock.calls[0];
    expect(url).toBe("https://api.example.com/api/orders/webhook");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toMatchObject({ orderId: "o1", amount: 10, paymentStatus: "paid", secretKey: SECRET });
  });
});
