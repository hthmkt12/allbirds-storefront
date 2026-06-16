import { ArrowRight, Star } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  getCategories, 
  getProducts, 
  getPromoTiles, 
  getImageUrl,
  CmsCategory, 
  CmsProduct, 
  CmsPromoTile 
} from "../utils/cms-client";
import { valueBlocks } from "../data/allbirds-data";
import { ResponsiveImage } from "./responsive-image";




type CategoryProps = {
  activeCategory: string;
  onCategoryChange: (value: string) => void;
};

export function CategoryStrip({ activeCategory, onCategoryChange }: CategoryProps) {
  const [categories, setCategories] = useState<CmsCategory[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  return (
    <section className="category-strip" id="shop">
      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.name}
            category={category}
            selected={category.name === activeCategory}
            onSelect={onCategoryChange}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryCard({ category, selected, onSelect }: {
  category: CmsCategory;
  selected: boolean;
  onSelect: (value: string) => void;
}) {
  return (
    <button
      className={selected ? "category-card selected" : "category-card"}
      style={{ backgroundColor: category.swatch }}
      onClick={() => onSelect(category.name)}
    >
      <span>{category.name}</span>
      <strong>{category.cta}</strong>
    </button>
  );
}

export function ProductSection({ 
  activeCategory, 
  audience,
  onAddToCart
}: { 
  activeCategory: string; 
  audience: string;
  onAddToCart: (item: { name: string; price: string; size: number; color: string; image: string }) => void;
}) {
  const [products, setProducts] = useState<CmsProduct[]>([]);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  useEffect(() => {
    getProducts().then((data) => {
      setProducts(data);
    });
  }, []);

  const filteredProducts = products.filter((product) => {
    if (activeCategory === "New Arrivals") {
      return true;
    }
    if (activeCategory === "Mens") {
      return product.name.includes("Men's");
    }
    if (activeCategory === "Womens") {
      return product.name.includes("Women's");
    }
    let matchesAudience = true;
    if (audience === "Shop Men") {
      matchesAudience = product.name.includes("Men's");
    } else if (audience === "Shop Women") {
      matchesAudience = product.name.includes("Women's");
    }
    if (!matchesAudience) {
      return false;
    }
    if (activeCategory === "Best Sellers") {
      const r = typeof product.rating === "number" ? product.rating : parseFloat(product.rating || "0");
      return r >= 4.7;
    }
    return true;
  });

  return (
    <section className="section-shell" id="new-arrivals">
      <div className="section-heading-row">
        <h2>New Arrivals</h2>
        <div>
          <a className="text-link" href="#new-arrivals">Shop Men</a>
          <a className="text-link" href="#new-arrivals">Shop Women</a>
        </div>
      </div>
      <SpotlightCard activeCategory={activeCategory} audience={audience} />
      <div className="product-grid">
        {filteredProducts.map((product, index) => (
          <ProductCard 
            key={product.name} 
            product={product} 
            isFirstProduct={index === 0}
            onAddToCart={onAddToCart}
            onOpenSizeGuide={() => setIsSizeGuideOpen(true)}
          />
        ))}
      </div>

      {isSizeGuideOpen && (
        <div className="size-guide-modal-overlay" onClick={() => setIsSizeGuideOpen(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()} style={{
            background: 'var(--canvas)',
            padding: '32px',
            borderRadius: '8px',
            border: '1px solid var(--charcoal)',
            maxWidth: '500px',
            width: '90%',
            position: 'relative'
          }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', marginBottom: '16px' }}>Size Guide</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--charcoal)' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>US Size</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>UK Size</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>EU Size</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>CM</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { us: '8', uk: '7', eu: '41', cm: '26' },
                  { us: '9', uk: '8', eu: '42', cm: '27' },
                  { us: '10', uk: '9', eu: '43', cm: '28' },
                  { us: '11', uk: '10', eu: '44', cm: '29' },
                  { us: '12', uk: '11', eu: '45', cm: '30' },
                  { us: '13', uk: '12', eu: '46', cm: '31' },
                  { us: '14', uk: '13', eu: '47', cm: '32' },
                  { us: '15', uk: '14', eu: '48', cm: '33' }
                ].map((row) => (
                  <tr key={row.us} style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '8px' }}>{row.us}</td>
                    <td style={{ padding: '8px' }}>{row.uk}</td>
                    <td style={{ padding: '8px' }}>{row.eu}</td>
                    <td style={{ padding: '8px' }}>{row.cm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button 
              type="button" 
              className="close-modal pill-button" 
              onClick={() => setIsSizeGuideOpen(false)}
              style={{
                width: '100%',
                background: 'var(--charcoal)',
                color: 'var(--canvas)',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function SpotlightCard({ activeCategory, audience }: { activeCategory: string; audience: string }) {
  const [categories, setCategories] = useState<CmsCategory[]>([]);

  useEffect(() => {
    getCategories().then((data) => {
      setCategories(data);
    });
  }, []);

  const activeCatObj = categories.find((item) => item.name === activeCategory);
  const categoryImage = activeCatObj ? activeCatObj.image : "/allbirds-crop-top-left.png";

  return (
    <div className="spotlight-card">
      <ResponsiveImage image={categoryImage} alt="" sizes="(max-width: 920px) 100vw, 50vw" />
      <div>
        <p className="section-kicker">Active Feature</p>
        <h3>{activeCategory}</h3>
        <p className="spotlight-copy">Editorial swatches, product content, and campaign media are structured as CMS-owned blocks.</p>
        <a className="pill-button light" href="#new-arrivals">{audience}<ArrowRight size={16} /></a>
      </div>
    </div>
  );
}

export function ProductCard({ 
  product, 
  isFirstProduct,
  onAddToCart,
  onOpenSizeGuide
}: { 
  product: CmsProduct; 
  isFirstProduct: boolean;
  onAddToCart: (item: { name: string; price: string; size: number; color: string; image: string }) => void;
  onOpenSizeGuide: () => void;
}) {
  const colorways = product.colorways && product.colorways.length > 0
    ? product.colorways
    : [
        { color: product.color || "Default Color", swatch: product.swatch || "#ccc", image: product.image || "/allbirds-crop-top-left.png" },
        { color: "Stormy Lilac", swatch: "#c8d3d8", image: "/allbirds-lifestyle-hero.png" },
        { color: "Burlwood", swatch: "#d4d9cf", image: "/allbirds-mvp-lifestyle.png" }
      ];

  const [colorwayIndex, setColorwayIndex] = useState(0);
  const activeColorway = colorways[colorwayIndex];
  const swatchColor = activeColorway.swatch;
  const imageUrl = getImageUrl(activeColorway.image) || (typeof activeColorway.image === 'string' ? activeColorway.image : "");
  const colorName = activeColorway.color;

  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  let label = product.label;
  if (!label && product.tags) {
    const hasNew = product.tags.includes("New");
    label = hasNew ? "New" : (product.tags[0] || "\u00a0");
  }
  if (!label) {
    label = "\u00a0";
  }

  const sizes = [8, 9, 10, 11, 12, 13, 14, 15];

  return (
    <article className="product-card">
      <div 
        className="product-swatch" 
        style={{ backgroundColor: swatchColor, cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onClick={() => {
          setColorwayIndex((prev) => (prev + 1) % colorways.length);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setColorwayIndex((prev) => (prev + 1) % colorways.length);
          }
        }}
      >
        <ResponsiveImage 
          image={activeColorway.image || "/allbirds-crop-top-left.png"} 
          alt={product.name} 
          className="product-crop"
          sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 25vw"
        />
      </div>
      <div className="product-meta">
        {label ? <span>{label}</span> : <span>&nbsp;</span>}
        <h3>{product.name}</h3>
        <p>{colorName}</p>
        <div className="product-facts">
          <small>{product.fit}</small>
          <small><Star size={13} fill="currentColor" /> {product.rating}</small>
        </div>
        <div className="tag-row">{product.tags.map((tag) => <b key={tag}>{tag}</b>)}</div>
        <strong>{product.price}</strong>

        {isFirstProduct && (
          <div className="product-card-options" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--line)' }}>
            <div className="low-stock-warning" style={{ color: '#d9534f', fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
              Only 3 left
            </div>
            <div className="selected-size-label" style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px' }}>
              {selectedSize ? `Selected Size: ${selectedSize}` : "Select a Size"}
            </div>
            <div className="size-buttons-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', marginBottom: '12px' }}>
              {sizes.map((size) => {
                const isDisabled = size === 14 || size === 15;
                return (
                  <button
                    key={size}
                    type="button"
                    className={`size-button ${isDisabled ? 'disabled' : ''} ${selectedSize === size ? 'selected' : ''}`}
                    aria-disabled={isDisabled ? "true" : undefined}
                    style={{
                      padding: '8px 0',
                      border: selectedSize === size ? '2px solid var(--charcoal)' : '1px solid var(--line)',
                      background: selectedSize === size ? 'var(--charcoal)' : 'var(--canvas)',
                      color: selectedSize === size ? 'var(--canvas)' : 'var(--charcoal)',
                      opacity: isDisabled ? 0.5 : 1,
                      cursor: 'pointer'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                className="pill-button"
                disabled={!selectedSize || selectedSize === 14 || selectedSize === 15}
                style={{
                  flex: 1,
                  background: (!selectedSize || selectedSize === 14 || selectedSize === 15) ? '#e0e0e0' : 'var(--charcoal)',
                  color: (!selectedSize || selectedSize === 14 || selectedSize === 15) ? '#999' : 'var(--canvas)',
                  border: 'none',
                  cursor: (!selectedSize || selectedSize === 14 || selectedSize === 15) ? 'not-allowed' : 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (selectedSize && selectedSize !== 14 && selectedSize !== 15) {
                    onAddToCart({
                      name: product.name,
                      price: product.price,
                      size: selectedSize,
                      color: colorName,
                      image: imageUrl || "/allbirds-crop-top-left.png"
                    });
                  }
                }}
              >
                Add to Bag
              </button>
              <button 
                type="button" 
                className="size-guide-button"
                style={{
                  fontSize: '12px',
                  textDecoration: 'underline',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSizeGuide();
                }}
              >
                Size Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export function MvpSection() {
  return (
    <section className="mvp-section">
      <h2>Your Easy, Breezy MVP</h2>
      <div className="mvp-grid">
        <ResponsiveImage image="/allbirds-mvp-lifestyle.png" alt="Natural shoes and travel essentials on linen" sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 25vw" />
        {valueBlocks.slice(0, 2).map((item) => (
          <article key={item.title}>
            <p className="section-kicker">{item.title}</p>
            <h3>{item.body}</h3>
            <p>A clean content block ready to become a Payload layout field.</p>
          </article>
        ))}
        <ResponsiveImage image="/allbirds-crop-top-right.png" alt="Muted Allbirds-inspired shoe colorways" sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 25vw" />
      </div>
    </section>
  );
}

export function PromoSection() {
  const [promoTilesList, setPromoTilesList] = useState<CmsPromoTile[]>([]);

  useEffect(() => {
    getPromoTiles().then((data) => {
      setPromoTilesList(data);
    });
  }, []);

  return (
    <section className="promo-grid" id="sale">
      {promoTilesList.map((tile) => {
        return (
          <article 
            key={tile.title} 
            className="promo-card" 
            style={{ 
              backgroundColor: tile.swatch 
            }}
          >
            <ResponsiveImage 
              image={tile.image} 
              alt={tile.title} 
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 0 }}
              sizes="(max-width: 560px) 100vw, (max-width: 920px) 50vw, 33vw"
            />
            <h2>{tile.title}</h2>
            <div>
              <a className="pill-button light" href="#new-arrivals">Shop Men</a>
              <a className="pill-button light" href="#new-arrivals">Shop Women</a>
            </div>
          </article>
        );
      })}
    </section>
  );
}

