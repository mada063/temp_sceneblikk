import type { ServerInfo, ServerData } from "./types";

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
export async function fetchSingleServerInfo(url: string, serverType: string = "website"): Promise<ServerInfo> {
  if (serverType === "minecraft") {
    return fetchMinecraftServerInfo(url);
  }
  
  // Website server
  const normalized = normalizeUrl(url);
  const name = extractServerName(normalized);
  const port = extractPort(normalized);
  
  // Measure ping using normalized URL
  const ping = await measurePing(normalized);
  const status = determineStatus(ping);

  return {
    name,
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
    
    // Check if API returned an error in the JSON response
    if (info.error) {
      console.error(`Minecraft query error for ${hostname}:${port}`, info.error);
      throw new Error(info.error);
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
      status: "online",
      ping,
      port: port,
      motd,
      playersOnline: info.playersOnline ?? null,
      playersMax: info.playersMax ?? null,
    };
  } catch (error) {
    console.error(`Minecraft query exception for ${address}:`, error);
    // If query fails, try to extract hostname and port for display
    const { hostname, port } = parseMinecraftAddress(address);
    
    return {
      name: hostname,
      status: "offline",
      ping: null,
      port,
      motd: null,
      playersOnline: null,
      playersMax: null,
    };
  }
}

