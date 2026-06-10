import { Leaf, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { 
  getMaterials, 
  getReviews, 
  CmsMaterial, 
  CmsReview 
} from "../utils/cms-client";
import {
  footerGroups,
  materialMetrics,
  payloadModels,
  workflowRules,
} from "../data/allbirds-data";
import { ResponsiveImage } from "./responsive-image";

export function MaterialStory() {
  const [materials, setMaterials] = useState<CmsMaterial[]>([]);

  useEffect(() => {
    getMaterials().then((data) => {
      setMaterials(data);
    });
  }, []);

  return (
    <section className="material-band" id="about">
      <div>
        <Leaf size={22} />
        <p className="section-kicker">Materials From The Earth</p>
        <h2>Comfort, sustainability, and natural fibers in every step.</h2>
      </div>
      <ResponsiveImage image="/allbirds-material-texture.png" alt="Natural material swatches on linen" sizes="(max-width: 920px) 100vw, 50vw" />
      <div className="metric-row">
        {materialMetrics.map((metric) => (
          <article key={metric.label}>
            <strong>{metric.value}</strong>
            <span>{metric.label}</span>
          </article>
        ))}
      </div>
      <div className="value-grid">
        {materials.map((item) => (
          <article key={item.name}>
            <h3>{item.name}</h3>
            <p>{item.impactNote}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ReviewsSection() {
  const [reviewsList, setReviewsList] = useState<CmsReview[]>([]);

  useEffect(() => {
    getReviews().then((data) => {
      setReviewsList(data);
    });
  }, []);

  return (
    <section className="review-band">
      <p className="section-kicker">From The Flock</p>
      <h2>Real-feeling proof for the product story.</h2>
      <div className="review-grid">
        {reviewsList.map((review, i) => (
          <article key={i}>
            <p>"{review.quote}"</p>
            <strong>{review.customerName}</strong>
            <span>{review.detail}</span>
          </article>
        ))}
      </div>
    </section>
  );
}


export function PayloadContract() {
  return (
    <section className="payload-band" id="payload">
      <div>
        <p className="section-kicker">Payload CMS Contract</p>
        <h2>Frontend content is shaped for Payload collections.</h2>
        <div className="payload-grid">
          {payloadModels.map((model) => (
            <article className="payload-card" key={model.name}>
              <h3>{model.name}</h3>
              <ul>{model.fields.map((field) => <li key={field}>{field}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className="workflow-note">
          {workflowRules.map((rule) => <span key={rule}>{rule}</span>)}
        </div>
      </div>
    </section>
  );
}

export function NewsletterFooter() {
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  return (
    <footer className="footer">
      <div>
        <strong>Allbirds</strong>
        <p>Natural materials. Quiet interface. Payload-ready content.</p>
      </div>
      {subscribed ? (
        <div className="newsletter-success" style={{
          padding: '12px 18px',
          border: '1px solid var(--charcoal)',
          fontWeight: 'bold',
          alignSelf: 'center'
        }}>
          Thanks for subscribing!
        </div>
      ) : (
        <form className="email-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Follow the flock</label>
          <div>
            <input id="email" type="email" placeholder="Email address" required />
            <button type="submit"><Mail size={16} /> Join</button>
          </div>
        </form>
      )}
      <nav aria-label="Footer">
        {footerGroups.map((group) => (
          <div key={group.title}>
            <b>{group.title}</b>
            {group.links.map((link) => <a key={link} href="#top">{link}</a>)}
          </div>
        ))}
      </nav>
    </footer>
  );
}
