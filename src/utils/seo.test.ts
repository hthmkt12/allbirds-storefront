import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  applySeoMetadata,
  restoreBaseSeoMetadata,
  buildProductJsonLd,
  BASE_STORE_TITLE,
  BASE_STORE_DESCRIPTION,
} from "./seo";
import type { CmsProduct } from "./cms-client/types";

describe("SEO & OpenGraph metadata utility", () => {
  beforeEach(() => {
    // Reset head
    document.title = "";
    document.head.innerHTML = "";
  });

  afterEach(() => {
    document.head.innerHTML = "";
  });

  it("updates document title, description, canonical link, and OpenGraph/Twitter tags", () => {
    applySeoMetadata({
      title: "Tree Runner",
      description: "Our signature everyday sneaker made with breezy eucalyptus tree fiber.",
      image: "/tree-runner.png",
      url: "/products/tree-runner",
      type: "product",
    });

    expect(document.title).toBe("Tree Runner | Allbirds");

    const descMeta = document.head.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute("content")).toBe(
      "Our signature everyday sneaker made with breezy eucalyptus tree fiber."
    );

    const canonicalLink = document.head.querySelector('link[rel="canonical"]');
    expect(canonicalLink?.getAttribute("href")).toContain("/products/tree-runner");

    const ogTitle = document.head.querySelector('meta[property="og:title"]');
    expect(ogTitle?.getAttribute("content")).toBe("Tree Runner | Allbirds");

    const ogType = document.head.querySelector('meta[property="og:type"]');
    expect(ogType?.getAttribute("content")).toBe("product");

    const twitterCard = document.head.querySelector('meta[name="twitter:card"]');
    expect(twitterCard?.getAttribute("content")).toBe("summary_large_image");
  });

  it("restores base store metadata when requested", () => {
    applySeoMetadata({
      title: "Custom Page",
      description: "Custom desc",
    });
    expect(document.title).toBe("Custom Page | Allbirds");

    restoreBaseSeoMetadata();
    expect(document.title).toBe(BASE_STORE_TITLE);

    const descMeta = document.head.querySelector('meta[name="description"]');
    expect(descMeta?.getAttribute("content")).toBe(BASE_STORE_DESCRIPTION);
  });

  it("injects and updates Schema.org JSON-LD correctly", () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      name: "Wool Runner",
    };

    applySeoMetadata({
      title: "Wool Runner",
      jsonLd,
    });

    const scriptEl = document.getElementById("dynamic-seo-ldjson") as HTMLScriptElement;
    expect(scriptEl).not.toBeNull();
    expect(scriptEl.type).toBe("application/ld+json");
    expect(JSON.parse(scriptEl.textContent || "{}")).toEqual(jsonLd);
  });

  it("builds valid Product Schema.org JSON-LD from CmsProduct", () => {
    const mockProduct: CmsProduct = {
      name: "Tree Dasher 2",
      price: "$135",
      rating: 4.8,
      fit: "True to size",
      tags: ["Running", "Best Seller"],
      description: "A responsive, bouncy running shoe crafted with FSC-certified natural rubber.",
      colorways: [
        { color: "Blizzard", swatch: "#ffffff", image: "/dasher-blizzard.png" },
        { color: "Thunder", swatch: "#333333", image: "/dasher-thunder.png" },
      ],
      sizes: [8, 9, 10, 11],
    };

    const schema = buildProductJsonLd(mockProduct, "https://allbirds-storefront.pages.dev") as any;

    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Tree Dasher 2");
    expect(schema.description).toContain("responsive, bouncy running shoe");
    expect(schema.brand.name).toBe("Allbirds");
    expect(schema.offers.price).toBe(135);
    expect(schema.offers.priceCurrency).toBe("USD");
    expect(schema.offers.availability).toBe("https://schema.org/InStock");
    expect(schema.aggregateRating.ratingValue).toBe(4.8);
    expect(schema.image).toEqual([
      "https://allbirds-emdash-backend.worldnew.workers.dev/dasher-blizzard.png",
      "https://allbirds-emdash-backend.worldnew.workers.dev/dasher-thunder.png",
    ]);
  });
});
