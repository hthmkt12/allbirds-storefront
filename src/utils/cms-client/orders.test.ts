import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createOrder, getOrders } from "./orders";
import { CmsOrder } from "./types";

const orderInput: Omit<CmsOrder, "id" | "status" | "createdAt" | "updatedAt"> = {
  email: "test@example.com",
  shippingName: "Test",
  shippingAddress: "1 St",
  shippingCity: "SF",
  shippingState: "CA",
  shippingZip: "94111",
  items: [],
  subtotal: 100,
  tax: 8,
  shipping: 0,
  total: 108,
};

describe("createOrder", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("stores the CMS doc in local_orders on success", async () => {
    const doc = { ...orderInput, id: "cms-1", status: "pending", createdAt: "", updatedAt: "" };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ doc }),
    });

    const result = await createOrder(orderInput);
    expect(result.id).toBe("cms-1");
    const stored = JSON.parse(localStorage.getItem("local_orders") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("cms-1");
  });

  it("falls back to a local pending order when the CMS is unreachable", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const result = await createOrder(orderInput);
    expect(result.id.startsWith("local-order-")).toBe(true);
    expect(result.status).toBe("pending");
    expect(result.orderToken).toBeTruthy();
    const stored = JSON.parse(localStorage.getItem("local_orders") || "[]");
    expect(stored).toHaveLength(1);
  });

  it("passes an abort signal to fetch (timeout wiring)", async () => {
    const doc = { ...orderInput, id: "cms-1", status: "pending", createdAt: "", updatedAt: "" };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ doc }),
    });

    await createOrder(orderInput);
    const options = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1];
    expect(options.signal).toBeInstanceOf(AbortSignal);
    expect(options.method).toBe("POST");
  });

  it("recovers when local_orders holds corrupt JSON (success path)", async () => {
    localStorage.setItem("local_orders", "{not valid json");
    const doc = { ...orderInput, id: "cms-1", status: "pending", createdAt: "", updatedAt: "" };
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({ doc }),
    });

    const result = await createOrder(orderInput);
    expect(result.id).toBe("cms-1");
    const stored = JSON.parse(localStorage.getItem("local_orders") || "[]");
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe("cms-1");
  });

  it("recovers when local_orders holds corrupt JSON (fallback path)", async () => {
    localStorage.setItem("local_orders", "{not valid json");
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const result = await createOrder(orderInput);
    expect(result.id.startsWith("local-order-")).toBe(true);
    const stored = JSON.parse(localStorage.getItem("local_orders") || "[]");
    expect(stored).toHaveLength(1);
  });
});

describe("getOrders", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("returns the default mock order offline when nothing is stored", async () => {
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const orders = await getOrders("test@example.com");
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe("mock-order-1");
    expect(orders[0].email).toBe("test@example.com");
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("refreshes locally-known orders through the token lookup endpoint", async () => {
    const localOrder = {
      ...orderInput,
      id: "local-1",
      orderToken: "tok-12345678",
      status: "pending",
      createdAt: "2026-01-03",
      updatedAt: "",
    };
    const cmsOrder = { ...orderInput, id: "cms-1", status: "pending", createdAt: "2026-01-02", updatedAt: "" };
    localStorage.setItem("local_orders", JSON.stringify([localOrder]));
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockImplementation(async (url: RequestInfo | URL) => ({
      ok: true,
      json: async () => {
        expect(String(url)).toContain("/api/orders/lookup");
        return { docs: [cmsOrder] };
      },
    }));

    const orders = await getOrders("Test@Example.com ");
    expect(orders.map((o) => o.id)).toEqual(["local-1", "cms-1"]);
  });

  it("returns the default mock order when local_orders holds corrupt JSON", async () => {
    localStorage.setItem("local_orders", "{not valid json");
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const orders = await getOrders("test@example.com");
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe("mock-order-1");
  });

  it("keeps the local copy when the lookup endpoint is unreachable", async () => {
    const localOrder = {
      ...orderInput,
      id: "local-1",
      orderToken: "tok-12345678",
      status: "pending",
      createdAt: "2026-01-03",
      updatedAt: "",
    };
    localStorage.setItem("local_orders", JSON.stringify([localOrder]));
    (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));

    const orders = await getOrders("test@example.com");
    expect(orders.map((o) => o.id)).toEqual(["local-1"]);
  });
});
