import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SizeGuideModal } from "./size-guide-modal";

describe("SizeGuideModal Component", () => {
  it("renders nothing when isOpen is false", () => {
    const { container } = render(<SizeGuideModal isOpen={false} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders dialog, title, size rows, and close button when isOpen is true", () => {
    render(<SizeGuideModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "Size Guide" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Size Guide" })).toBeInTheDocument();
    expect(screen.getByText("US")).toBeInTheDocument();
    expect(screen.getByText("UK")).toBeInTheDocument();
    expect(screen.getByText("EU")).toBeInTheDocument();
    expect(screen.getByText("CM")).toBeInTheDocument();
    expect(screen.getByText("Close")).toBeInTheDocument();
  });

  it("calls onClose when clicking close button or overlay", () => {
    const onClose = vi.fn();
    const { container } = render(<SizeGuideModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalledTimes(1);

    const overlay = container.querySelector(".size-guide-modal-overlay");
    expect(overlay).not.toBeNull();
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
