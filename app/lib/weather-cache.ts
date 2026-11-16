/**
 * Client-side cache for weather API responses
 * Stores weather data with timestamps to serve cached data when rate limited
 */

type CacheKey = string;

interface CacheEntry {
  data: any; // WeatherData type
  cachedAt: number;
}

/**
 * Get cached weather data if it exists
 * @param key Unique cache key (based on lat, lon)
 * @returns Cached data or null if not found
 */
export function getCachedWeatherData(key: CacheKey): CacheEntry | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const storageKey = `weather_cache_${key}`;
    const stored = localStorage.getItem(storageKey);
    
    if (!stored) {
      return null;
    }

    const entry = JSON.parse(stored) as CacheEntry;
    return entry;
  } catch (error) {
    console.warn('Failed to get cached weather data:', error);
    return null;
  }
}

/**
 * Store weather data in cache
 * @param key Unique cache key
 * @param data Weather data to cache
 */
export function setCachedWeatherData(
  key: CacheKey,
  data: any,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storageKey = `weather_cache_${key}`;
    const entry: CacheEntry = {
      data,
      cachedAt: Date.now(),
    };
    localStorage.setItem(storageKey, JSON.stringify(entry));
  } catch (error) {
    console.warn('Failed to cache weather data:', error);
  }
}

/**
 * Clear a specific cache entry
 * @param key Cache key to clear
 */
export function clearWeatherCacheEntry(key: CacheKey): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storageKey = `weather_cache_${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    // Ignore errors
  }
}

