import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { OrderTrackingView } from "./order-tracking-view";
import * as cmsClient from "../utils/cms-client";

describe("OrderTrackingView", () => {
  const mockOrder: cmsClient.CmsOrder = {
    id: "ord-test-12345",
    orderToken: "tok-test-12345",
    email: "customer@example.com",
    shippingName: "John Doe",
    shippingAddress: "123 Market St",
    shippingCity: "San Francisco",
    shippingState: "CA",
    shippingZip: "94105",
    items: [
      {
        id: "item-1",
        name: "Tree Dasher 2",
        price: "$135",
        size: 10,
        color: "Blizzard",
        image: "/tree-dasher.png",
        quantity: 1,
      },
    ],
    subtotal: 135,
    tax: 10.8,
    shipping: 0,
    total: 145.8,
    status: "shipped",
    paymentStatus: "paid",
    createdAt: "2026-03-01T10:00:00Z",
    updatedAt: "2026-03-02T12:00:00Z",
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders order tracking form and inputs", () => {
    render(<OrderTrackingView onNavigate={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Track Your Order", level: 1 })).toBeInTheDocument();
    expect(screen.getByLabelText(/order email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/order number or token/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /track order/i })).toBeInTheDocument();
  });

  it("performs lookup and displays order details with progress stepper", async () => {
    vi.spyOn(cmsClient, "lookupOrder").mockResolvedValue(mockOrder);

    render(<OrderTrackingView onNavigate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/order email/i), {
      target: { value: "customer@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/order number or token/i), {
      target: { value: "ord-test-12345" },
    });
    fireEvent.click(screen.getByRole("button", { name: /track order/i }));

    await waitFor(() => {
      expect(screen.getByText(/order #ST-12345/i)).toBeInTheDocument();
    });

    expect(screen.getByText("Tree Dasher 2")).toBeInTheDocument();
    expect(screen.getByText(/123 market st/i)).toBeInTheDocument();
    expect(screen.getByText("$145.80")).toBeInTheDocument();
    expect(screen.getByText("In Transit")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();

    const progressbar = screen.getByRole("progressbar", { name: /order fulfillment progress/i });
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute("aria-valuenow", "2");
    expect(progressbar).toHaveAttribute("aria-valuetext", "In Transit");
  });

  it("shows error alert when order is not found", async () => {
    vi.spyOn(cmsClient, "lookupOrder").mockResolvedValue(null);

    render(<OrderTrackingView onNavigate={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/order email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/order number or token/i), {
      target: { value: "invalid-id" },
    });
    fireEvent.click(screen.getByRole("button", { name: /track order/i }));

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/we could not find an order matching that email and order number/i)
    ).toBeInTheDocument();
  });
});
