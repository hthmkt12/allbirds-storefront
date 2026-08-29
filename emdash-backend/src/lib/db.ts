// @ts-ignore
import { env as cfEnv } from "cloudflare:workers";

export function getDb(locals?: any): any {
  // 1. Astro 6+ Cloudflare Workers runtime standard
  if (cfEnv?.DB) {
    return cfEnv.DB;
  }

  // 2. Node / local development fallback
  if (locals && typeof locals === "object") {
    if (locals.DB) return locals.DB;
  }

  return null;
}
