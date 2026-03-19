import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Upstash Redis client – initialised lazily so the app still boots when
// env vars are missing (e.g. local dev without Redis).
// ---------------------------------------------------------------------------

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

// ---------------------------------------------------------------------------
// Pre-built limiters (sliding window)
// ---------------------------------------------------------------------------

function createLimiter(
  tokens: number,
  window: Parameters<typeof Ratelimit.slidingWindow>[1],
  prefix: string,
) {
  return () => {
    const r = getRedis();
    if (!r) return null;
    return new Ratelimit({
      redis: r,
      limiter: Ratelimit.slidingWindow(tokens, window),
      prefix,
    });
  };
}

/** 60 requests per 60 seconds – for GET / read endpoints */
export const readLimiter = createLimiter(60, "60 s", "rl:read");

/** 20 requests per 60 seconds – for POST / PUT / DELETE write endpoints */
export const writeLimiter = createLimiter(20, "60 s", "rl:write");

/** 5 requests per hour – for agent registration */
export const registerLimiter = createLimiter(5, "3600 s", "rl:register");

// ---------------------------------------------------------------------------
// rateLimit() helper
// ---------------------------------------------------------------------------

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix epoch ms
}

/**
 * Check rate limit for a given identifier and limiter.
 * Fails open – if Upstash is unreachable the request is allowed through.
 */
export async function rateLimit(
  identifier: string,
  limiterFn: () => Ratelimit | null,
): Promise<RateLimitResult> {
  try {
    const limiter = limiterFn();
    if (!limiter) {
      // Redis not configured – fail open
      return { success: true, limit: 0, remaining: 0, reset: 0 };
    }
    const { success, limit, remaining, reset } = await limiter.limit(identifier);
    return { success, limit, remaining, reset };
  } catch (error) {
    console.warn("[rate-limit] Upstash check failed, allowing request through:", error);
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }
}

// ---------------------------------------------------------------------------
// Identifier helpers
// ---------------------------------------------------------------------------

/** Extract a stable client identifier from the request. */
export function getIdentifier(request: Request, apiKeyId?: string): string {
  if (apiKeyId) return `key:${apiKeyId}`;
  // x-real-ip is set by Vercel and cannot be spoofed by the client
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return `ip:${realIp}`;
  // Fallback to x-forwarded-for (less reliable)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return `ip:${forwarded.split(",")[0].trim()}`;
  return "ip:unknown";
}
