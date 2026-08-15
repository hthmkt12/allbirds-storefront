import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDrawerA11y } from "./use-drawer-a11y";

describe("useDrawerA11y hook", () => {
  it("attaches escape key listener and triggers onClose", () => {
    const onClose = vi.fn();
    renderHook(() => useDrawerA11y(true, onClose));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not attach listener when isOpen is false", () => {
    const onClose = vi.fn();
    renderHook(() => useDrawerA11y(false, onClose));

    act(() => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });

    expect(onClose).not.toHaveBeenCalled();
  });
});
