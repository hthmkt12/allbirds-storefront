import { useState } from "react";
import { SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { CmsProduct } from "../utils/cms-client";
import { DEFAULT_SIZES } from "../utils/commerce-config";

export type SortKey = "featured" | "price-asc" | "price-desc" | "rating-desc" | "name-asc";

export interface FilterState {
  sizes: number[];
  colors: string[];
  maxPrice: number | null;
  tags: string[];
}

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "rating-desc": "Rating: High to Low",
  "name-asc": "Name: A-Z",
};

// Derive unique filter options from the product list
function deriveOptions(products: CmsProduct[]) {
  const sizes = new Set<number>();
  const colors = new Set<string>();
  const tags = new Set<string>();
  let maxPrice = 0;

  for (const p of products) {
    (p.sizes || DEFAULT_SIZES).forEach((s) => sizes.add(s));
    const cws = p.colorways && p.colorways.length ? p.colorways : [{ color: p.color || "" }];
    cws.forEach((cw: any) => cw.color && colors.add(cw.color));
    (p.tags || []).forEach((t) => tags.add(t));
    const price = parseFloat((p.price || "0").replace(/[^0-9.]/g, ""));
    if (price > maxPrice) maxPrice = price;
  }

  return {
    sizes: Array.from(sizes).sort((a, b) => a - b),
    colors: Array.from(colors).sort(),
    tags: Array.from(tags).sort(),
    maxPrice: Math.ceil(maxPrice / 10) * 10,
  };
}

export function applyFiltersAndSort(
  products: CmsProduct[],
  filters: FilterState,
  sort: SortKey
): CmsProduct[] {
  let result = products.filter((p) => {
    const pSizes = p.sizes && p.sizes.length ? p.sizes : DEFAULT_SIZES;
    if (filters.sizes.length > 0 && !filters.sizes.some((s) => pSizes.includes(s))) return false;

    if (filters.colors.length > 0) {
      const cws = p.colorways && p.colorways.length ? p.colorways : [{ color: p.color || "" }];
      const productColors = cws.map((cw: any) => cw.color);
      if (!filters.colors.some((c) => productColors.includes(c))) return false;
    }

    if (filters.maxPrice !== null) {
      const price = parseFloat((p.price || "0").replace(/[^0-9.]/g, ""));
      if (price > filters.maxPrice) return false;
    }

    if (filters.tags.length > 0 && !filters.tags.some((t) => (p.tags || []).includes(t))) return false;

    return true;
  });

  switch (sort) {
    case "price-asc":
      result.sort(
        (a, b) =>
          parseFloat((a.price || "0").replace(/[^0-9.]/g, "")) -
          parseFloat((b.price || "0").replace(/[^0-9.]/g, ""))
      );
      break;
    case "price-desc":
      result.sort(
        (a, b) =>
          parseFloat((b.price || "0").replace(/[^0-9.]/g, "")) -
          parseFloat((a.price || "0").replace(/[^0-9.]/g, ""))
      );
      break;
    case "rating-desc":
      result.sort(
        (a, b) =>
          parseFloat(String(b.rating || "0")) - parseFloat(String(a.rating || "0"))
      );
      break;
    case "name-asc":
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
      break;
  }

  return result;
}

