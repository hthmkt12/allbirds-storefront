import { describe, it, expect, vi } from "vitest";
import { onRequest } from "./middleware";

describe("emdash-backend onRequest middleware", () => {
  it("logs structured JSON info on successful request and passes through response", async () => {
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    const mockResponse = new Response(JSON.stringify({ status: "ok" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

    const mockContext = {
      request: new Request("https://allbirds-emdash-backend.worldnew.workers.dev/api/products", {
        method: "GET",
        headers: { "user-agent": "Vitest/1.0" },
      }),
    } as any;

    const mockNext = vi.fn().mockResolvedValue(mockResponse);

    const result = await (onRequest as any)(mockContext, mockNext);

    expect(result.status).toBe(200);
    expect(mockNext).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalled();

    const loggedJson = JSON.parse(consoleLogSpy.mock.calls[0][0]);
    expect(loggedJson.level).toBe("info");
    expect(loggedJson.method).toBe("GET");
    expect(loggedJson.path).toBe("/api/products");
    expect(loggedJson.status).toBe(200);
    expect(typeof loggedJson.durationMs).toBe("number");

    consoleLogSpy.mockRestore();
  });

  it("catches unhandled route error, logs error JSON, and returns 500 response", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const mockContext = {
      request: new Request("https://allbirds-emdash-backend.worldnew.workers.dev/api/orders", {
        method: "POST",
      }),
    } as any;

    const mockNext = vi.fn().mockRejectedValue(new Error("Unexpected crash in DB query"));

    const result = await (onRequest as any)(mockContext, mockNext);

    expect(result.status).toBe(500);
    const body = await result.json();
    expect(body).toEqual({ error: "Internal Server Error" });

    expect(consoleErrorSpy).toHaveBeenCalled();
    const loggedError = JSON.parse(consoleErrorSpy.mock.calls[0][0]);
    expect(loggedError.level).toBe("error");
    expect(loggedError.status).toBe(500);
    expect(loggedError.error).toContain("Unexpected crash in DB query");

    consoleErrorSpy.mockRestore();
  });
});
