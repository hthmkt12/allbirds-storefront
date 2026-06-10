export type Product = {
  name: string;
  label?: string;
  color: string;
  price: string;
  swatch: string;
  image: string;
  fit: string;
  rating: string;
  tags: string[];
};

export type Category = {
  name: string;
  cta: string;
  swatch: string;
  image: string;
};

export const categories: Category[] = [
  { name: "New Arrivals", cta: "Shop Men / Shop Women", swatch: "#c8d3d8", image: "/allbirds-crop-top-left.png" },
  { name: "Mens", cta: "Shop Men", swatch: "#4b4440", image: "/allbirds-lifestyle-hero.png" },
  { name: "Womens", cta: "Shop Women", swatch: "#6c504c", image: "/allbirds-mvp-lifestyle.png" },
  { name: "Best Sellers", cta: "Shop Men / Shop Women", swatch: "#536054", image: "/allbirds-travel-promo.png" },
];

export const products: Product[] = [
  {
    name: "Men's Canvas Runner NZ",
    label: "New Color",
    color: "Deep Navy Stripes",
    price: "$100",
    swatch: "#e0dacf",
    image: "/allbirds-crop-top-left.png",
    fit: "True to size",
    rating: "4.7",
    tags: ["Canvas", "Lightweight"],
  },
  {
    name: "Women's Tree Glider",
    label: "New Color",
    color: "Burlwood",
    price: "$140",
    swatch: "#d4d9cf",
    image: "/allbirds-crop-top-right.png",
    fit: "Runs narrow",
    rating: "4.8",
    tags: ["Tree Fiber", "Breathable"],
  },
  {
    name: "Men's Canvas Cruiser",
    color: "Sea Spray",
    price: "$75",
    swatch: "#c8d3d8",
    image: "/allbirds-crop-bottom-left.png",
    fit: "Relaxed fit",
    rating: "4.6",
    tags: ["Canvas", "Travel"],
  },
  {
    name: "Women's Breezer Mary Jane",
    label: "New Color",
    color: "Dusty Pink",
    price: "$115",
    swatch: "#d1b0a4",
    image: "/allbirds-crop-bottom-right.png",
    fit: "True to size",
    rating: "4.5",
    tags: ["Mary Jane", "Breezy"],
  },
  {
    name: "Men's Dasher NZ",
    label: "New Color",
    color: "Seagrass",
    price: "$140",
    swatch: "#d4d9cf",
    image: "/allbirds-crop-top-right.png",
    fit: "Performance fit",
    rating: "4.9",
    tags: ["Running", "Cushioned"],
  },
  {
    name: "Women's Varsity Strap",
    label: "New Color",
    color: "Burlwood",
    price: "$115",
    swatch: "#e0dacf",
    image: "/allbirds-crop-top-left.png",
    fit: "Adjustable strap",
    rating: "4.6",
    tags: ["Retro", "Everyday"],
  },
  {
    name: "Men's Cruiser Slip On Terry",
    label: "New",
    color: "Ochre / Warm White",
    price: "$110",
    swatch: "#d1b0a4",
    image: "/allbirds-crop-bottom-right.png",
    fit: "Easy slip-on",
    rating: "4.7",
    tags: ["Terry", "Travel"],
  },
  {
    name: "Women's Canvas Cruiser",
    color: "Stormy Lilac",
    price: "$75",
    swatch: "#c8d3d8",
    image: "/allbirds-crop-bottom-left.png",
    fit: "Relaxed fit",
    rating: "4.5",
    tags: ["Canvas", "Low Profile"],
  },
];

export const promoTiles = [
  { title: "Spring Travel Essentials", swatch: "#e0dacf", image: "/allbirds-travel-promo.png" },
  { title: "New Arrivals", swatch: "#d4d9cf", image: "/allbirds-mvp-lifestyle.png" },
  { title: "Fresh Colors For Spring", swatch: "#c8d3d8", image: "/allbirds-crop-top-left.png" },
];

export const valueBlocks = [
  {
    title: "Wear All Day Comfort",
    body: "Lightweight, bouncy, and wildly comfortable shoes for any outing.",
  },
  {
    title: "Sustainability In Every Step",
    body: "Materials, transport, and packaging are selected with lower impact in mind.",
  },
  {
    title: "Materials From The Earth",
    body: "Wool, tree fiber, and sugarcane replace petroleum-based synthetics where possible.",
  },
];

export const materialMetrics = [
  { value: "7", label: "natural material families" },
  { value: "8.2M", label: "pairs designed with lower-impact inputs" },
  { value: "0", label: "unnecessary visual noise in the buying flow" },
];

export const reviews = [
  {
    quote: "The lightest shoe I packed for a two-week trip. It still looked clean by the flight home.",
    name: "Maya R.",
    detail: "Tree Glider, Burlwood",
  },
  {
    quote: "Soft enough for errands, structured enough for the office commute.",
    name: "Daniel K.",
    detail: "Canvas Runner NZ",
  },
  {
    quote: "The colorways feel grown up. Easy to wear with everything.",
    name: "Nina P.",
    detail: "Canvas Cruiser",
  },
];

export const footerGroups = [
  { title: "Help", links: ["Contact Us", "Returns", "Shipping", "Track Order"] },
  { title: "Shop", links: ["Men's Shoes", "Women's Shoes", "Socks", "Sale"] },
  { title: "Company", links: ["Our Story", "Materials", "Stores", "Sustainability"] },
];

export const payloadModels = [
  {
    name: "heroBlocks",
    fields: ["headline", "body", "ctaLabel", "media", "themeSwatch"],
  },
  {
    name: "categories",
    fields: ["name", "slug", "description", "swatch", "heroImage"],
  },
  {
    name: "products",
    fields: ["name", "sku", "price", "category", "materials", "colorways", "rating"],
  },
  {
    name: "materials",
    fields: ["name", "impactNote", "textureImage", "sourceRegion"],
  },
  {
    name: "reviews",
    fields: ["product", "quote", "rating", "customerName", "featured"],
  },
  {
    name: "useCaseRules",
    fields: ["role", "canDo", "cannotDo", "errorCase", "enforcedBy"],
  },
];

export const workflowRules = [
  "Visitor can browse collections and product details.",
  "Customer can select size/color and start checkout.",
  "Editor can manage product content in Payload CMS.",
  "Admin can publish collections and enforce inventory rules.",
];
