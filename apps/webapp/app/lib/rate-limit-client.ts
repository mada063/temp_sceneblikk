/**
 * Client-side rate limiting utility
 * Uses localStorage to persist rate limit state across page reloads
 */

/**
 * Check if an API call should be rate limited
 * @param key Unique identifier for the rate limit (e.g., 'weather-api', 'departures-api')
 * @param limitMs Minimum time in milliseconds between calls
 * @returns true if the call should be allowed, false if rate limited
 */
export function checkRateLimit(key: string, limitMs: number): boolean {
  if (typeof window === 'undefined') {
    // Server-side rendering - allow the call
    return true;
  }

  try {
    const now = Date.now();
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      // First call - allow it and record the time
      localStorage.setItem(storageKey, now.toString());
      return true;
    }

    const lastCallTime = parseInt(stored, 10);
    if (isNaN(lastCallTime)) {
      // Invalid stored value - reset and allow
      localStorage.setItem(storageKey, now.toString());
      return true;
    }

    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall >= limitMs) {
      // Enough time has passed - allow the call and update the time
      localStorage.setItem(storageKey, now.toString());
      return true;
    }

    // Rate limited - not enough time has passed
    return false;
  } catch (error) {
    // If localStorage is unavailable (e.g., private browsing), allow the call
    console.warn('Rate limit check failed, allowing call:', error);
    return true;
  }
}

/**
 * Get the time remaining until the next allowed call
 * @param key Unique identifier for the rate limit
 * @param limitMs Minimum time in milliseconds between calls
 * @returns Time remaining in milliseconds, or 0 if call is allowed
 */
export function getTimeUntilNextCall(key: string, limitMs: number): number {
  if (typeof window === 'undefined') {
    return 0;
  }

  try {
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);

    if (!stored) {
      return 0;
    }

    const lastCallTime = parseInt(stored, 10);
    if (isNaN(lastCallTime)) {
      return 0;
    }

    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;
    const remaining = limitMs - timeSinceLastCall;

    return Math.max(0, remaining);
  } catch (error) {
    return 0;
  }
}

/**
 * Clear rate limit entry (useful for testing or manual reset)
 */
export function clearRateLimit(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const storageKey = `rate_limit_${key}`;
    localStorage.removeItem(storageKey);
  } catch (error) {
    // Ignore errors
  }
}

