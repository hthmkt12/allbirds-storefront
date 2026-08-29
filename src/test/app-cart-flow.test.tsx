import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, within, fireEvent, cleanup } from "@testing-library/react";
import App from "../App";
import { products as mockProducts } from "../data/allbirds-data";

describe("App cart flow (offline CMS fallback)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    cleanup();
  });

  const firstProductCard = () => {
    const cards = screen
      .getAllByRole("article")
      .filter((a) => within(a).queryByRole("button", { name: "Add to Bag" }));
    expect(cards.length).toBeGreaterThan(0);
    return cards[0];
  };

  it("renders the storefront with fallback products", async () => {
    render(<App />);
    expect(await screen.findByText(mockProducts[0].name)).toBeTruthy();
    expect(screen.getByRole("banner")).toBeTruthy();
  });

  it("adds a product with a selected size and opens the cart drawer", async () => {
    render(<App />);
    await screen.findByText(mockProducts[0].name);

    const firstCard = firstProductCard();
    fireEvent.click(within(firstCard).getByRole("button", { name: "8" }));
    fireEvent.click(within(firstCard).getByRole("button", { name: "Add to Bag" }));

    const cart = screen.getByRole("dialog", { name: "Shopping Cart" });
    expect(within(cart).getByText(mockProducts[0].name)).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].size).toBe(8);
  });

  it("updates quantity from the drawer and keeps it at 1 minimum", async () => {
    render(<App />);
    await screen.findByText(mockProducts[0].name);

    const firstCard = firstProductCard();
    fireEvent.click(within(firstCard).getByRole("button", { name: "8" }));
    fireEvent.click(within(firstCard).getByRole("button", { name: "Add to Bag" }));

    const cart = screen.getByRole("dialog", { name: "Shopping Cart" });
    const plus = within(cart).getByRole("button", { name: "+" });
    const minus = within(cart).getByRole("button", { name: "-" });

    fireEvent.click(plus);
    expect(within(cart).getByText("2")).toBeTruthy();

    fireEvent.click(minus);
    fireEvent.click(minus);
    expect(within(cart).getByText("1")).toBeTruthy();
  });

  it("removes the only item and persists an empty cart", async () => {
    render(<App />);
    await screen.findByText(mockProducts[0].name);

    const firstCard = firstProductCard();
    fireEvent.click(within(firstCard).getByRole("button", { name: "8" }));
    fireEvent.click(within(firstCard).getByRole("button", { name: "Add to Bag" }));

    const cart = screen.getByRole("dialog", { name: "Shopping Cart" });
    fireEvent.click(within(cart).getByRole("button", { name: "Remove" }));

    expect(cart.querySelectorAll(".cart-item")).toHaveLength(0);
    expect(JSON.parse(localStorage.getItem("cart") || "[]")).toHaveLength(0);
  });

  it("navigates to checkout and completes payment successfully", async () => {
    render(<App />);
    await screen.findByText(mockProducts[0].name);

    // 1. Add product to cart
    const firstCard = firstProductCard();
    fireEvent.click(within(firstCard).getByRole("button", { name: "8" }));
    fireEvent.click(within(firstCard).getByRole("button", { name: "Add to Bag" }));

    // 2. Click Proceed to Checkout
    const cartDialog = screen.getByRole("dialog", { name: "Shopping Cart" });
    const checkoutBtn = within(cartDialog).getByRole("button", { name: "Proceed to Checkout" });
    fireEvent.click(checkoutBtn);

    // 3. Verify Checkout Form appears
    const emailInput = await screen.findByLabelText("Email");
    const nameInput = screen.getByLabelText("Full Name");
    const addressInput = screen.getByLabelText("Street Address");
    const cityInput = screen.getByLabelText("City");
    const stateInput = screen.getByLabelText("State");
    const zipInput = screen.getByLabelText("Zip Code");

    fireEvent.change(emailInput, { target: { value: "customer@example.com" } });
    fireEvent.change(nameInput, { target: { value: "John Doe" } });
    fireEvent.change(addressInput, { target: { value: "123 Green St" } });
    fireEvent.change(cityInput, { target: { value: "San Francisco" } });
    fireEvent.change(stateInput, { target: { value: "CA" } });
    fireEvent.change(zipInput, { target: { value: "94107" } });

    // 4. Continue to Payment
    const continueBtn = screen.getByRole("button", { name: /continue to payment/i });
    fireEvent.click(continueBtn);

    // 5. Fill Card details and Place Order
    const cardInput = await screen.findByLabelText(/Card Number/i);
    const expInput = screen.getByLabelText(/Expiration/i);
    const cvvInput = screen.getByLabelText(/CVV\/CVC/i);

    fireEvent.change(cardInput, { target: { value: "4242 4242 4242 4242" } });
    fireEvent.change(expInput, { target: { value: "12/28" } });
    fireEvent.change(cvvInput, { target: { value: "123" } });

    const payBtn = screen.getByRole("button", { name: /place order/i });
    fireEvent.click(payBtn);

    // 6. Confirmation screen
    expect(await screen.findByText(/Order Placed Successfully!/i, {}, { timeout: 4000 })).toBeTruthy();
    expect(JSON.parse(localStorage.getItem("cart") || "[]")).toHaveLength(0);
  });
});
