import {
  categories as mockCategories,
  products as mockProducts,
  promoTiles as mockPromoTiles,
  valueBlocks as mockValueBlocks,
  reviews as mockReviews
} from "../../data/allbirds-data";
import { CMS_BASE_URL, DEFAULT_SIZES } from "../commerce-config";
import { CmsCategory, CmsHeroBlock, CmsMaterial, CmsProduct, CmsPromoTile, CmsReview } from "./types";
import { mapCategoryDoc, mapProductDoc, mapReviewDoc } from "./mappers";
import { fetchWithTimeout } from "./fetch";

let heroBlocksCache: Promise<CmsHeroBlock[]> | null = null;
let categoriesCache: Promise<CmsCategory[]> | null = null;
let productsCache: Promise<CmsProduct[]> | null = null;
let promoTilesCache: Promise<CmsPromoTile[]> | null = null;
let materialsCache: Promise<CmsMaterial[]> | null = null;
let reviewsCache: Promise<CmsReview[]> | null = null;

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
          return data.docs.map(mapCategoryDoc);
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
          return data.docs.map(mapProductDoc);
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
          sizes: DEFAULT_SIZES,
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
          return data.docs.map(mapReviewDoc);
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
