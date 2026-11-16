import type { ServerInfo } from "./types";
import { detectServerKind, normalizeServerEntry } from "./utils";

/** How long cached server checks stay fresh before refetching. */
export const SERVER_CACHE_TTL_MS = 60_000;

type CacheEntry = {
  data: ServerInfo;
  cachedAt: number;
};

const cacheStore = new Map<string, CacheEntry>();

export function getServerCacheKey(url: string, legacyServerType?: string): string {
  const kind = detectServerKind(url, legacyServerType);
  const { raw } = normalizeServerEntry(url);
  return `${kind}:${raw}`;
}

export function getCachedServerInfo(
  url: string,
  legacyServerType?: string
): CacheEntry | null {
  return cacheStore.get(getServerCacheKey(url, legacyServerType)) ?? null;
}

export function setCachedServerInfo(
  url: string,
  legacyServerType: string | undefined,
  data: ServerInfo
): void {
  cacheStore.set(getServerCacheKey(url, legacyServerType), {
    data,
    cachedAt: Date.now(),
  });
}

export function isServerCacheFresh(
  entry: CacheEntry | null,
  ttlMs: number = SERVER_CACHE_TTL_MS
): boolean {
  if (!entry) {
    return false;
  }
  return Date.now() - entry.cachedAt < ttlMs;
}
