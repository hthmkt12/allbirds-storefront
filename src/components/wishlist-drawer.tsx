import { WishlistItem } from "../utils/use-wishlist";
import { useDrawerA11y } from "../utils/use-drawer-a11y";
import { ResponsiveImage } from "./responsive-image";

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: WishlistItem[];
  onRemoveItem: (name: string) => void;
  onAddToCart: (item: { name: string; price: string; size: number; color: string; image: string }) => void;
  onNavigate: (path: string) => void;
}

export function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveItem,
  onAddToCart,
}: WishlistDrawerProps) {
  const panelRef = useDrawerA11y(isOpen, onClose);

  return (
    <>
      <div className={`cart-drawer-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
      <div
        ref={panelRef}
        className={`drawer-panel wishlist-drawer ${isOpen ? "open" : ""}`}
        role="dialog"
        aria-label="Wishlist"
        aria-modal="true"
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h2 style={{ margin: 0, fontFamily: "var(--serif)" }}>Your Wishlist ({wishlist.length})</h2>
          <button
            type="button"
            aria-label="Close wishlist"
            onClick={onClose}
            style={{ border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}
          >
            &times;
          </button>
        </div>

        {wishlist.length === 0 ? (
          <div style={{ margin: "40px auto", textAlign: "center", fontSize: "16px", color: "var(--iron)" }}>
            Your wishlist is empty.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", flex: 1, overflowY: "auto", gap: "16px" }}>
            {wishlist.map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  gap: "12px",
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--line)",
                  alignItems: "center",
                }}
              >
                <ResponsiveImage
                  image={item.image}
                  alt={item.name}
                  style={{ width: "70px", height: "70px", objectFit: "cover", borderRadius: "4px", border: "1px solid var(--line)" }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: "14px", textTransform: "uppercase" }}>{item.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--iron)" }}>{item.color}</div>
                  <div style={{ fontWeight: 700, marginTop: "4px" }}>{item.price}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <button
                    type="button"
                    className="pill-button"
                    onClick={() => {
                      onAddToCart({
                        name: item.name,
                        price: item.price,
                        size: 9, // default
                        color: item.color,
                        image: item.image,
                      });
                      onRemoveItem(item.name);
                    }}
                    style={{
                      padding: "6px 12px",
                      fontSize: "11px",
                      background: "var(--charcoal)",
                      color: "var(--canvas)",
                      border: "none",
                      minHeight: "32px",
                    }}
                  >
                    Move to Bag
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(item.name)}
                    style={{
                      border: "none",
                      background: "none",
                      fontSize: "12px",
                      color: "var(--iron)",
                      textDecoration: "underline",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
