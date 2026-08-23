import { describe, it, expect } from "vitest";
import { resolveCmsUrl, getImageUrl, getImageSrcSet, getProductColorways } from "./image";
import { CmsProduct } from "./types";

describe("resolveCmsUrl", () => {
  it("returns empty string for falsy input", () => {
    expect(resolveCmsUrl(null)).toBe("");
    expect(resolveCmsUrl(undefined)).toBe("");
  });

  it("passes through absolute and protocol-relative urls", () => {
    expect(resolveCmsUrl("https://cdn.example.com/a.webp")).toBe("https://cdn.example.com/a.webp");
    expect(resolveCmsUrl("//cdn.example.com/a.webp")).toBe("//cdn.example.com/a.webp");
  });

  it("prefixes relative paths with the CMS base url", () => {
    const url = resolveCmsUrl("/media/file.png");
    expect(url.startsWith("http")).toBe(true);
    expect(url.endsWith("/media/file.png")).toBe(true);
  });
});

describe("getImageUrl", () => {
  it("handles strings and media objects", () => {
    expect(getImageUrl("/a.png").endsWith("/a.png")).toBe(true);
    expect(getImageUrl({ url: "/b.png" }).endsWith("/b.png")).toBe(true);
    expect(getImageUrl(undefined)).toBe("");
  });
});

describe("getImageSrcSet", () => {
  it("builds a srcset from responsive sizes", () => {
    const image = {
      url: "/c.png",
      sizes: { "width-480": { url: "/c-480.png" }, "width-768": { url: "/c-768.png" } },
    };
    const result = getImageSrcSet(image);
    expect(result.src.endsWith("/c.png")).toBe(true);
    expect(result.srcSet).toContain("480w");
    expect(result.srcSet).toContain("768w");
  });

  it("returns an empty srcset for plain strings", () => {
    expect(getImageSrcSet("/d.png").srcSet).toBe("");
  });
});

describe("getProductColorways", () => {
  it("returns existing colorways untouched", () => {
    const product = {
      name: "Runner",
      price: "$100",
      fit: "",
      rating: 4.5,
      tags: [],
      colorways: [{ color: "Navy", swatch: "#123", image: "/n.png" }],
    };
    expect(getProductColorways(product)).toEqual(product.colorways);
  });

  it("synthesizes three consistent colorways when missing", () => {
    const product: CmsProduct = { name: "Runner", price: "$100", fit: "", rating: 4.5, tags: [] };
    const colorways = getProductColorways(product);
    expect(colorways).toHaveLength(3);
    expect(colorways[0].color).toBe("Natural Sand");
    expect(colorways.map((c) => c.color)).toEqual(["Natural Sand", "Sage Brush", "Pacific Blue"]);
  });

  it("prefers product color fields for the primary colorway", () => {
    const product: CmsProduct = { name: "R", price: "", fit: "", rating: 0, tags: [], color: "Burlwood", swatch: "#ddd" };
    const colorways = getProductColorways(product);
    expect(colorways[0]).toMatchObject({ color: "Burlwood", swatch: "#ddd" });
  });
});
