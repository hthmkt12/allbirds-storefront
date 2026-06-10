import { 
  categories as mockCategories, 
  products as mockProducts, 
  promoTiles as mockPromoTiles, 
  valueBlocks as mockValueBlocks, 
  reviews as mockReviews 
} from "../data/allbirds-data";

export const CMS_BASE_URL = "http://127.0.0.1:3000";

let heroBlocksCache: Promise<CmsHeroBlock[]> | null = null;
let categoriesCache: Promise<CmsCategory[]> | null = null;
let productsCache: Promise<CmsProduct[]> | null = null;
let promoTilesCache: Promise<CmsPromoTile[]> | null = null;
let materialsCache: Promise<CmsMaterial[]> | null = null;
let reviewsCache: Promise<CmsReview[]> | null = null;

async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout = 2000): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export function resolveCmsUrl(url: string | undefined | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//")) {
    return url;
  }
  return `${CMS_BASE_URL}${url}`;
}

export function getImageUrl(image: any): string {
  if (!image) return "";
  if (typeof image === "string") return resolveCmsUrl(image);
  if (image && typeof image === "object" && typeof image.url === "string") {
    return resolveCmsUrl(image.url);
  }
  return "";
}

export interface CmsMediaSize {
  filename: string;
  width: number;
  height: number;
  mimeType: string;
  filesize: number;
  url: string;
}

export interface CmsMedia {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  filesize: number;
  width: number;
  height: number;
  alt?: string;
  sizes?: {
    "width-480"?: CmsMediaSize;
    "width-768"?: CmsMediaSize;
    "width-1024"?: CmsMediaSize;
    "width-1280"?: CmsMediaSize;
    "width-1536"?: CmsMediaSize;
    "width-1920"?: CmsMediaSize;
  };
}

export function getImageSrcSet(image: any): { src: string; srcSet: string } {
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

export interface CmsHeroBlock {
  headline: string;
  body: string;
  ctaLabel: string;
  media?: CmsMedia | string;
  themeSwatch?: string;
}

export interface CmsCategory {
  name: string;
  slug: string;
  cta: string;
  swatch: string;
  image: CmsMedia | string;
}

export interface CmsProduct {
  name: string;
  price: string;
  fit: string;
  rating: number | string;
  tags: string[];
  sizes?: number[];
  colorways?: {
    color: string;
    swatch: string;
    image: CmsMedia | string;
  }[];
  // Static fallback compatibility
  label?: string;
  color?: string;
  swatch?: string;
  image?: string;
  imagePosition?: string;
}

export interface CmsPromoTile {
  title: string;
  swatch: string;
  image: CmsMedia | string;
}

export interface CmsMaterial {
  name: string;
  impactNote: string;
  textureImage?: CmsMedia | string;
  sourceRegion?: string;
}

export interface CmsReview {
  quote: string;
  customerName: string;
  detail: string;
}

export function getHeroBlocks(): Promise<CmsHeroBlock[]> {
  if (!heroBlocksCache) {
    heroBlocksCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/hero-blocks`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs;
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch hero blocks, using fallback", err);
        return [{
          headline: "Wildly Comfortable. Super Natural.",
          body: "All New Dasher NZ Collection",
          ctaLabel: "Shop Men / Shop Women",
          media: "/allbirds-lifestyle-hero.png"
        }];
      }
    })();
  }
  return heroBlocksCache;
}

export function getCategories(): Promise<CmsCategory[]> {
  if (!categoriesCache) {
    categoriesCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/categories`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs.map((cat: any) => ({
            name: cat.name,
            slug: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            cta: cat.cta,
            swatch: cat.swatch,
            image: cat.image || "",
          }));
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch categories, using fallback", err);
        return mockCategories.map((cat) => ({
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          cta: cat.cta,
          swatch: cat.swatch,
          image: cat.image,
        }));
      }
    })();
  }
  return categoriesCache;
}

export function getProducts(): Promise<CmsProduct[]> {
  if (!productsCache) {
    productsCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/products`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs;
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch products, using fallback", err);
        return mockProducts.map((prod) => ({
          name: prod.name,
          price: prod.price,
          fit: prod.fit,
          rating: prod.rating,
          tags: prod.tags || [],
          label: prod.label,
          color: prod.color,
          swatch: prod.swatch,
          image: prod.image,
          sizes: [8, 9, 10, 11, 12, 13, 14, 15],
          colorways: [
            { color: prod.color || "Natural Sand", swatch: prod.swatch || "var(--sand)", image: prod.image || "/allbirds-crop-top-left.png" },
            { color: "Sage Brush", swatch: "var(--sage)", image: "/allbirds-mvp-lifestyle.png" },
            { color: "Pacific Blue", swatch: "var(--blue)", image: "/allbirds-travel-promo.png" }
          ]
        }));
      }
    })();
  }
  return productsCache;
}

export function getPromoTiles(): Promise<CmsPromoTile[]> {
  if (!promoTilesCache) {
    promoTilesCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/promo-tiles`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs;
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch promo tiles, using fallback", err);
        return mockPromoTiles.map((tile) => ({
          title: tile.title,
          swatch: tile.swatch,
          image: tile.image,
        }));
      }
    })();
  }
  return promoTilesCache;
}

export function getMaterials(): Promise<CmsMaterial[]> {
  if (!materialsCache) {
    materialsCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/materials`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs;
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch materials, using fallback", err);
        return mockValueBlocks.map((vb) => ({
          name: vb.title,
          impactNote: vb.body,
        }));
      }
    })();
  }
  return materialsCache;
}

export function getReviews(): Promise<CmsReview[]> {
  if (!reviewsCache) {
    reviewsCache = (async () => {
      try {
        const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/reviews`);
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        if (data && Array.isArray(data.docs) && data.docs.length > 0) {
          return data.docs.map((rev: any) => ({
            quote: rev.quote,
            customerName: rev.customerName,
            detail: rev.detail,
          }));
        }
        throw new Error("Empty docs");
      } catch (err) {
        console.warn("Failed to fetch reviews, using fallback", err);
        return mockReviews.map((rev) => ({
          quote: rev.quote,
          customerName: rev.name,
          detail: rev.detail,
        }));
      }
    })();
  }
  return reviewsCache;
}
