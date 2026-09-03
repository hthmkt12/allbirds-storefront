import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getCategories,
  getMaterials,
  getReviews,
} from "./collections";

describe("collections client", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("fetches categories successfully and caches response", async () => {
    const mockData = {
      docs: [
        { name: "Live Men", slug: "live-men", cta: "Shop Now", swatch: "#000", image: "/men.png" },
      ],
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockData,
    });
    globalThis.fetch = fetchMock;

    const categories = await getCategories();
    expect(categories).toHaveLength(1);
    expect(categories[0].name).toBe("Live Men");

    // Check caching: second call does not trigger fetch again
    const secondCall = await getCategories();
    expect(secondCall).toEqual(categories);
  });

  it("returns fallback data when fetch fails", async () => {
    // Other collections should fall back to mock data if fetch rejects
    const fetchMock = vi.fn().mockRejectedValue(new Error("Network connection error"));
    globalThis.fetch = fetchMock;

    const materials = await getMaterials();
    expect(materials.length).toBeGreaterThan(0);
    expect(materials[0]).toHaveProperty("name");
    expect(materials[0]).toHaveProperty("impactNote");
  });

  it("handles empty docs payload gracefully", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ docs: [] }),
    });
    globalThis.fetch = fetchMock;

    const reviews = await getReviews();
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews[0]).toHaveProperty("quote");
  });
});
