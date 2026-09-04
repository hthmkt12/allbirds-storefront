import { useEffect } from "react";
import type { CmsProduct } from "./cms-client/types";
import { getImageUrl } from "./cms-client/image";

export interface SeoMetadataConfig {
  title: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "product";
  jsonLd?: Record<string, unknown>;
}

export const BASE_STORE_TITLE = "Allbirds Natural Materials Storefront";
export const BASE_STORE_DESCRIPTION =
  "Allbirds-inspired storefront crafted with natural materials, quiet editorial design, and high-performance Cloudflare edge backend.";

function toAbsoluteUrl(url?: string, baseUrl?: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  if (baseUrl) {
    const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBase}${cleanPath}`;
  }
  if (typeof window !== "undefined" && window.location?.origin) {
    return `${window.location.origin}${cleanPath}`;
  }
  return url;
}

function updateMetaTag(attribute: "name" | "property", key: string, content?: string) {
  if (typeof document === "undefined") return;
  const selector = `meta[${attribute}="${key}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (content === undefined || content === null || content === "") {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

function updateCanonicalLink(url?: string) {
  if (typeof document === "undefined") return;
  let element = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!url) {
    if (element) element.remove();
    return;
  }
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }
  element.setAttribute("href", toAbsoluteUrl(url));
}

const DYNAMIC_LD_JSON_ID = "dynamic-seo-ldjson";

function updateJsonLd(jsonLd?: Record<string, unknown>) {
  if (typeof document === "undefined") return;
  let scriptEl = document.getElementById(DYNAMIC_LD_JSON_ID) as HTMLScriptElement | null;

  if (!jsonLd) {
    if (scriptEl) scriptEl.remove();
    return;
  }

  if (!scriptEl) {
    scriptEl = document.createElement("script");
    scriptEl.id = DYNAMIC_LD_JSON_ID;
    scriptEl.type = "application/ld+json";
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(jsonLd);
}

export function applySeoMetadata(config: SeoMetadataConfig): void {
  if (typeof document === "undefined") return;

  const fullTitle = config.title === BASE_STORE_TITLE
    ? BASE_STORE_TITLE
    : `${config.title} | Allbirds`;

  document.title = fullTitle;

  const description = config.description || BASE_STORE_DESCRIPTION;
  const canonicalUrl = toAbsoluteUrl(config.url);
  const imageUrl = toAbsoluteUrl(config.image || "/allbirds-lifestyle-hero.png");
  const ogType = config.type || "website";

  // Standard meta tags
  updateMetaTag("name", "description", description);
  updateCanonicalLink(canonicalUrl);

  // OpenGraph tags
  updateMetaTag("property", "og:title", fullTitle);
  updateMetaTag("property", "og:description", description);
  updateMetaTag("property", "og:type", ogType);
  updateMetaTag("property", "og:url", canonicalUrl);
  updateMetaTag("property", "og:image", imageUrl);

  // Twitter tags
  updateMetaTag("name", "twitter:card", "summary_large_image");
  updateMetaTag("name", "twitter:title", fullTitle);
  updateMetaTag("name", "twitter:description", description);
  updateMetaTag("name", "twitter:image", imageUrl);

  // Schema.org JSON-LD
  updateJsonLd(config.jsonLd);
}

export function restoreBaseSeoMetadata(): void {
  applySeoMetadata({
    title: BASE_STORE_TITLE,
    description: BASE_STORE_DESCRIPTION,
    url: typeof window !== "undefined" ? window.location.origin + "/" : "/",
    image: "/allbirds-lifestyle-hero.png",
    type: "website",
  });
}

export function buildProductJsonLd(
  product: CmsProduct,
  baseUrl?: string
): Record<string, unknown> {
  const origin = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const productUrl = `${origin}/products/${productSlug}`;

  const cleanPrice = parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0;
  const images = (product.colorways || [])
    .map((c) => toAbsoluteUrl(getImageUrl(c.image), origin))
    .filter(Boolean);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.description ||
      `Experience incredible comfort with the Allbirds ${product.name}, crafted with sustainable natural materials.`,
    url: productUrl,
    image: images.length > 0 ? images : [toAbsoluteUrl("/allbirds-lifestyle-hero.png", origin)],
    brand: {
      "@type": "Brand",
      name: "Allbirds",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: cleanPrice,
      availability: "https://schema.org/InStock",
      url: productUrl,
    },
  };

  const ratingNum = typeof product.rating === "number" ? product.rating : parseFloat(product.rating || "0");
  if (ratingNum > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingNum,
      reviewCount: 128,
    };
  }

  return jsonLd;
}

export function useSeoMetadata(config: SeoMetadataConfig): void {
  useEffect(() => {
    applySeoMetadata(config);

    return () => {
      // Clean up dynamic LD+JSON and reset to base when unmounting
      updateJsonLd(undefined);
    };
  }, [config.title, config.description, config.image, config.url, config.type, JSON.stringify(config.jsonLd)]);
}
