/**
 * Simple in-memory per-user rate limiter.
 * Not suitable for multi-instance deployments — use Redis in that case.
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 10 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000;

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < 3600_000);
      if (entry.timestamps.length === 0) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
  // Don't block process exit
  if (cleanupTimer && typeof cleanupTimer === "object" && "unref" in cleanupTimer) {
    cleanupTimer.unref();
  }
}

/**
 * Check if a request should be rate-limited.
 * @param key - Unique key (e.g., `scan:${userId}`)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 1 hour)
 * @returns `null` if allowed, or a message string if rate-limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 3600_000
): string | null {
  ensureCleanup();

  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0];
    const retryAfterMs = windowMs - (now - oldestInWindow);
    const retryAfterMin = Math.ceil(retryAfterMs / 60_000);
    return `Rate limit exceeded. Max ${maxRequests} requests per ${Math.round(windowMs / 60_000)} minutes. Try again in ${retryAfterMin} minute(s).`;
  }

  entry.timestamps.push(now);
  return null;
}
