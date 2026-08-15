import { describe, it, expect } from "vitest";
import {
  validateLuhn,
  validateExpiry,
  validateCvv,
  validateShippingForm,
  validateCard,
  parsePrice,
  fmt,
  computeTotals,
} from "./validation";

describe("Checkout Validation & Math Utils", () => {
  describe("parsePrice & fmt", () => {
    it("parses price strings correctly", () => {
      expect(parsePrice("$98")).toBe(98);
      expect(parsePrice("$120.50")).toBe(120.5);
      expect(parsePrice("invalid")).toBe(0);
      expect(parsePrice("")).toBe(0);
    });

    it("formats numbers without trailing zeros when integer", () => {
      expect(fmt(100)).toBe("100");
      expect(fmt(98.5)).toBe("98.50");
      expect(fmt(98.555)).toBe("98.56");
    });
  });

  describe("validateLuhn", () => {
    it("validates correct card numbers", () => {
      expect(validateLuhn("4111111111111111")).toBe(true);
      expect(validateLuhn("4111 1111 1111 1111")).toBe(true);
    });

    it("rejects invalid card numbers", () => {
      expect(validateLuhn("1234567812345678")).toBe(false);
      expect(validateLuhn("123")).toBe(false);
      expect(validateLuhn("")).toBe(false);
    });
  });

  describe("validateExpiry", () => {
    it("accepts valid future expiration dates", () => {
      expect(validateExpiry("12/30")).toBe(true);
      expect(validateExpiry("08/29")).toBe(true);
    });

    it("rejects invalid format or expired dates", () => {
      expect(validateExpiry("13/30")).toBe(false);
      expect(validateExpiry("00/30")).toBe(false);
      expect(validateExpiry("05/20")).toBe(false);
      expect(validateExpiry("2026/05")).toBe(false);
      expect(validateExpiry("invalid")).toBe(false);
    });
  });

  describe("validateCvv", () => {
    it("accepts 3 or 4 digit CVVs", () => {
      expect(validateCvv("123")).toBe(true);
      expect(validateCvv("1234")).toBe(true);
    });

    it("rejects invalid CVVs", () => {
      expect(validateCvv("12")).toBe(false);
      expect(validateCvv("12345")).toBe(false);
      expect(validateCvv("abc")).toBe(false);
    });
  });

  describe("validateShippingForm", () => {
    it("returns errors when required fields are missing", () => {
      const errors = validateShippingForm({
        email: "",
        fullName: "",
        address: "",
        city: "",
        state: "",
        zip: "",
      });
      expect(Object.keys(errors).length).toBe(6);
    });

    it("validates email format", () => {
      const errors = validateShippingForm({
        email: "not-an-email",
        fullName: "John Doe",
        address: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94101",
      });
      expect(errors.email).toBe("Enter a valid email address");
    });

    it("passes when all fields are valid", () => {
      const errors = validateShippingForm({
        email: "test@example.com",
        fullName: "John Doe",
        address: "123 Main St",
        city: "San Francisco",
        state: "CA",
        zip: "94101",
      });
      expect(Object.keys(errors).length).toBe(0);
    });
  });

  describe("validateCard", () => {
    it("returns errors for empty fields", () => {
      const errors = validateCard("", "", "");
      expect(errors.cardNumber).toBe("Card Number is required");
      expect(errors.cardExpiry).toBe("Expiration Date is required");
      expect(errors.cardCvv).toBe("CVV is required");
    });

    it("returns format errors for invalid inputs", () => {
      const errors = validateCard("1234", "13/20", "1");
      expect(errors.cardNumber).toBe("Invalid Card Number");
      expect(errors.cardExpiry).toBe("Invalid Expiration Date");
      expect(errors.cardCvv).toBe("Invalid CVV");
    });
  });

  describe("computeTotals", () => {
    it("computes subtotal, tax (8%), and flat shipping when subtotal < 150", () => {
      const cart = [
        {
          id: "1",
          name: "Item 1",
          price: "$100",
          size: 10,
          color: "Black",
          image: "/img.png",
          quantity: 1,
        },
      ];
      const totals = computeTotals(cart);
      expect(totals.subtotal).toBe(100);
      expect(totals.tax).toBe(8); // 8% of 100
      expect(totals.shipping).toBe(7.5);
      expect(totals.total).toBe(115.5);
    });

    it("grants free shipping when subtotal >= 150", () => {
      const cart = [
        {
          id: "1",
          name: "Item 1",
          price: "$150",
          size: 10,
          color: "Black",
          image: "/img.png",
          quantity: 1,
        },
      ];
      const totals = computeTotals(cart);
      expect(totals.subtotal).toBe(150);
      expect(totals.tax).toBe(12);
      expect(totals.shipping).toBe(0);
      expect(totals.total).toBe(162);
    });
  });
});
