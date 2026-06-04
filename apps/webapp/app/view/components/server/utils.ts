import type { ServerInfo, ServerKind } from "./types";

const WEB_PORTS = new Set([80, 443, 8080, 8443, 3000, 5000]);

/**
 * Strip optional mc:/minecraft: prefix and classify the entry.
 */
export function normalizeServerEntry(url: string): { raw: string; kind: ServerKind } {
  let trimmed = url.trim();
  if (!trimmed) {
    return { raw: "", kind: "website" };
  }

  const lower = trimmed.toLowerCase();
  if (lower.startsWith("mc:") || lower.startsWith("minecraft:")) {
    const prefixEnd = trimmed.indexOf(":") + 1;
    trimmed = trimmed.slice(prefixEnd).trim();
    return { raw: trimmed, kind: "minecraft" };
  }

  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    return { raw: trimmed, kind: "website" };
  }

  const hostPort = /^([^:/\s]+):(\d+)$/.exec(trimmed);
  if (hostPort) {
    const port = parseInt(hostPort[2], 10);
    if (!WEB_PORTS.has(port)) {
      return { raw: trimmed, kind: "minecraft" };
    }
  }

  return { raw: trimmed, kind: "website" };
}

/**
 * Detect whether a server URL should be checked as a website or Minecraft server.
 * Legacy layouts may set serverType to "minecraft" for host-only entries.
 */
export function detectServerKind(url: string, legacyServerType?: string): ServerKind {
  const { raw, kind } = normalizeServerEntry(url);
  if (!raw) {
    return "website";
  }
  if (kind === "minecraft") {
    return "minecraft";
  }
  if (legacyServerType === "minecraft" && !/^https?:\/\//i.test(url.trim())) {
    return "minecraft";
  }
  return "website";
}

export function isMinecraftServerInfo(server: ServerInfo): boolean {
  return server.kind === "minecraft";
}

export function formatMinecraftPlayers(
  server: ServerInfo,
  playersLabel: string
): string | null {
  if (!isMinecraftServerInfo(server)) {
    return null;
  }
  if (server.playersOnline != null && server.playersMax != null) {
    return `${server.playersOnline}/${server.playersMax} ${playersLabel}`;
  }
  if (server.playersOnline != null) {
    return `${server.playersOnline} ${playersLabel}`;
  }
  return null;
}

export function buildPlaceholderServerInfo(
  url: string,
  legacyServerType?: string
): ServerInfo {
  const kind = detectServerKind(url, legacyServerType);
  const { raw } = normalizeServerEntry(url);

  if (kind === "minecraft") {
    const { hostname, port } = parseMinecraftAddress(raw);
    return {
      name: hostname,
      kind: "minecraft",
      status: "unknown",
      ping: null,
      port,
      motd: null,
      playersOnline: null,
      playersMax: null,
    };
  }

  const normalized = normalizeUrl(raw);
  return {
    name: extractServerName(normalized),
    kind: "website",
    status: "unknown",
    ping: null,
    port: extractPort(normalized),
  };
}

export function buildOfflineServerInfo(
  url: string,
  legacyServerType?: string
): ServerInfo {
  const kind = detectServerKind(url, legacyServerType);
  const { raw } = normalizeServerEntry(url);

  if (kind === "minecraft") {
    const { hostname, port } = parseMinecraftAddress(raw);
    return {
      name: hostname,
      kind: "minecraft",
      status: "offline",
      ping: null,
      port,
      motd: null,
      playersOnline: null,
      playersMax: null,
    };
  }

  const normalized = normalizeUrl(raw);
  return {
    name: extractServerName(normalized),
    kind: "website",
    status: "offline",
    ping: null,
    port: extractPort(normalized),
  };
}

/**
 * Normalize URL - add protocol if missing, default to https
 */
export function normalizeUrl(url: string): string {
  if (!url || !url.trim()) {
    return "";
  }
  
  const trimmed = url.trim();
  
  // If already has protocol, return as is
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  
  // Default to https for websites
  return `https://${trimmed}`;
}

/**
 * Extract server name from URL
 */
export function extractServerName(url: string): string {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.hostname;
  } catch {
    // If URL parsing fails, return the original string
    return url;
  }
}

/**
 * Measure ping to a server URL
 */
