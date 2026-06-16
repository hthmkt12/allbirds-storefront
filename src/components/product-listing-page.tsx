import { useState, useEffect } from "react";
import { getProducts, CmsProduct } from "../utils/cms-client";
import { ProductCard } from "./commerce-sections";
import { FilterSortBar, FilterState, SortKey, applyFiltersAndSort } from "./filter-sort-bar";

// Map collection slugs to display labels and audience filters
const COLLECTION_META: Record<
  string,
  { label: string; hero: string; audience?: "men" | "women" | null }
> = {
  mens: { label: "Men's", hero: "Shop the Men's Collection", audience: "men" },
  womens: { label: "Women's", hero: "Shop the Women's Collection", audience: "women" },
  sale: { label: "Sale", hero: "Up to 30% Off - While Supplies Last", audience: null },
  "best-sellers": { label: "Best Sellers", hero: "Our Most-Loved Shoes", audience: null },
  "new-arrivals": { label: "New Arrivals", hero: "Fresh Drops - New Colorways & Styles", audience: null },
};

function filterByCollection(products: CmsProduct[], slug: string): CmsProduct[] {
  if (slug === "mens") return products.filter((p) => p.name.includes("Men's"));
  if (slug === "womens") return products.filter((p) => p.name.includes("Women's"));
  if (slug === "sale") {
    // Treat products tagged "Sale" or with price < $100 as sale items
    return products.filter((p) => {
      const price = parseFloat((p.price || "0").replace(/[^0-9.]/g, ""));
      return (p.tags || []).includes("Sale") || price < 100;
    });
  }
  if (slug === "best-sellers") {
    return products.filter((p) => {
      const r = parseFloat(String(p.rating || "0"));
      return r >= 4.7;
    });
  }
  // new-arrivals → all products
  return products;
}

const EMPTY_FILTERS: FilterState = { sizes: [], colors: [], maxPrice: null, tags: [] };

export function ProductListingPage({
  slug,
  onAddToCart,
  onNavigate,
}: {
  slug: string;
  onAddToCart: (item: { name: string; price: string; size: number; color: string; image: string }) => void;
  onNavigate: (path: string) => void;
}) {
  const meta = COLLECTION_META[slug] ?? { label: slug, hero: slug, audience: null };
  const [allProducts, setAllProducts] = useState<CmsProduct[]>([]);
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("featured");
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    getProducts().then((data) => setAllProducts(data));
  }, []);

  // Reset filters when slug changes
  useEffect(() => {
    setFilters(EMPTY_FILTERS);
    setSort("featured");
  }, [slug]);

  const collectionProducts = filterByCollection(allProducts, slug);
  const visibleProducts = applyFiltersAndSort(collectionProducts, filters, sort);

  return (
    <main className="plp-page">
      {/* Breadcrumb */}
      <nav className="plp-breadcrumb" aria-label="Breadcrumb">
        <button type="button" className="plp-breadcrumb-link" onClick={() => onNavigate("/")}>
          Home
        </button>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{meta.label}</span>
      </nav>

      {/* Collection hero */}
      <header className="plp-hero">
        <h1>{meta.label}</h1>
        <p className="plp-hero-sub">{meta.hero}</p>
      </header>

      {/* Filter + Sort Bar */}
      <div className="plp-shell">
        <FilterSortBar
          products={collectionProducts}
          filters={filters}
          sort={sort}
          onFiltersChange={setFilters}
          onSortChange={setSort}
          productCount={visibleProducts.length}
        />

        {/* Product grid */}
        {visibleProducts.length === 0 ? (
          <div className="plp-empty">
            <p>No products match your filters.</p>
            <button
              type="button"
              className="pill-button"
              onClick={() => setFilters(EMPTY_FILTERS)}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="product-grid plp-grid">
            {visibleProducts.map((product, index) => (
              <ProductCard
                key={product.name}
                product={product}
                isFirstProduct={index === 0}
                onAddToCart={onAddToCart}
                onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {isSizeGuideOpen && (
        <div
          className="size-guide-modal-overlay"
          onClick={() => setIsSizeGuideOpen(false)}
          role="dialog"
          aria-label="Size Guide"
          aria-modal="true"
        >
          <div
            className="size-guide-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Size Guide</h2>
            <table>
              <thead>
                <tr>
                  <th>US</th>
                  <th>UK</th>
                  <th>EU</th>
                  <th>CM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["8", "7", "41", "26"],
                  ["9", "8", "42", "27"],
                  ["10", "9", "43", "28"],
                  ["11", "10", "44", "29"],
                  ["12", "11", "45", "30"],
                  ["13", "12", "46", "31"],
                ].map(([us, uk, eu, cm]) => (
                  <tr key={us}>
                    <td>{us}</td>
                    <td>{uk}</td>
                    <td>{eu}</td>
                    <td>{cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              type="button"
              className="pill-button close-modal"
              onClick={() => setIsSizeGuideOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
