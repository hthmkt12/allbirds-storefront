import type { APIContext, MiddlewareNext } from "astro";
import { errorResponse } from "./lib/cors";

export async function onRequest(
  context: APIContext | { request: Request },
  next: MiddlewareNext | (() => Promise<Response>)
): Promise<Response> {
  const start = performance.now();
  const { request } = context;
  const url = new URL(request.url);

  try {
    const response = await next();
    const durationMs = Math.round((performance.now() - start) * 100) / 100;

    // Output structured JSON access log
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        method: request.method,
        path: url.pathname,
        status: response.status,
        durationMs,
        userAgent: request.headers.get("user-agent") || undefined,
      })
    );

    return response;
  } catch (err: unknown) {
    const durationMs = Math.round((performance.now() - start) * 100) / 100;
    const errorObj = err instanceof Error ? err : new Error(String(err));

    console.error(
      JSON.stringify({
        level: "error",
        timestamp: new Date().toISOString(),
        method: request.method,
        path: url.pathname,
        status: 500,
        durationMs,
        error: errorObj.message,
        stack: errorObj.stack,
      })
    );

    return errorResponse("Internal Server Error", 500);
  }
}

