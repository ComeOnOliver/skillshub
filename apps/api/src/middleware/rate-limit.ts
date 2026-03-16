import type { Context, Next } from "hono";
import { RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS } from "@skillshub/shared/constants";

const windowMap = new Map<string, { count: number; resetAt: number }>();

// Periodic cleanup: remove expired entries every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of windowMap) {
    if (now > entry.resetAt) {
      windowMap.delete(key);
    }
  }
}, 60_000).unref();

export function rateLimit(maxRequests = RATE_LIMIT_MAX_REQUESTS, windowMs = RATE_LIMIT_WINDOW_MS) {
  return async (c: Context, next: Next) => {
    const key =
      c.get("apiKeyId") ??
      c.req.header("x-forwarded-for") ??
      "unknown";

    const now = Date.now();
    const entry = windowMap.get(key);

    if (!entry || now > entry.resetAt) {
      windowMap.set(key, { count: 1, resetAt: now + windowMs });
      await next();
      return;
    }

    if (entry.count >= maxRequests) {
      c.header("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      return c.json(
        { error: { code: "RATE_LIMITED", message: "Too many requests" } },
        429
      );
    }

    entry.count++;
    await next();
  };
}
