import { useState, useEffect, lazy, Suspense } from "react";
import { ErrorBoundary } from "./components/error-boundary";
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
import { ProductListingPage } from "./components/product-listing-page";
import { CartDrawer, CartItem } from "./components/cart-drawer";
import { ProductDetailView } from "./components/product-detail-view";
import { useWishlist } from "./utils/use-wishlist";
import { useSeoMetadata, BASE_STORE_TITLE, BASE_STORE_DESCRIPTION } from "./utils/seo";

// Lazy-loaded components for bundle optimization
const CheckoutView = lazy(() =>
  import("./components/checkout/checkout-view").then((m) => ({ default: m.CheckoutView }))
);
const SearchDialog = lazy(() =>
  import("./components/search-dialog").then((m) => ({ default: m.SearchDialog }))
);
const AccountDrawer = lazy(() =>
  import("./components/account-drawer").then((m) => ({ default: m.AccountDrawer }))
);
const HelpDrawer = lazy(() =>
  import("./components/help-drawer").then((m) => ({ default: m.HelpDrawer }))
);
const WishlistDrawer = lazy(() =>
  import("./components/wishlist-drawer").then((m) => ({ default: m.WishlistDrawer }))
);
const OrderTrackingView = lazy(() =>
  import("./components/order-tracking-view").then((m) => ({ default: m.OrderTrackingView }))
);

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
          return parsed.map((item: Partial<CartItem>) => ({
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
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const { wishlist, toggleWishlist, isInWishlist, removeFromWishlist, count: wishlistCount } = useWishlist();

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

  // Dynamic SEO for Home and Checkout confirmation
  useSeoMetadata({
    title: currentPath === "/checkout"
      ? "Secure Checkout"
      : currentPath === "/checkout/confirmation"
      ? "Order Confirmed"
      : BASE_STORE_TITLE,
    description: currentPath.startsWith("/checkout")
      ? "Complete your purchase securely at Allbirds."
      : BASE_STORE_DESCRIPTION,
    url: currentPath,
    type: "website",
  });

  const addToCart = (item: Omit<CartItem, 'id' | 'quantity'> & { quantity?: number }) => {
    const id = `${item.name}-${item.size}-${item.color}`;
    const qtyToAdd = item.quantity || 1;
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.id === id);
      if (existing) {
        return prevCart.map((i) => i.id === id ? { ...i, quantity: i.quantity + qtyToAdd } : i);
      }
      return [...prevCart, { ...item, id, quantity: qtyToAdd }];
    });
    setIsCartOpen(true);
  };

  const clearCart = () => setCart([]);

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

  // Determine collection slug from path (e.g. /collections/mens -> "mens")
  const collectionSlug = currentPath.startsWith("/collections/")
    ? currentPath.replace("/collections/", "").split("#")[0].split("?")[0]
    : null;

  const productSlug = currentPath.startsWith("/products/")
    ? currentPath.replace("/products/", "").split("#")[0].split("?")[0]
    : null;

  // Shared header props for all routes
  const headerProps = {
    onBagClick: () => setIsCartOpen(true),
    onSearchClick: () => setIsSearchOpen(true),
    onAccountClick: () => setIsAccountOpen(true),
    onHelpClick: () => setIsHelpOpen(true),
    onWishlistClick: () => setIsWishlistOpen(true),
    wishlistCount,
    onNavigate: navigate,
  };

  // Shared overlays rendered on every route
  const renderOverlays = () => (
    <Suspense fallback={null}>
      <SearchDialog isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onNavigate={navigate} />
      <AccountDrawer isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} onNavigate={navigate} />
      <HelpDrawer isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveItem={removeFromWishlist}
        onAddToCart={addToCart}
        onNavigate={navigate}
      />
    </Suspense>
  );

  const cartDrawer = (
    <CartDrawer
      isOpen={isCartOpen}
      onClose={() => setIsCartOpen(false)}
      cart={cart}
      onUpdateQuantity={updateQuantity}
      onRemoveItem={removeFromCart}
      onNavigate={navigate}
    />
  );

  // Determine route paths ignoring query strings
  const routePath = currentPath.split("?")[0];

  if (routePath === "/checkout/confirmation") {
    const searchParams = new URLSearchParams(window.location.search);
    const confirmedEmail = searchParams.get("email");
    const confirmedOrderId = searchParams.get("orderId");

    return (
      <>
        <SiteHeader {...headerProps} />
        <div className="confirmation-page">
          <div className="confirmation-box">
            <h1 style={{ fontFamily: "var(--serif)", fontSize: "42px", marginBottom: "16px" }}>Thank You!</h1>
            <h2 style={{ color: "#5cb85c", marginBottom: "12px" }}>Order Placed Successfully!</h2>
            <p style={{ fontSize: "16px", color: "var(--iron)", lineHeight: "1.6", marginBottom: "8px" }}>
              We have received your order and are preparing it for shipment.
            </p>
            {confirmedOrderId && (
              <p style={{ fontSize: "14px", color: "var(--charcoal)", fontWeight: 600 }}>
                Order #{confirmedOrderId.slice(-8).toUpperCase()}
              </p>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            {confirmedEmail && confirmedOrderId && (
              <button
                type="button"
                className="pill-button"
                onClick={() => {
                  clearCart();
                  navigate(
                    `/orders/track?email=${encodeURIComponent(
                      confirmedEmail
                    )}&orderId=${encodeURIComponent(confirmedOrderId)}`
                  );
                }}
                style={{
                  background: "var(--charcoal)",
                  color: "var(--canvas)",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 700,
                }}
              >
                Track Order
              </button>
            )}
            <button
              type="button"
              className="pill-button"
              onClick={() => { clearCart(); navigate("/"); }}
              style={{
                background: "var(--canvas)",
                color: "var(--charcoal)",
                border: "1px solid var(--charcoal)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Return to Storefront
            </button>
          </div>
        </div>
        {renderOverlays()}
      </>
    );
  }

  if (routePath === "/checkout") {
    return (
      <>
        <SiteHeader {...headerProps} />
        <ErrorBoundary>
          <Suspense
            fallback={
              <div className="checkout-view" style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "var(--iron)", padding: "48px" }}>
                  <div style={{ width: "32px", height: "32px", border: "3px solid var(--cloud)", borderTopColor: "var(--charcoal)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: "15px", fontWeight: 500 }}>Loading secure checkout...</p>
                </div>
              </div>
            }
          >
            <CheckoutView cart={cart} onNavigate={navigate} onClearCart={clearCart} />
          </Suspense>
        </ErrorBoundary>
        {renderOverlays()}
      </>
    );
  }

  if (currentPath.startsWith("/orders/track")) {
    const urlParams = new URLSearchParams(window.location.search);
    const initialEmail = urlParams.get("email") || "";
    const initialOrderId = urlParams.get("orderId") || urlParams.get("token") || "";

    return (
      <>
        <SiteHeader {...headerProps} />
        <ErrorBoundary>
          <Suspense
            fallback={
              <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ textAlign: "center", color: "var(--iron)", padding: "48px" }}>
                  <div style={{ width: "32px", height: "32px", border: "3px solid var(--cloud)", borderTopColor: "var(--charcoal)", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: "15px", fontWeight: 500 }}>Loading order details...</p>
                </div>
              </div>
            }
          >
            <OrderTrackingView
              initialEmail={initialEmail}
              initialOrderId={initialOrderId}
              onNavigate={navigate}
            />
          </Suspense>
        </ErrorBoundary>
        <NewsletterFooter />
        {cartDrawer}
        {renderOverlays()}
      </>
    );
  }

  if (collectionSlug) {
    return (
      <>
        <SiteHeader {...headerProps} />
        <ErrorBoundary>
          <ProductListingPage
            slug={collectionSlug}
            onAddToCart={addToCart}
            onNavigate={navigate}
            isInWishlist={isInWishlist}
            onToggleWishlist={toggleWishlist}
          />
        </ErrorBoundary>
        <NewsletterFooter />
        {cartDrawer}
        {renderOverlays()}
      </>
    );
  }

  if (productSlug) {
    return (
      <>
        <SiteHeader {...headerProps} />
        <ErrorBoundary>
          <ProductDetailView
            slug={productSlug}
            onAddToCart={addToCart}
            onNavigate={navigate}
            isWishlisted={productSlug ? isInWishlist(productSlug) : false}
            onToggleWishlist={toggleWishlist}
          />
        </ErrorBoundary>
        <NewsletterFooter />
        {cartDrawer}
        {renderOverlays()}
      </>
    );
  }

  return (
    <>
      <SiteHeader {...headerProps} />
      <main id="main-content" tabIndex={-1}>
        <Hero audience={audience} onAudienceChange={handleAudienceChange} />
        <CategoryStrip activeCategory={activeCategory} onCategoryChange={handleCategoryChange} />
        <ProductSection
          activeCategory={activeCategory}
          audience={audience}
          onAddToCart={addToCart}
          isInWishlist={isInWishlist}
          onToggleWishlist={toggleWishlist}
        />
        <MvpSection />
        <PromoSection />
        <MaterialStory />
        <ReviewsSection />
        <PayloadContract />
      </main>
      <NewsletterFooter />
      {cartDrawer}
      {renderOverlays()}
    </>
  );
}
