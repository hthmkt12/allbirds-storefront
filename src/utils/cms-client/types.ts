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