export async function measurePing(url: string): Promise<number | null> {
  try {
    const normalized = normalizeUrl(url);
    const startTime = performance.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const response = await fetch(normalized, {
      method: "HEAD",
      mode: "no-cors", // Use no-cors to avoid CORS issues, but we can't read response
      signal: controller.signal,
      cache: "no-cache",
    });
    
    clearTimeout(timeoutId);
    const endTime = performance.now();
    return Math.round(endTime - startTime);
  } catch (error) {
    // If fetch fails, try a different approach with a simple GET request
    try {
      const normalized = normalizeUrl(url);
      const startTime = performance.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch(normalized, {
        method: "GET",
        mode: "no-cors",
        signal: controller.signal,
        cache: "no-cache",
      });
      
      clearTimeout(timeoutId);
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch {
      return null;
    }
  }
}

/**
 * Extract port from URL
 */
export function extractPort(url: string): number | null {
  try {
    const normalized = normalizeUrl(url);
    const urlObj = new URL(normalized);
    return urlObj.port ? parseInt(urlObj.port, 10) : (urlObj.protocol === "https:" ? 443 : 80);
  } catch {
    return null;
  }
}

/**
 * Parse Minecraft server address (hostname:port or just hostname)
 */
export function parseMinecraftAddress(address: string): { hostname: string; port: number } {
  const trimmed = address.trim();
  
  // Check if port is specified
  if (trimmed.includes(":")) {
    const [hostname, portStr] = trimmed.split(":");
    const port = parseInt(portStr, 10);
    return {
      hostname: hostname.trim(),
      port: isNaN(port) ? 25565 : port,
    };
  }
  
  return {
    hostname: trimmed,
    port: 25565, // Default Minecraft port
  };
}

/**
 * Strip Minecraft formatting codes from MOTD
 */
export function stripMinecraftFormatting(text: string): string {
  // Remove Minecraft color/formatting codes (§ followed by a character)
  return text.replace(/§[0-9a-fk-or]/gi, "").trim();
}

/**
 * Determine server status based on ping
 */
export function determineStatus(ping: number | null): "online" | "offline" | "unknown" {
  if (ping === null) {
    return "offline";
  }
  if (ping > 0 && ping < 10000) {
    return "online";
  }
  return "unknown";
}

/**
 * Fetch server information for a single URL (website)
 */
export async function fetchSingleServerInfo(
  url: string,
  legacyServerType: string = "website"
): Promise<ServerInfo> {
  const kind = detectServerKind(url, legacyServerType);
  const { raw } = normalizeServerEntry(url);

  if (kind === "minecraft") {
    const info = await fetchMinecraftServerInfo(raw);
    return { ...info, kind: "minecraft" };
  }

  const normalized = normalizeUrl(raw);
  const name = extractServerName(normalized);
  const port = extractPort(normalized);
  const ping = await measurePing(normalized);
  const status = determineStatus(ping);

  return {
    name,
    kind: "website",
    status,
    ping,
    port,
  };
}

/**
 * Fetch Minecraft server information using Server List Ping (TCP) protocol
 * This is a simpler alternative to the Query protocol that works over TCP
 */
export async function fetchMinecraftServerInfo(address: string): Promise<ServerInfo> {
  try {
    const { hostname, port } = parseMinecraftAddress(address);
    const startTime = performance.now();
    
    // Use our API route to query the Minecraft server
    // Use a longer timeout than API to account for network overhead
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 seconds - longer than API timeout
    
    const response = await fetch(`/api/minecraft-query?host=${encodeURIComponent(hostname)}&port=${port}`, {
      method: "GET",
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Minecraft query failed for ${hostname}:${port}`, response.status, errorText);
      throw new Error(`Failed to query server: ${response.status}`);
    }
    
    const info = await response.json();
    
    const apiError = info.error ?? info.warning;
    if (apiError) {
      console.error(`Minecraft query error for ${hostname}:${port}`, apiError);
      throw new Error(apiError);
    }
    
    const endTime = performance.now();
    const ping = Math.round(endTime - startTime);
    
    // Strip formatting codes from MOTD
    const motd = stripMinecraftFormatting(info.motd || "");
    
    console.log(`Minecraft query success for ${hostname}:${port}`, {
      motd,
      playersOnline: info.playersOnline,
      playersMax: info.playersMax,
      ping,
    });
    
    return {
      name: hostname,
      kind: "minecraft",
      status: "online",
      ping,
      port: port,
      motd,
      playersOnline: info.playersOnline ?? null,
      playersMax: info.playersMax ?? null,
    };
  } catch (error) {
    console.error(`Minecraft query exception for ${address}:`, error);
    const { hostname, port } = parseMinecraftAddress(address);
    
    return {
      name: hostname,
      kind: "minecraft",
      status: "offline",
      ping: null,
      port,
      motd: null,
      playersOnline: null,
      playersMax: null,
    };
  }
}

