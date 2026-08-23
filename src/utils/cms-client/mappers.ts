import { DEFAULT_SIZES } from "../commerce-config";
import { CmsCategory, CmsProduct, CmsReview } from "./types";

export function normalizeTags(tags: any): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t: any) => {
    if (typeof t === "string") return t;
    if (t && typeof t === "object") {
      if ("tag" in t) return t.tag;
      if ("name" in t) return t.name;
    }
    return String(t);
  });
}

export function normalizeSizes(sizes: any): number[] {
  if (!Array.isArray(sizes)) return [];
  const normalized = sizes.map((s: any) => {
    if (typeof s === "number") return s;
    if (s && typeof s === "object" && "size" in s) return Number(s.size);
    return Number(s);
  }).filter((s: number) => !isNaN(s));
  return normalized.length > 0 ? normalized : DEFAULT_SIZES;
}

export function mapProductDoc(prod: any): CmsProduct {
  return {
    ...prod,
    tags: normalizeTags(prod.tags),
    sizes: normalizeSizes(prod.sizes),
  };
}

export function mapCategoryDoc(cat: any): CmsCategory {
  return {
    name: cat.name,
    slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cta: cat.cta,
    swatch: cat.swatch,
    image: cat.image || "",
  };
}

export function mapReviewDoc(rev: any): CmsReview {
  return {
    quote: rev.quote,
    customerName: rev.customerName,
    detail: rev.detail,
  };
}
