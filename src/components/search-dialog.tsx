import { useState, useEffect, useRef } from "react";
import { getProducts, CmsProduct, getImageUrl } from "../utils/cms-client";

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

/** Derives a URL slug from a product name */
function toSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export function SearchDialog({ isOpen, onClose, onNavigate }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<Element | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Fetch products once on mount
  useEffect(() => {
    getProducts().then(setProducts);
  }, []);

  // Focus management & Trap
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement;
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      if (triggerRef.current instanceof HTMLElement) {
        triggerRef.current.focus();
      }
      setQuery("");
    }
  }, [isOpen]);

  // Trap Tab/Shift+Tab and Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (product: CmsProduct) => {
    onNavigate(`/products/${toSlug(product.name)}`);
    onClose();
  };

  // Resolve product thumbnail from colorways or fallback image
  const getThumb = (p: CmsProduct): string => {
    if (p.colorways && p.colorways.length > 0) {
      return getImageUrl(p.colorways[0].image);
    }
    return p.image || "/allbirds-crop-top-left.png";
  };

  return (
    <div className="search-dialog-overlay" onClick={onClose}>
      <div
        ref={dialogRef}
        className="search-dialog"
        role="dialog"
        aria-label="Search products"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)", fontSize: "22px" }}>Search</h2>
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
          >&times;</button>
        </div>
        <label htmlFor="search-dialog-input" className="sr-only">Search products</label>
        <input
          id="search-dialog-input"
          ref={inputRef}
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", padding: "12px", fontSize: "16px", border: "1px solid var(--charcoal)", borderRadius: "4px", boxSizing: "border-box" }}
        />
        <div className="search-results">
          {query.trim() && filtered.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--iron)", padding: "24px 0" }}>
              No products found for "{query}"
            </p>
          )}
          {filtered.map((p) => (
            <button
              key={p.name}
              type="button"
              className="search-result-item"
              onClick={() => handleSelect(p)}
            >
              <img src={getThumb(p)} alt="" style={{ width: "40px", height: "40px", objectFit: "cover", borderRadius: "4px" }} />
              <span style={{ flex: 1, textAlign: "left" }}>{p.name}</span>
              <span style={{ color: "var(--iron)", fontSize: "14px" }}>{p.price}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
