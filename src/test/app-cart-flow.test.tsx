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
});
