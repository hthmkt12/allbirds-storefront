export type TelemetryEventType = "error" | "metric" | "degradation" | "custom";

export interface TelemetryEvent {
  type: TelemetryEventType;
  name: string;
  data?: Record<string, unknown>;
  timestamp: number;
}

let isReporting = false;
const eventBuffer: TelemetryEvent[] = [];
const MAX_BUFFER_SIZE = 25;

export function getTelemetryEndpoint(): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_TELEMETRY_URL) {
    return String(import.meta.env.VITE_TELEMETRY_URL);
  }
  return "";
}

export function flushTelemetry(): void {
  if (eventBuffer.length === 0 || isReporting) return;
  isReporting = true;

  const eventsToSend = [...eventBuffer];
  eventBuffer.length = 0;

  const endpoint = getTelemetryEndpoint();
  if (!endpoint) {
    isReporting = false;
    return;
  }

  const payload = JSON.stringify({ events: eventsToSend });

  try {
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      const sent = navigator.sendBeacon(endpoint, blob);
      if (sent) {
        isReporting = false;
        return;
      }
    }

    if (typeof fetch !== "undefined") {
      fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Drop silently on network failure to avoid recursive error
      }).finally(() => {
        isReporting = false;
      });
      return;
    }
  } catch {
    // Ignore transport errors
  }

  isReporting = false;
}

export function recordEvent(type: TelemetryEventType, name: string, data?: Record<string, unknown>): void {
  eventBuffer.push({
    type,
    name,
    data,
    timestamp: Date.now(),
  });

  if (eventBuffer.length >= MAX_BUFFER_SIZE) {
    flushTelemetry();
  }
}

export function recordError(error: Error | unknown, context?: Record<string, unknown>): void {
  const err = error instanceof Error ? error : new Error(String(error));
  recordEvent("error", err.name || "Error", {
    message: err.message,
    stack: err.stack,
    ...context,
  });
}

export function recordMetric(name: string, value: number, tags?: Record<string, string>): void {
  recordEvent("metric", name, {
    value,
    ...tags,
  });
}

export function recordDegradation(source: string, reason: string, meta?: Record<string, unknown>): void {
  recordEvent("degradation", source, {
    reason,
    ...meta,
  });
}

export function initGlobalErrorTracking(): () => void {
  if (typeof window === "undefined") return () => {};

  const handleError = (event: ErrorEvent) => {
    recordError(event.error || event.message, {
      source: "window.onerror",
      lineno: event.lineno,
      colno: event.colno,
      filename: event.filename,
    });
  };

  const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    recordError(event.reason, {
      source: "window.onunhandledrejection",
    });
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      flushTelemetry();
    }
  };

  window.addEventListener("error", handleError);
  window.addEventListener("unhandledrejection", handleUnhandledRejection);
  window.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", flushTelemetry);

  return () => {
    window.removeEventListener("error", handleError);
    window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    window.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", flushTelemetry);
  };
}
