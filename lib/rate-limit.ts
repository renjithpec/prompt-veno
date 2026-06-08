/**
 * In-memory rate limiter for API routes and server actions.
 * Uses a Map with automatic cleanup — no external dependencies.
 *
 * NOTE: In-memory rate limiting resets on server restart and is per-instance.
 * For production at scale, consider Redis-based rate limiting.
 * However, this provides solid protection for most use cases and
 * works alongside Supabase's own auth rate limits.
 */

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const stores = new Map<string, Map<string, RateLimitEntry>>();

/**
 * Check if a request should be rate limited.
 * @param key - Unique identifier (e.g., IP address or IP + action)
 * @param limit - Max requests allowed in the window
 * @param windowMs - Time window in milliseconds (default: 60 seconds)
 * @param storeName - Namespace to separate different rate limit contexts
 * @returns Object with `allowed` boolean and `remaining` count
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000,
  storeName: string = "default"
): { allowed: boolean; remaining: number } {
  if (!stores.has(storeName)) {
    stores.set(storeName, new Map());
  }
  const store = stores.get(storeName)!;
  const now = Date.now();

  // Clean up expired entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [entryKey, entry] of store) {
      if (now >= entry.resetTime) store.delete(entryKey);
    }
  }

  const entry = store.get(key);

  if (!entry || now >= entry.resetTime) {
    store.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  entry.count += 1;

  if (entry.count > limit) {
    return { allowed: false, remaining: 0 };
  }

  return { allowed: true, remaining: limit - entry.count };
}

/**
 * Extract client IP from request headers.
 * Works on Vercel (x-forwarded-for) and other platforms.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
