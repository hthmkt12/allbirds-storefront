import { 
  categories as mockCategories, 
  products as mockProducts, 
  promoTiles as mockPromoTiles, 
  valueBlocks as mockValueBlocks, 
  reviews as mockReviews 
} from "../data/allbirds-data";
import { CMS_BASE_URL, DEFAULT_SIZES } from "./commerce-config";

export { CMS_BASE_URL };

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
  heroTitle?: string;
  heroSubtitle?: string;
  sortPriority?: number;
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
  slug?: string;
  description?: string;
  productType?: string;
  gender?: 'men' | 'women' | 'unisex';
  salePrice?: string;
  badge?: string;
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

export interface CmsOrder {
  id: string;
  orderToken?: string;
  email: string;
  shippingName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingZip: string;
  items: any[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  paymentMethod?: 'card' | 'qr';
  paymentStatus?: 'unpaid' | 'paid';
  createdAt: string;
  updatedAt: string;
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
          return data.docs.map((prod: any) => {
            let normalizedTags: string[] = [];
            if (Array.isArray(prod.tags)) {
              normalizedTags = prod.tags.map((t: any) => {
                if (typeof t === "string") return t;
                if (t && typeof t === "object") {
                  if ("tag" in t) return t.tag;
                  if ("name" in t) return t.name;
                }
                return String(t);
              });
            }
            let normalizedSizes: number[] = [];
            if (Array.isArray(prod.sizes)) {
              normalizedSizes = prod.sizes.map((s: any) => {
                if (typeof s === "number") return s;
                if (s && typeof s === "object" && "size" in s) return Number(s.size);
                return Number(s);
              }).filter((s: number) => !isNaN(s));
            }
            return {
              ...prod,
              tags: normalizedTags,
              sizes: normalizedSizes.length > 0 ? normalizedSizes : DEFAULT_SIZES,
            };
          });
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

export async function createOrder(orderData: Omit<CmsOrder, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<CmsOrder> {
  try {
    const res = await fetch(`${CMS_BASE_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data = await res.json();
    if (data && data.doc) {
      // Save to local storage for offline tracking/caching
      const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
      localOrders.push(data.doc);
      localStorage.setItem("local_orders", JSON.stringify(localOrders));
      return data.doc;
    }
    throw new Error("Invalid order response structure from CMS");
  } catch (err) {
    console.warn("Failed to create order in CMS, saving to local storage fallback", err);
    // Local fallback
    const mockOrder: CmsOrder = {
      ...orderData,
      id: `local-order-${Date.now()}`,
      orderToken: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `local-token-${Date.now()}`,
      status: "pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const localOrders = JSON.parse(localStorage.getItem("local_orders") || "[]");
    localOrders.push(mockOrder);
    localStorage.setItem("local_orders", JSON.stringify(localOrders));
    return mockOrder;
  }
}

export async function getOrders(email: string): Promise<CmsOrder[]> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const res = await fetchWithTimeout(`${CMS_BASE_URL}/api/orders?where[email][equals]=${encodeURIComponent(cleanEmail)}`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data && Array.isArray(data.docs)) {
      // Merge with local storage orders to ensure offline orders are also visible
      const localOrders: CmsOrder[] = JSON.parse(localStorage.getItem("local_orders") || "[]")
        .filter((o: any) => o.email.trim().toLowerCase() === cleanEmail);
      
      const combined = [...data.docs];
      for (const lo of localOrders) {
        if (!combined.some(o => o.id === lo.id)) {
          combined.push(lo);
        }
      }
      // Sort newest first
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return combined;
    }
    throw new Error("Invalid response from CMS orders endpoint");
  } catch (err) {
    console.warn("Failed to fetch orders from CMS, loading from local storage/mock fallback", err);
    // Offline / fallback loading
    const localOrders: CmsOrder[] = JSON.parse(localStorage.getItem("local_orders") || "[]")
      .filter((o: any) => o.email.trim().toLowerCase() === cleanEmail);
    
    if (localOrders.length > 0) {
      localOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return localOrders;
    }

    // Default mock data if no orders exist at all (useful for initial test visibility)
    return [
      {
        id: "mock-order-1",
        email: cleanEmail,
        shippingName: "Test Customer",
        shippingAddress: "123 Green St",
        shippingCity: "San Francisco",
        shippingState: "CA",
        shippingZip: "94111",
        items: [
          {
            id: "mock-item-1",
            name: "Men's Canvas Runner NZ",
            price: "$100",
            size: 10,
            color: "Deep Navy Stripes",
            image: "/allbirds-hero-linen.png",
            quantity: 1
          }
        ],
        subtotal: 100,
        tax: 8,
        shipping: 0,
        total: 108,
        status: "delivered",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];
  }
}
