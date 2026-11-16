/**
 * Server-side cache for Google Calendar API responses
 * Stores calendar events with timestamps to serve cached data when rate limited
 */

type CacheKey = string;

interface CacheEntry {
  data: {
    events: Array<{
      id: string;
      summary: string;
      start: string;
      end?: string | null;
      allDay?: boolean;
    }>;
  };
  cachedAt: number;
}

// In-memory cache store (per server instance)
// In production with multiple instances, consider using Redis or similar
const cacheStore = new Map<CacheKey, CacheEntry>();

/**
 * Get cached calendar data if it exists
 * @param key Unique cache key (based on user, calendar, year, month)
 * @returns Cached data or null if not found
 */
export function getCachedCalendarData(key: CacheKey): CacheEntry | null {
  return cacheStore.get(key) || null;
}

/**
 * Store calendar data in cache
 * @param key Unique cache key
 * @param data Calendar events data to cache
 */
export function setCachedCalendarData(
  key: CacheKey,
  data: CacheEntry["data"],
): void {
  cacheStore.set(key, {
    data,
    cachedAt: Date.now(),
  });
}

/**
 * Clear a specific cache entry
 * @param key Cache key to clear
 */
export function clearCacheEntry(key: CacheKey): void {
  cacheStore.delete(key);
}

/**
 * Clean up old cache entries (optional - can be called periodically)
 * Removes entries older than maxAgeMs
 */
export function cleanupOldCacheEntries(maxAgeMs: number = 24 * 60 * 60 * 1000): void {
  const now = Date.now();
  for (const [key, entry] of cacheStore.entries()) {
    if (now - entry.cachedAt > maxAgeMs) {
      cacheStore.delete(key);
    }
  }
}

