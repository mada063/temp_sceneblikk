/**
 * Server-side cache for Google Tasks API responses
 * Stores task data with timestamps to serve cached data when rate limited
 */

type CacheKey = string;

interface CacheEntry {
  data: {
    taskList?: {
      id: string;
      title: string;
    } | null;
    tasks: Array<{
      id: string;
      title: string;
      status?: string | null;
      due?: string | null;
      notes?: string | null;
      updated?: string | null;
      position?: string | null;
    }>;
  };
  cachedAt: number;
}

// In-memory cache store (per server instance)
// In production with multiple instances, consider using Redis or similar
const cacheStore = new Map<CacheKey, CacheEntry>();

/**
 * Get cached tasks data if it exists
 * @param key Unique cache key (based on user, task list)
 * @returns Cached data or null if not found
 */
export function getCachedTasksData(key: CacheKey): CacheEntry | null {
  return cacheStore.get(key) || null;
}

/**
 * Store tasks data in cache
 * @param key Unique cache key
 * @param data Tasks data to cache
 */
export function setCachedTasksData(
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

