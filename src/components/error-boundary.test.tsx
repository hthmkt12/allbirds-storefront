import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "./error-boundary";
import * as telemetry from "../utils/telemetry";

function ProblemChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error("Deliberate test explosion");
  }
  return <div>Safe child content</div>;
}

describe("ErrorBoundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Safe child content")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("catches render error, records telemetry, and displays fallback UI", () => {
    const recordErrorSpy = vi.spyOn(telemetry, "recordError");
    const onErrorSpy = vi.fn();

    render(
      <ErrorBoundary onError={onErrorSpy}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.queryByText("Safe child content")).toBeNull();
    const alert = screen.getByRole("alert");
    expect(alert).toBeDefined();
    expect(screen.getByText("Something went astray")).toBeDefined();
    expect(recordErrorSpy).toHaveBeenCalled();
    expect(onErrorSpy).toHaveBeenCalled();
  });

  it("supports reset button to retry rendering", () => {
    let throwError = true;
    function DynamicChild() {
      if (throwError) {
        throw new Error("Transient error");
      }
      return <div>Recovered content</div>;
    }

    render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went astray")).toBeDefined();

    // Now fix state and click Try again
    throwError = false;
    const retryBtn = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(retryBtn);

    expect(screen.getByText("Recovered content")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("supports custom function fallback", () => {
    render(
      <ErrorBoundary
        fallback={({ error, reset }) => (
          <div>
            <span>Custom: {error.message}</span>
            <button onClick={reset}>Reset Custom</button>
          </div>
        )}
      >
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText("Custom: Deliberate test explosion")).toBeDefined();
    expect(screen.getByRole("button", { name: "Reset Custom" })).toBeDefined();
  });
});
