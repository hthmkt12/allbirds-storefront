import { describe, it, expect } from "vitest";
import {
  timingSafeEqual,
  isAuthorized,
  resolvePaymentStatus,
  amountMatches,
  orderStatusFor,
} from "./payment";

describe("webhook authentication", () => {
  it("accepts the exact secret and rejects a wrong one", () => {
    expect(isAuthorized("s3cret", "s3cret")).toBe(true);
    expect(isAuthorized("wrong", "s3cret")).toBe(false);
  });

  it("fails closed when no secret is configured", () => {
    expect(isAuthorized("anything", null)).toBe(false);
    expect(isAuthorized("anything", "")).toBe(false);
    expect(isAuthorized("anything", undefined)).toBe(false);
  });

  it("rejects non-string / missing provided keys", () => {
    expect(isAuthorized(undefined, "s3cret")).toBe(false);
    expect(isAuthorized(12345, "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
  });

  it("timingSafeEqual handles length mismatch without throwing", () => {
    expect(timingSafeEqual("abc", "abcdef")).toBe(false);
    expect(timingSafeEqual("abc", "abc")).toBe(true);
  });
});

describe("payment status resolution", () => {
  it("preserves explicit failed / unpaid, defaults everything else to paid", () => {
    expect(resolvePaymentStatus("failed")).toBe("failed");
    expect(resolvePaymentStatus("unpaid")).toBe("unpaid");
    expect(resolvePaymentStatus("paid")).toBe("paid");
    expect(resolvePaymentStatus(undefined)).toBe("paid");
    expect(resolvePaymentStatus("garbage")).toBe("paid");
  });

  it("maps paid -> confirmed, everything else -> pending", () => {
    expect(orderStatusFor("paid")).toBe("confirmed");
    expect(orderStatusFor("failed")).toBe("pending");
    expect(orderStatusFor("unpaid")).toBe("pending");
  });
});

describe("amount verification", () => {
  it("matches within one cent and rejects drift or non-numbers", () => {
    expect(amountMatches(100, 100)).toBe(true);
    expect(amountMatches(100.009, 100)).toBe(true);
    expect(amountMatches(99, 100)).toBe(false);
    expect(amountMatches("100", 100)).toBe(false);
    expect(amountMatches(undefined, 100)).toBe(false);
    expect(amountMatches(NaN, 100)).toBe(false);
  });
});
