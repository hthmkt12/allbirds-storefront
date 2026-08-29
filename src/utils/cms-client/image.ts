import { CMS_BASE_URL } from "../commerce-config";
import { CmsProduct } from "./types";

type ImageInput =
  | string
  | {
      url?: string;
      sizes?: Record<string, { url?: string } | undefined>;
    }
  | null
  | undefined;

export function resolveCmsUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
    return url;
  }
  return `${CMS_BASE_URL}${url}`;
}

export function getImageUrl(image: ImageInput): string {
  if (!image) return "";
  if (typeof image === "string") return resolveCmsUrl(image);
  if (image && typeof image === "object" && typeof image.url === "string") {
    return resolveCmsUrl(image.url);
  }
  return "";
}

export function getImageSrcSet(image: ImageInput): { src: string; srcSet: string } {
  const defaultUrl = getImageUrl(image);
  if (!image || typeof image === "string") {
    return { src: defaultUrl, srcSet: "" };
  }

  if (image && typeof image === "object") {
    const sizes = image.sizes;
    if (sizes && typeof sizes === "object") {
      const srcSetParts: string[] = [];
      const widths = [480, 768, 1024, 1280, 1536, 1920];
      for (const w of widths) {
        const sizeKey = `width-${w}`;
        const sizeObj = sizes[sizeKey];
        if (sizeObj && sizeObj.url) {
          srcSetParts.push(`${resolveCmsUrl(sizeObj.url)} ${w}w`);
        }
      }
      if (srcSetParts.length > 0) {
        return {
          src: defaultUrl,
          srcSet: srcSetParts.join(", ")
        };
      }
    }
  }
  return { src: defaultUrl, srcSet: "" };
}

// Single source of truth for colorways when a product has none from the CMS.
export function getProductColorways(product: CmsProduct): NonNullable<CmsProduct["colorways"]> {
  if (product.colorways && product.colorways.length > 0) {
    return product.colorways;
  }
  return [
    { color: product.color || "Natural Sand", swatch: product.swatch || "var(--sand)", image: product.image || "/allbirds-crop-top-left.png" },
    { color: "Sage Brush", swatch: "var(--sage)", image: "/allbirds-mvp-lifestyle.png" },
    { color: "Pacific Blue", swatch: "var(--blue)", image: "/allbirds-travel-promo.png" },
  ];
}
