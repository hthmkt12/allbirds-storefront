import { useState, useEffect } from "react";
import {
  CategoryStrip,
  Hero,
  MaterialStory,
  MvpSection,
  NewsletterFooter,
  PayloadContract,
  ProductSection,
  PromoSection,
  ReviewsSection,
  SiteHeader,
} from "./components/storefront-sections";
import { categories } from "./data/allbirds-data";
import { ResponsiveImage } from "./components/responsive-image";


interface CartItem {
  id: string;
  name: string;
  price: string;
  size: number;
  color: string;
  image: string;
  quantity: number;
}

export default function App() {
  const [audience, setAudience] = useState("Shop Men");
  const [activeCategory, setActiveCategory] = useState(categories[0].name);

  const handleCategoryChange = (catName: string) => {
    setActiveCategory(catName);
    if (catName === "Mens") {
      setAudience("Shop Men");
    } else if (catName === "Womens") {
      setAudience("Shop Women");
    }
  };

  const handleAudienceChange = (audienceName: string) => {
    setAudience(audienceName);
    if (audienceName === "Shop Men" && activeCategory === "Womens") {
      setActiveCategory("Mens");
    } else if (audienceName === "Shop Women" && activeCategory === "Mens") {
      setActiveCategory("Womens");
    }
  };

  // Cart and Drawer States
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            id: item.id || `${item.name}-${item.size}-${item.color}`,
            name: item.name || "Unknown Item",
            price: item.price || "$0",
            size: typeof item.size === 'number' ? item.size : 8,
            color: item.color || "Default",
            image: item.image || "/allbirds-crop-top-left.png",
            quantity: typeof item.quantity === 'number' && item.quantity > 0 ? Math.floor(item.quantity) : 1
          }));
        }
      }
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Routing State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  // Sync Cart to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Client-side router navigation
  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'>) => {
    const id = `${item.name}-${item.size}-${item.color}`;
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === id);
      if (existing) {
        return prevCart.map((i) => i.id === id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prevCart, { ...item, id, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const numericPrice = parseFloat(item.price.replace(/[^0-9.]/g, ""));
      return sum + (numericPrice * item.quantity);
    }, 0);
  };

  if (currentPath === "/checkout") {
    return (
      <main style={{ padding: '64px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--serif)', fontSize: '48px', marginBottom: '24px' }}>Checkout Confirmation</h1>
        <div style={{ border: '1px solid var(--charcoal)', padding: '40px', background: 'var(--oat)', borderRadius: '8px', marginBottom: '32px' }}>
          <h2 style={{ color: '#5cb85c', marginBottom: '16px' }}>Order Placed Successfully!</h2>
          <p style={{ fontSize: '18px', color: 'var(--iron)', lineHeight: '1.6' }}>
            Thank you for shopping with Allbirds. We have received your order and are preparing it for shipment.
          </p>
        </div>
        <button 
          type="button" 
          className="pill-button" 
          onClick={() => navigate("/")}
          style={{ background: 'var(--charcoal)', color: 'var(--canvas)', border: 'none', cursor: 'pointer' }}
        >
          Return to Storefront
        </button>
      </main>
    );
  }

  return (
    <>
      <SiteHeader onBagClick={() => setIsCartOpen(true)} onSearchClick={() => setIsSearchOpen(true)} />
      <main>
        <Hero audience={audience} onAudienceChange={handleAudienceChange} />
        <CategoryStrip activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        <ProductSection 
          activeCategory={activeCategory} 
          audience={audience} 
          onAddToCart={addToCart}
        />
        <MvpSection />
        <PromoSection />
        <MaterialStory />
        <ReviewsSection />
        <PayloadContract />
      </main>
      <NewsletterFooter />

      {/* Cart Drawer */}
      <div
        className={`cart-drawer-overlay ${isCartOpen ? "open" : ""}`}
        onClick={() => setIsCartOpen(false)}
      />
      <div
        className={`cart-drawer ${isCartOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Shopping Cart"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)" }}>Your Bag</h2>
          <button
            type="button"
            className="cart-drawer-close"
            aria-label="Close cart"
            onClick={() => setIsCartOpen(false)}
            style={{
              border: "none",
              background: "none",
              fontSize: "20px",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty-message" style={{ margin: "auto", textAlign: "center", fontSize: "16px", color: "var(--iron)" }}>
            Your bag is empty
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
            <div className="shipping-progress-bar" style={{
              padding: "12px",
              backgroundColor: "var(--oat)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              marginBottom: "16px",
              fontSize: "13px",
              fontWeight: "bold",
            }}>
              {calculateSubtotal() >= 150 ? (
                "You qualified for free shipping!"
              ) : (
                `$${150 - calculateSubtotal()} away from free shipping`
              )}
              <div className="progress-bar-track" style={{ height: "4px", background: "#e0e0e0", marginTop: "8px", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  className="progress-bar-fill"
                  style={{
                    height: "100%",
                    background: "var(--charcoal)",
                    width: `${Math.min(100, (calculateSubtotal() / 150) * 100)}%`,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>

            <div className="cart-items-list" style={{ flex: 1, overflowY: "auto", marginBottom: "16px" }}>
              {cart.map((item) => (
                <div className="cart-item" key={item.id} style={{
                  display: "flex",
                  gap: "12px",
                  paddingBottom: "16px",
                  marginBottom: "16px",
                  borderBottom: "1px solid var(--line)",
                }}>
                  <ResponsiveImage
                    image={item.image}
                    alt={item.name}
                    style={{ width: "80px", height: "80px", objectFit: "cover", border: "1px solid var(--line)", display: "block" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: "bold", fontSize: "14px", textTransform: "uppercase" }}>{item.name}</div>
                    <div style={{ fontSize: "13px", color: "var(--iron)", margin: "2px 0" }}>{item.color}</div>
                    <div className="item-size" style={{ fontSize: "13px", color: "var(--iron)" }}>Size: {item.size}</div>
                    <div style={{ fontWeight: "bold", marginTop: "6px" }}>{item.price}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div className="quantity-selector" style={{ display: "flex", alignItems: "center", border: "1px solid var(--charcoal)", borderRadius: "999px", overflow: "hidden" }}>
                      <button className="minus" type="button" onClick={() => updateQuantity(item.id, -1)} style={{ border: "none", background: "none", padding: "4px 10px", cursor: "pointer" }}>-</button>
                      <span className="quantity-value" style={{ padding: "0 4px", fontWeight: "bold", fontSize: "13px" }}>{item.quantity}</span>
                      <button className="plus" type="button" onClick={() => updateQuantity(item.id, 1)} style={{ border: "none", background: "none", padding: "4px 10px", cursor: "pointer" }}>+</button>
                    </div>
                    <button
                      className="remove-item"
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      style={{
                        border: "none",
                        background: "none",
                        textDecoration: "underline",
                        fontSize: "12px",
                        color: "var(--iron)",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-drawer-footer" style={{ borderTop: "1px solid var(--charcoal)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "18px", marginBottom: "16px" }}>
                <span>Subtotal:</span>
                <span className="cart-subtotal">${calculateSubtotal()}</span>
              </div>
              <button
                type="button"
                className="checkout-button pill-button"
                onClick={() => navigate("/checkout")}
                style={{
                  width: "100%",
                  background: "var(--charcoal)",
                  color: "var(--canvas)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "bold",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: '100px',
          zIndex: 9999
        }}>
          <div 
            className="search-modal" 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--canvas)',
              padding: '24px',
              borderRadius: '8px',
              border: '1px solid var(--charcoal)',
              maxWidth: '600px',
              width: '90%'
            }}
          >
            <label htmlFor="search-input" className="sr-only">Search products</label>
            <input 
              id="search-input"
              type="text" 
              placeholder="Search products..." 
              autoFocus
              defaultValue=""
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIsSearchOpen(false);
                }
              }}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid var(--charcoal)',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
