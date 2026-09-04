import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  recordEvent,
  recordError,
  recordMetric,
  recordDegradation,
  flushTelemetry,
  initGlobalErrorTracking,
} from "./telemetry";

describe("telemetry utility", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("records events and flushes safely without error when endpoint is empty", () => {
    expect(() => {
      recordEvent("custom", "test_action", { foo: "bar" });
      recordMetric("checkout_latency", 120, { step: "shipping" });
      recordDegradation("cms", "timeout", { duration: 4000 });
      recordError(new Error("Sample test error"), { source: "unit_test" });
      flushTelemetry();
    }).not.toThrow();
  });

  it("attempts to sendBeacon when endpoint is configured", () => {
    const sendBeaconMock = vi.fn().mockReturnValue(true);
    Object.defineProperty(navigator, "sendBeacon", {
      value: sendBeaconMock,
      configurable: true,
      writable: true,
    });

    // Mock endpoint
    vi.stubEnv("VITE_TELEMETRY_URL", "https://telemetry.allbirds.test/collect");

    recordEvent("metric", "lcp", { value: 340 });
    flushTelemetry();

    expect(sendBeaconMock).toHaveBeenCalled();
    const args = sendBeaconMock.mock.calls[0];
    expect(args[0]).toBe("https://telemetry.allbirds.test/collect");
  });

  it("falls back to fetch if sendBeacon is unavailable", async () => {
    Object.defineProperty(navigator, "sendBeacon", {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    globalThis.fetch = fetchMock;

    vi.stubEnv("VITE_TELEMETRY_URL", "https://telemetry.allbirds.test/collect");

    recordEvent("error", "render_fail", { code: 500 });
    flushTelemetry();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://telemetry.allbirds.test/collect",
      expect.objectContaining({
        method: "POST",
        keepalive: true,
      })
    );
  });

  it("attaches global error handlers and removes them on cleanup", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const cleanup = initGlobalErrorTracking();

    expect(addEventListenerSpy).toHaveBeenCalledWith("error", expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));

    cleanup();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("error", expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith("unhandledrejection", expect.any(Function));
  });
});