export function FilterSortBar({
  products,
  filters,
  sort,
  onFiltersChange,
  onSortChange,
  productCount,
}: {
  products: CmsProduct[];
  filters: FilterState;
  sort: SortKey;
  onFiltersChange: (f: FilterState) => void;
  onSortChange: (s: SortKey) => void;
  productCount: number;
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const opts = deriveOptions(products);

  const toggleSize = (s: number) =>
    onFiltersChange({
      ...filters,
      sizes: filters.sizes.includes(s) ? filters.sizes.filter((x) => x !== s) : [...filters.sizes, s],
    });

  const toggleColor = (c: string) =>
    onFiltersChange({
      ...filters,
      colors: filters.colors.includes(c) ? filters.colors.filter((x) => x !== c) : [...filters.colors, c],
    });

  const toggleTag = (t: string) =>
    onFiltersChange({
      ...filters,
      tags: filters.tags.includes(t) ? filters.tags.filter((x) => x !== t) : [...filters.tags, t],
    });

  const activeFilterCount =
    filters.sizes.length + filters.colors.length + filters.tags.length + (filters.maxPrice !== null ? 1 : 0);

  const clearAll = () =>
    onFiltersChange({ sizes: [], colors: [], maxPrice: null, tags: [] });

  return (
    <div className="fsbar">
      <div className="fsbar-row">
        <span className="fsbar-count">{productCount} Products</span>
        <div className="fsbar-controls">
          <button
            type="button"
            className={`fsbar-btn${filterOpen ? " active" : ""}`}
            aria-expanded={filterOpen}
            onClick={() => {
              setFilterOpen((v) => !v);
              setSortOpen(false);
            }}
          >
            <SlidersHorizontal size={16} />
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
          <div className="fsbar-sort-wrap">
            <button
              type="button"
              className={`fsbar-btn${sortOpen ? " active" : ""}`}
              aria-expanded={sortOpen}
              onClick={() => {
                setSortOpen((v) => !v);
                setFilterOpen(false);
              }}
            >
              <ArrowUpDown size={16} />
              {SORT_LABELS[sort]}
            </button>
            {sortOpen && (
              <div className="sort-dropdown" role="listbox">
                {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                  <button
                    key={key}
                    role="option"
                    aria-selected={sort === key}
                    type="button"
                    className={`sort-option${sort === key ? " selected" : ""}`}
                    onClick={() => {
                      onSortChange(key);
                      setSortOpen(false);
                    }}
                  >
                    {SORT_LABELS[key]}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="filter-chips">
          {filters.sizes.map((s) => (
            <button key={s} type="button" className="filter-chip" onClick={() => toggleSize(s)}>
              Size {s} <X size={12} />
            </button>
          ))}
          {filters.colors.map((c) => (
            <button key={c} type="button" className="filter-chip" onClick={() => toggleColor(c)}>
              {c} <X size={12} />
            </button>
          ))}
          {filters.tags.map((t) => (
            <button key={t} type="button" className="filter-chip" onClick={() => toggleTag(t)}>
              {t} <X size={12} />
            </button>
          ))}
          {filters.maxPrice !== null && (
            <button
              type="button"
              className="filter-chip"
              onClick={() => onFiltersChange({ ...filters, maxPrice: null })}
            >
              Under ${filters.maxPrice} <X size={12} />
            </button>
          )}
          <button type="button" className="filter-chip clear" onClick={clearAll}>
            Clear All
          </button>
        </div>
      )}

      {/* Filter panel */}
      {filterOpen && (
        <div className="filter-panel">
          {opts.sizes.length > 0 && (
            <div className="filter-group">
              <strong>Size</strong>
              <div className="filter-options size-options">
                {opts.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`size-button${filters.sizes.includes(s) ? " selected" : ""}`}
                    onClick={() => toggleSize(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {opts.colors.length > 0 && (
            <div className="filter-group">
              <strong>Color</strong>
              <div className="filter-options">
                {opts.colors.map((c) => (
                  <label key={c} className="filter-check-label">
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(c)}
                      onChange={() => toggleColor(c)}
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>
          )}

          {opts.tags.length > 0 && (
            <div className="filter-group">
              <strong>Type / Material</strong>
              <div className="filter-options">
                {opts.tags.map((t) => (
                  <label key={t} className="filter-check-label">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(t)}
                      onChange={() => toggleTag(t)}
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          )}

          {opts.maxPrice > 0 && (
            <div className="filter-group">
              <strong>Max Price: {filters.maxPrice !== null ? `$${filters.maxPrice}` : `$${opts.maxPrice}`}</strong>
              <input
                type="range"
                min={0}
                max={opts.maxPrice}
                step={10}
                value={filters.maxPrice ?? opts.maxPrice}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    maxPrice: Number(e.target.value) === opts.maxPrice ? null : Number(e.target.value),
                  })
                }
                style={{ width: "100%" }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
