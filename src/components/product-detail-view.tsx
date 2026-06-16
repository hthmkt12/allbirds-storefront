import { useState, useEffect } from "react";
import { Star, Minus, Plus, ChevronDown, ChevronUp } from "lucide-react";
import { getProducts, getMaterials, getImageUrl, CmsProduct, CmsMaterial } from "../utils/cms-client";
import { ResponsiveImage } from "./responsive-image";

export interface ProductDetailViewProps {
  slug: string;
  onAddToCart: (item: {
    name: string;
    price: string;
    size: number;
    color: string;
    image: string;
    quantity: number;
  }) => void;
  onNavigate: (path: string) => void;
  onOpenSizeGuide?: () => void;
}

export function ProductDetailView({
  slug,
  onAddToCart,
  onNavigate,
  onOpenSizeGuide,
}: ProductDetailViewProps) {
  const [product, setProduct] = useState<CmsProduct | null>(null);
  const [materials, setMaterials] = useState<CmsMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [colorwayIndex, setColorwayIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);

  // Fetch product and materials
  useEffect(() => {
    setLoading(true);
    Promise.all([getProducts(), getMaterials()])
      .then(([productsList, materialsList]) => {
        // Find product by slug
        const getProductSlug = (name: string) =>
          name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        
        const foundProduct = productsList.find(
          (p) => getProductSlug(p.name) === slug
        );
        
        if (foundProduct) {
          setProduct(foundProduct);
          // Set default colorway index
          setColorwayIndex(0);
          setSelectedSize(null);
          setQuantity(1);
        }
        setMaterials(materialsList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load PDP data", err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="pdp-loading" style={{ padding: "120px 20px", textAlign: "center" }}>
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-not-found" style={{ padding: "120px 20px", textAlign: "center" }}>
        <h2>Product Not Found</h2>
        <p>We couldn't find the product you're looking for.</p>
        <button
          type="button"
          className="pill-button"
          onClick={() => onNavigate("/")}
          style={{ marginTop: "16px" }}
        >
          Return to Storefront
        </button>
      </div>
    );
  }

  const colorways =
    product.colorways && product.colorways.length > 0
      ? product.colorways
      : [
          {
            color: product.color || "Default Color",
            swatch: product.swatch || "#ccc",
            image: product.image || "/allbirds-crop-top-left.png",
          },
        ];

  const activeColorway = colorways[colorwayIndex];
  const colorName = activeColorway.color;
  const imageUrl =
    getImageUrl(activeColorway.image) ||
    (typeof activeColorway.image === "string" ? activeColorway.image : "");

  // Sizes array - use product.sizes if available, else defaults
  const sizes: number[] =
    product.sizes && product.sizes.length > 0 ? product.sizes : [8, 9, 10, 11, 12, 13, 14, 15];

  // Simulate 2 out-of-stock sizes (last two)
  const outOfStock = new Set([sizes[sizes.length - 1], sizes[sizes.length - 2]]);

  const canAdd = selectedSize !== null && !outOfStock.has(selectedSize);

  // Toggle Accordion section
  const toggleAccordion = (section: string) => {
    setActiveAccordion((prev) => (prev === section ? null : section));
  };

  const incrementQuantity = () => setQuantity((q) => q + 1);
  const decrementQuantity = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  return (
    <main className="pdp-page" style={{ paddingTop: "130px", paddingBottom: "80px" }}>
      {/* Breadcrumb */}
      <nav className="plp-breadcrumb" aria-label="Breadcrumb" style={{ padding: "0 20px 16px" }}>
        <button type="button" className="plp-breadcrumb-link" onClick={() => onNavigate("/")}>
          Home
        </button>
        <span aria-hidden="true"> / </span>
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="pdp-container" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", maxWidth: "1200px", margin: "0 auto", padding: "0 20px" }}>
        
        {/* Left Column: Colorway Image Gallery */}
        <div className="pdp-gallery-column">
          <div 
            className="product-swatch pdp-gallery-main" 
            style={{ 
              backgroundColor: activeColorway.swatch,
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              aspectRatio: "1/1"
            }}
          >
            <ResponsiveImage
              image={activeColorway.image || "/allbirds-crop-top-left.png"}
              alt={product.name}
              className="product-crop"
              sizes="(max-width: 920px) 100vw, 50vw"
            />
          </div>
          {/* Gallery Thumbnails */}
          {colorways.length > 1 && (
            <div className="pdp-gallery-thumbnails" style={{ display: "flex", gap: "12px", marginTop: "16px" }}>
              {colorways.map((cw, i) => (
                <button
                   key={i}
                   type="button"
                   className={`pdp-gallery-thumbnail${colorwayIndex === i ? " active" : ""}`}
                   style={{
                     width: "60px",
                     height: "60px",
                     border: colorwayIndex === i ? "2px solid var(--charcoal)" : "1px solid var(--line)",
                     borderRadius: "4px",
                     overflow: "hidden",
                     cursor: "pointer",
                     padding: 0
                   }}
                   onClick={() => setColorwayIndex(i)}
                   aria-label={`View ${cw.color} image`}
                >
                  <ResponsiveImage
                    image={cw.image || "/allbirds-crop-top-left.png"}
                    alt={cw.color}
                    sizes="60px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Options */}
        <div className="pdp-details-column" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h1 style={{ fontFamily: "var(--serif)", fontSize: "36px", fontWeight: "400", margin: "0 0 8px" }}>
                {product.name}
              </h1>
              <strong style={{ fontSize: "20px" }}>{product.price}</strong>
            </div>
            <p style={{ color: "var(--iron)", margin: "0 0 12px" }}>{colorName}</p>
            
            <div className="product-facts" style={{ display: "flex", gap: "16px", color: "var(--iron)", fontSize: "14px" }}>
              <span>Fit: {product.fit}</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Star size={14} fill="currentColor" /> {product.rating}
              </span>
            </div>
          </div>

          {/* Active Swatches Selection */}
          <div className="pdp-colorways-section">
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Select Colorway
            </span>
            <div className="pc-swatches" style={{ padding: 0 }}>
              {colorways.map((cw, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Select color ${cw.color}`}
                  className={`pc-swatch-dot${colorwayIndex === i ? " active" : ""}`}
                  style={{ background: cw.swatch, width: "24px", height: "24px" }}
                  onClick={() => setColorwayIndex(i)}
                />
              ))}
            </div>
          </div>

          {/* Size Selector Section */}
          <div className="pdp-sizes-section">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div className="selected-size-label" style={{ margin: 0, fontWeight: 600 }}>
                {selectedSize ? `Selected Size: ${selectedSize}` : "Select a Size"}
              </div>
              <button
                type="button"
                className="size-guide-button"
                onClick={() => {
                  setIsSizeGuideOpen(true);
                  onOpenSizeGuide?.();
                }}
                style={{ fontSize: "12px", background: "none", border: "none", textDecoration: "underline", cursor: "pointer" }}
              >
                Size Guide
              </button>
            </div>

            {outOfStock.size > 0 && (
              <div className="low-stock-warning" style={{ color: "#c0392b", fontSize: "12px", fontWeight: 700, marginBottom: "8px" }}>
                Only {sizes.length - outOfStock.size} left
              </div>
            )}

            <div className="size-buttons-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {sizes.map((size) => {
                const oos = outOfStock.has(size);
                return (
                  <button
                    key={size}
                    type="button"
                    className={`size-button${oos ? " disabled oos" : ""}${selectedSize === size ? " selected" : ""}`}
                    disabled={oos}
                    aria-label={`Size ${size}${oos ? ", out of stock" : ""}`}
                    onClick={() => {
                      if (!oos) setSelectedSize(size);
                    }}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Selector Section */}
          <div className="pdp-quantity-section">
            <span style={{ fontSize: "12px", fontWeight: 700, textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
              Quantity
            </span>
            <div className="quantity-selector" style={{ display: "inline-flex", alignItems: "center", border: "1px solid var(--line)", borderRadius: "4px" }}>
              <button
                type="button"
                className="minus"
                onClick={decrementQuantity}
                style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer" }}
                aria-label="Decrease quantity"
              >
                <Minus size={14} />
              </button>
              <span className="quantity-value" style={{ minWidth: "32px", textAlign: "center", fontSize: "14px", fontWeight: 600 }}>
                {quantity}
              </span>
              <button
                type="button"
                className="plus"
                onClick={incrementQuantity}
                style={{ padding: "8px 12px", background: "none", border: "none", cursor: "pointer" }}
                aria-label="Increase quantity"
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Bag CTA */}
          <button
            type="button"
            className="pill-button add-to-bag-btn"
            disabled={!canAdd}
            style={{
              width: "100%",
              padding: "16px",
              background: "var(--charcoal)",
              color: "var(--canvas)",
              border: "none",
              cursor: canAdd ? "pointer" : "not-allowed",
              fontWeight: 700,
              fontSize: "14px",
              marginTop: "8px"
            }}
            onClick={() => {
              if (canAdd) {
                onAddToCart({
                  name: product.name,
                  price: product.price,
                  size: selectedSize!,
                  color: colorName,
                  image: imageUrl || "/allbirds-crop-top-left.png",
                  quantity,
                });
              }
            }}
          >
            Add to Bag
          </button>

          {/* Accordions Section */}
          <div className="pdp-accordions" style={{ marginTop: "24px", borderTop: "1px solid var(--line)" }}>
            
            {/* Fit Accordion */}
            <div className="pdp-accordion-item" style={{ borderBottom: "1px solid var(--line)" }}>
              <button
                type="button"
                className="pdp-accordion-header"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left"
                }}
                onClick={() => toggleAccordion("fit")}
              >
                <span>Fit</span>
                {activeAccordion === "fit" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === "fit" && (
                <div className="pdp-accordion-content" style={{ paddingBottom: "16px", fontSize: "14px", color: "var(--iron)", lineHeight: "1.5" }}>
                  <p><strong>Fit Details:</strong> {product.fit}</p>
                  <p>Our customers report that this style runs true to size. If you are typically between sizes, we recommend selecting the next size up for optimal comfort.</p>
                </div>
              )}
            </div>

            {/* Material Accordion */}
            <div className="pdp-accordion-item" style={{ borderBottom: "1px solid var(--line)" }}>
              <button
                type="button"
                className="pdp-accordion-header"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left"
                }}
                onClick={() => toggleAccordion("material")}
              >
                <span>Material</span>
                {activeAccordion === "material" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === "material" && (
                <div className="pdp-accordion-content" style={{ paddingBottom: "16px", fontSize: "14px", color: "var(--iron)", lineHeight: "1.5" }}>
                  <p><strong>Natural Materials Story:</strong></p>
                  <ul style={{ paddingLeft: "20px", margin: "8px 0 0" }}>
                    {materials.map((m) => (
                      <li key={m.name} style={{ marginBottom: "8px" }}>
                        <strong>{m.name}</strong>: {m.impactNote}
                      </li>
                    ))}
                    {materials.length === 0 && (
                      <>
                        <li style={{ marginBottom: "8px" }}><strong>Eucalyptus Tree Fiber</strong>: Breathable, silky-smooth, and sourced from responsibly managed forests.</li>
                        <li style={{ marginBottom: "8px" }}><strong>Merino Wool</strong>: ZQ-certified wool that regulates temperature, wicks moisture, and offers premium soft cushioning.</li>
                        <li style={{ marginBottom: "8px" }}><strong>SweetFoam®</strong>: Our sugarcane-derived midsole foam contoured for comfort and made with carbon-negative EVA.</li>
                      </>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Shipping & Returns Accordion */}
            <div className="pdp-accordion-item" style={{ borderBottom: "1px solid var(--line)" }}>
              <button
                type="button"
                className="pdp-accordion-header"
                style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: 600,
                  textAlign: "left"
                }}
                onClick={() => toggleAccordion("shipping")}
              >
                <span>Shipping & Returns</span>
                {activeAccordion === "shipping" ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {activeAccordion === "shipping" && (
                <div className="pdp-accordion-content" style={{ paddingBottom: "16px", fontSize: "14px", color: "var(--iron)", lineHeight: "1.5" }}>
                  <p><strong>Free Shipping:</strong> Standard ground shipping is free on all orders over $150. For orders under $150, shipping is calculated at checkout.</p>
                  <p><strong>Easy 30-Day Returns:</strong> We offer a 30-day trial period. If you're not completely satisfied with your shoes, you can return them in their original packaging, no questions asked.</p>
                </div>
              )}
            </div>

          </div>
        </div>

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
