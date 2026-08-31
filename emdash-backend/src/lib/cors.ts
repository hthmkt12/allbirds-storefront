// @ts-ignore - provided by the Cloudflare Workers runtime
import { env as cfEnv } from "cloudflare:workers";

const BASE_HEADERS: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Public content endpoints stay open (catalog data, no PII).
export const corsHeaders: Record<string, string> = {
  ...BASE_HEADERS,
  "Access-Control-Allow-Origin": "*",
};

export const contentCacheHeaders: Record<string, string> = {
  ...corsHeaders,
  "Cache-Control": "public, max-age=300, s-maxage=3600",
};

/**
 * Comma-separated allowlist from the ALLOWED_ORIGINS env var, or null when not
 * configured. Configure it (e.g. via `wrangler secret put` or a var) with the
 * storefront origin(s) to lock down the PII/mutation endpoints.
 */
function originAllowlist(locals?: any): string[] | null {
  const raw = (cfEnv as any)?.ALLOWED_ORIGINS
    ?? (locals && typeof locals === "object" ? locals.ALLOWED_ORIGINS : undefined);
  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return null;
}

/**
 * Origin-aware CORS headers for endpoints that return PII or mutate data
 * (orders create / lookup / webhook).
 *
 * - When ALLOWED_ORIGINS is unset: stays permissive ("*") so nothing breaks;
 *   set the env var to enable strict enforcement.
 * - When set: reflects the request Origin only if it is in the allowlist,
 *   otherwise omits Access-Control-Allow-Origin so browsers block the read.
 */
export function privateCorsHeaders(request: Request, locals?: any): Record<string, string> {
  const list = originAllowlist(locals);
  if (!list) {
    return { ...corsHeaders };
  }
  const origin = request.headers.get("Origin");
  if (origin && list.includes(origin)) {
    return { ...BASE_HEADERS, "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }
  return { ...BASE_HEADERS, Vary: "Origin" };
}

export function jsonResponse(data: unknown, status = 200, headers = corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function errorResponse(message: string, status = 500, headers = corsHeaders) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers,
  });
}
