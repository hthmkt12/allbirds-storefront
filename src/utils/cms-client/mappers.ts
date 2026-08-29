import { DEFAULT_SIZES } from "../commerce-config";
import { CmsCategory, CmsProduct, CmsReview } from "./types";

export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return [];
  return tags.map((t: unknown) => {
    if (typeof t === "string") return t;
    if (t && typeof t === "object") {
      if ("tag" in t) return String((t as { tag: unknown }).tag);
      if ("name" in t) return String((t as { name: unknown }).name);
    }
    return String(t);
  });
}

export function normalizeSizes(sizes: unknown): number[] {
  const normalized = Array.isArray(sizes)
    ? sizes.map((s: unknown) => {
        if (typeof s === "number") return s;
        if (s && typeof s === "object" && "size" in s) return Number((s as { size: unknown }).size);
        return Number(s);
      }).filter((s: number) => !isNaN(s))
    : [];
  return normalized.length > 0 ? normalized : DEFAULT_SIZES;
}

export function mapProductDoc(prod: Record<string, unknown>): CmsProduct {
  return {
    ...(prod as unknown as CmsProduct),
    tags: normalizeTags(prod.tags),
    sizes: normalizeSizes(prod.sizes),
  };
}

export function mapCategoryDoc(cat: Record<string, unknown>): CmsCategory {
  // Coerce a missing name to "" so malformed CMS docs degrade instead of throwing on toLowerCase().
  const name = String(cat.name ?? "");
  return {
    name,
    slug: (cat.slug as string) || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    cta: cat.cta as string,
    swatch: cat.swatch as string,
    image: (cat.image as CmsCategory["image"]) || "",
  };
}

export function mapReviewDoc(rev: Record<string, unknown>): CmsReview {
  return {
    quote: rev.quote as string,
    customerName: rev.customerName as string,
    detail: rev.detail as string,
  };
}
