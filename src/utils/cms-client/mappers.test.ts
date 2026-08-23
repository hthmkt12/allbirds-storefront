import { describe, it, expect } from "vitest";
import { normalizeTags, normalizeSizes, mapProductDoc, mapCategoryDoc, mapReviewDoc } from "./mappers";
import { DEFAULT_SIZES } from "../commerce-config";

describe("normalizeTags", () => {
  it("passes through string arrays", () => {
    expect(normalizeTags(["New", "Sale"])).toEqual(["New", "Sale"]);
  });

  it("maps object shapes with tag or name keys", () => {
    expect(normalizeTags([{ tag: "New" }, { name: "Sale" }])).toEqual(["New", "Sale"]);
  });

  it("stringifies unknown entries and handles missing arrays", () => {
    expect(normalizeTags([42])).toEqual(["42"]);
    expect(normalizeTags(undefined)).toEqual([]);
  });
});

describe("normalizeSizes", () => {
  it("keeps numeric sizes and extracts object sizes", () => {
    expect(normalizeSizes([8, { size: 9 }, "10"])).toEqual([8, 9, 10]);
  });

  it("filters NaN values", () => {
    expect(normalizeSizes([8, "abc", {}])).toEqual([8]);
  });

  it("falls back to DEFAULT_SIZES when nothing usable remains", () => {
    expect(normalizeSizes([])).toEqual(DEFAULT_SIZES);
    expect(normalizeSizes(undefined)).toEqual(DEFAULT_SIZES);
  });
});

describe("mapProductDoc", () => {
  it("normalizes tags and sizes while preserving other fields", () => {
    const doc = mapProductDoc({
      name: "Runner",
      price: "$100",
      tags: [{ tag: "New" }],
      sizes: [7, 8],
      fit: "True to size",
    });
    expect(doc.tags).toEqual(["New"]);
    expect(doc.sizes).toEqual([7, 8]);
    expect(doc.name).toBe("Runner");
  });
});

describe("mapCategoryDoc", () => {
  it("derives a slug from the name when missing", () => {
    expect(mapCategoryDoc({ name: "Best Sellers", cta: "", swatch: "" }).slug).toBe("best-sellers");
  });
});

describe("mapReviewDoc", () => {
  it("picks the customer fields", () => {
    expect(mapReviewDoc({ quote: "q", customerName: "Ana", detail: "d" })).toEqual({
      quote: "q",
      customerName: "Ana",
      detail: "d",
    });
  });
});
