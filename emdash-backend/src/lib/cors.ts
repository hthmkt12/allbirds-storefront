export const corsHeaders: Record<string, string> = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const contentCacheHeaders: Record<string, string> = {
  ...corsHeaders,
  "Cache-Control": "public, max-age=300, s-maxage=3600",
};

export function jsonResponse(data: unknown, status = 200, headers = corsHeaders) {
  return new Response(JSON.stringify(data), {
    status,
    headers,
  });
}

export function errorResponse(message: string, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: corsHeaders,
  });
}
