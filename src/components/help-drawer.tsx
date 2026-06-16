import { useEffect } from "react";

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpDrawer({ isOpen, onClose }: HelpDrawerProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const faqSections = [
    {
      title: "Contact Us",
      content: "Email: support@allbirds.com\nPhone: 1-888-963-8944\nHours: Mon-Fri, 7am-5pm PT",
    },
    {
      title: "Returns & Exchanges",
      content: "We offer a 30-day return and exchange policy on all unworn items. Items must be in original condition with tags attached. Free return shipping on all US orders.",
    },
    {
      title: "Shipping Info",
      content: "Free standard shipping on orders over $150. Standard delivery takes 5-7 business days. Express shipping (2-3 days) available for $15.",
    },
  ];

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div
        className={`help-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Help"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)" }}>Help</h2>
          <button
            type="button"
            aria-label="Close help"
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
          >&times;</button>
        </div>

        {faqSections.map((section) => (
          <div key={section.title} style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--line)" }}>
            <h3 style={{ fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px" }}>
              {section.title}
            </h3>
            <p style={{ fontSize: "14px", color: "var(--iron)", lineHeight: 1.6, margin: 0, whiteSpace: "pre-line" }}>
              {section.content}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
