import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWishlist } from "./use-wishlist";

describe("useWishlist hook", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("initializes with empty wishlist", () => {
    const { result } = renderHook(() => useWishlist());
    expect(result.current.wishlist).toEqual([]);
    expect(result.current.count).toBe(0);
  });

  it("toggles items in and out of wishlist", () => {
    const { result } = renderHook(() => useWishlist());
    const item = {
      name: "Men's Tree Runner",
      price: "$98",
      image: "/shoe.png",
      color: "Jet Black",
    };

    act(() => {
      result.current.toggleWishlist(item);
    });

    expect(result.current.count).toBe(1);
    expect(result.current.isInWishlist(item.name)).toBe(true);

    // Toggle again to remove
    act(() => {
      result.current.toggleWishlist(item);
    });

    expect(result.current.count).toBe(0);
    expect(result.current.isInWishlist(item.name)).toBe(false);
  });

  it("removes items from wishlist", () => {
    const { result } = renderHook(() => useWishlist());
    const item = {
      name: "Men's Wool Runner",
      price: "$110",
      image: "/shoe.png",
      color: "Natural Grey",
    };

    act(() => {
      result.current.toggleWishlist(item);
    });

    expect(result.current.count).toBe(1);

    act(() => {
      result.current.removeFromWishlist(item.name);
    });

    expect(result.current.count).toBe(0);
  });
});
