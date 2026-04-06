import type { Context, Next } from "hono";
import { Redis } from "@upstash/redis";
import {
  RATE_LIMIT_WINDOW_MS,
  RATE_LIMIT_MAX_REQUESTS,
} from "@skillshub/shared/constants";

// Lazily initialize Redis client to avoid errors during module load
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    console.error(
      "[rate-limit] Redis not configured. Rate limiting requires Redis to be configured.",
    );
    return null;
  }
  redis = new Redis({ url, token });
  return redis;
}

export function rateLimit(
  maxRequests = RATE_LIMIT_MAX_REQUESTS,
  windowMs = RATE_LIMIT_WINDOW_MS,
) {
  return async (c: Context, next: Next) => {
    const key =
      c.get("apiKeyId") ??
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";

    const redisClient = getRedis();

    if (!redisClient) {
      // Fail closed: Redis is required for rate limiting
      return c.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Rate limiting service unavailable",
          },
        },
        503,
      );
    }

    // Use Redis for production/serverless environments
    const windowKey = Math.floor(Date.now() / windowMs);
    const redisKey = `ratelimit:${key}:${windowKey}`;

    try {
      const current = await redisClient.incr(redisKey);

      // Setting TTL for auto-cleanup
      if (current === 1) {
        await redisClient.expire(redisKey, Math.ceil(windowMs / 1000));
      }

      const remaining = Math.max(0, maxRequests - current);
      const resetSeconds = (windowKey + 1) * Math.floor(windowMs / 1000);
      c.header("X-RateLimit-Limit", String(maxRequests));
      c.header("X-RateLimit-Remaining", String(remaining));
      c.header("X-RateLimit-Reset", String(resetSeconds));

      if (current > maxRequests) {
        c.header("Retry-After", String(Math.ceil(windowMs / 1000)));
        return c.json(
          { error: { code: "RATE_LIMITED", message: "Too many requests" } },
          429,
        );
      }
    } catch (error) {
      console.error("[rate-limit] Redis error:", error);
      // Fail closed on Redis errors
      return c.json(
        {
          error: {
            code: "SERVICE_UNAVAILABLE",
            message: "Rate limiting service unavailable",
          },
        },
        503,
      );
    }
    await next();
  };
}
