import { useState, useEffect } from "react";

const WISHLIST_STORAGE_KEY = "allbirds_wishlist";

export interface WishlistItem {
  name: string;
  price: string;
  image: string;
  color: string;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error("Failed to save wishlist", e);
    }
  }, [wishlist]);

  const toggleWishlist = (item: WishlistItem) => {
    setWishlist((prev) => {
      const exists = prev.some((i) => i.name === item.name);
      if (exists) {
        return prev.filter((i) => i.name !== item.name);
      }
      return [...prev, item];
    });
  };

  const isInWishlist = (name: string) => {
    return wishlist.some((i) => i.name === name);
  };

  const removeFromWishlist = (name: string) => {
    setWishlist((prev) => prev.filter((i) => i.name !== name));
  };

  const clearWishlist = () => setWishlist([]);

  return {
    wishlist,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    clearWishlist,
    count: wishlist.length,
  };
}
