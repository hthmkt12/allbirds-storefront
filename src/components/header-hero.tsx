import { CircleHelp, Search, ShoppingBag, UserCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getHeroBlocks, CmsHeroBlock } from "../utils/cms-client";
import { ResponsiveImage } from "./responsive-image";

type HeroProps = {
  audience: string;
  onAudienceChange: (value: string) => void;
};

export function SiteHeader({
  onBagClick,
  onSearchClick
}: {
  onBagClick?: () => void;
  onSearchClick?: () => void;
} = {}) {
  return (
    <header className="site-header">
      <div className="announcement">Free Shipping on Orders over $150. Easy Returns.</div>
      <nav className="top-nav floating" aria-label="Primary navigation">
        <a className="brand script" href="#top">allbirds</a>
        <div className="nav-links">
          <a href="#new-arrivals">Men</a>
          <a href="#new-arrivals">Women</a>
          <a href="#sale">Sale</a>
          <a href="#payload">Payload</a>
        </div>
        <div className="nav-actions">
          <a href="#about">About</a>
          <button className="icon-button" aria-label="Search" onClick={onSearchClick}><Search size={17} /></button>
          <button className="icon-button" aria-label="Account"><UserCircle size={18} /></button>
          <button className="icon-button" aria-label="Help"><CircleHelp size={18} /></button>
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
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

