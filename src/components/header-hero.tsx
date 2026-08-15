import { CircleHelp, Heart, Search, ShoppingBag, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getHeroBlocks, CmsHeroBlock } from "../utils/cms-client";
import { ResponsiveImage } from "./responsive-image";

type HeroProps = {
  audience: string;
  onAudienceChange: (value: string) => void;
};

export function SiteHeader({
  onBagClick,
  onSearchClick,
  onAccountClick,
  onHelpClick,
  onWishlistClick,
  wishlistCount = 0,
  onNavigate,
}: {
  onBagClick?: () => void;
  onSearchClick?: () => void;
  onAccountClick?: () => void;
  onHelpClick?: () => void;
  onWishlistClick?: () => void;
  wishlistCount?: number;
  onNavigate?: (path: string) => void;
} = {}) {
  const handleNav = (path: string) => {
    onNavigate?.(path);
  };

  return (
    <header className="site-header">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <div className="announcement">Free Shipping on Orders over $150. Easy Returns.</div>
      <nav className="top-nav floating" aria-label="Primary navigation">
        <a
          className="brand script"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNav("/");
          }}
        >
          allbirds
        </a>
        <div className="nav-links">
          <a
            href="#new-arrivals"
            onClick={(e) => {
              e.preventDefault();
              handleNav("/collections/mens#new-arrivals");
            }}
          >
            Men
          </a>
          <a
            href="#new-arrivals"
            onClick={(e) => {
              e.preventDefault();
              handleNav("/collections/womens#new-arrivals");
            }}
          >
            Women
          </a>
          <a
            href="#sale"
            onClick={(e) => {
              e.preventDefault();
              handleNav("/#sale");
            }}
          >
            Sale
          </a>
          <a
            href="#payload"
            onClick={(e) => {
              e.preventDefault();
              handleNav("/#payload");
            }}
          >
            Payload
          </a>
        </div>
        <div className="nav-actions">
          <a
            href="#about"
            onClick={(e) => {
              e.preventDefault();
              handleNav("/#about");
            }}
          >
            About
          </a>
          <button className="icon-button" aria-label="Search" onClick={onSearchClick}><Search size={17} /></button>
          <button className="icon-button" aria-label="Wishlist" onClick={onWishlistClick} style={{ position: "relative" }}>
            <Heart size={18} />
            {wishlistCount > 0 && (
              <span style={{
                position: "absolute",
                top: "-4px",
                right: "-4px",
                background: "var(--rose, #d1b0a4)",
                color: "var(--charcoal)",
                fontSize: "10px",
                fontWeight: 800,
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--canvas)",
              }}>
                {wishlistCount}
              </span>
            )}
          </button>
          <button className="icon-button" aria-label="Account" onClick={onAccountClick}><UserCircle size={18} /></button>
          <button className="icon-button" aria-label="Help" onClick={onHelpClick}><CircleHelp size={18} /></button>
          <button className="icon-button" aria-label="Bag" onClick={onBagClick}><ShoppingBag size={18} /></button>
        </div>
      </nav>
    </header>
  );
}

export function Hero({ audience, onAudienceChange }: HeroProps) {
  const [hero, setHero] = useState<CmsHeroBlock | null>(null);

  useEffect(() => {
    getHeroBlocks().then((blocks) => {
      if (blocks && blocks.length > 0) {
        setHero(blocks[0]);
      }
    });
  }, []);

  const headline = hero ? hero.headline : "Wildly Comfortable. Super Natural.";
  const body = hero ? hero.body : "All New Dasher NZ Collection";
  const ctaLabel = hero ? hero.ctaLabel : "Shop Men / Shop Women";
  const buttons = ctaLabel.split(" / ");
  const mediaImage = hero?.media || "/allbirds-lifestyle-hero.png";

  return (
    <section className="home-hero" id="top" aria-label={body}>
      <ResponsiveImage image={mediaImage} alt="Allbirds-inspired natural runner shoes on city steps" priority={true} sizes="100vw" />
      <div className="hero-overlay">
        <p className="section-kicker">{body}</p>
        <h1>{headline}</h1>
        <div className="hero-actions" role="tablist" aria-label="Hero shop links">
          {buttons.map((item) => (
            <button
              key={item}
              className={audience === item ? "selected" : ""}
              onClick={() => onAudienceChange(item)}
              role="tab"
              aria-selected={audience === item}
              aria-controls="new-arrivals"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
