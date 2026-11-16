/**
 * Server-side rate limiting utility
 * Tracks last API call times per user/session in memory
 */

type RateLimitKey = string;

interface RateLimitEntry {
  lastCallTime: number;
}

// In-memory store for rate limiting (per server instance)
// In production with multiple instances, consider using Redis or similar
const rateLimitStore = new Map<RateLimitKey, RateLimitEntry>();

/**
 * Check if an API call should be rate limited
 * @param key Unique identifier for the rate limit (e.g., user ID, session ID, or API endpoint)
 * @param limitMs Minimum time in milliseconds between calls
 * @returns true if the call should be allowed, false if rate limited
 */
export function checkRateLimit(key: RateLimitKey, limitMs: number): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry) {
    // First call - allow it and record the time
    rateLimitStore.set(key, { lastCallTime: now });
    return true;
  }

  const timeSinceLastCall = now - entry.lastCallTime;

  if (timeSinceLastCall >= limitMs) {
    // Enough time has passed - allow the call and update the time
    entry.lastCallTime = now;
    return true;
  }

  // Rate limited - not enough time has passed
  return false;
}

/**
 * Get the time remaining until the next allowed call
 * @param key Unique identifier for the rate limit
 * @param limitMs Minimum time in milliseconds between calls
 * @returns Time remaining in milliseconds, or 0 if call is allowed
 */
export function getTimeUntilNextCall(key: RateLimitKey, limitMs: number): number {
  const entry = rateLimitStore.get(key);
  if (!entry) {
    return 0;
  }

  const now = Date.now();
  const timeSinceLastCall = now - entry.lastCallTime;
  const remaining = limitMs - timeSinceLastCall;

  return Math.max(0, remaining);
}

/**
 * Clear rate limit entry (useful for testing or manual reset)
 */
export function clearRateLimit(key: RateLimitKey): void {
  rateLimitStore.delete(key);
}

/**
 * Clean up old entries (optional - can be called periodically to prevent memory leaks)
 * Removes entries older than maxAgeMs
 */
export function cleanupOldEntries(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now - entry.lastCallTime > maxAgeMs) {
      rateLimitStore.delete(key);
    }
  }
}

