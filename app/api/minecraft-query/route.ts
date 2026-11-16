import { NextRequest, NextResponse } from "next/server";
import { getCachedMinecraftData, setCachedMinecraftData } from "../../lib/minecraft-cache";
import {
  MINECRAFT_DEFAULT_PORT,
  queryMinecraftServer,
  type MinecraftQueryResult,
} from "../../lib/minecraft-query";
import { checkRateLimit } from "../../lib/rate-limit-server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Minimum time between live TCP/HTTP queries for the same host:port.
const SERVER_RATE_LIMIT_MS = 60 * 1000;

function toJsonResponse(
  result: MinecraftQueryResult,
  extra?: Record<string, unknown>
) {
  return NextResponse.json({
    motd: result.motd,
    gametype: result.gametype,
    map: result.map,
    playersOnline: result.playersOnline,
    playersMax: result.playersMax,
    hostport: result.hostport,
    hostip: result.hostip,
    source: result.source,
    ...extra,
  });
}

function emptyWarningResponse(host: string, port: number, warning: string) {
  return NextResponse.json(
    {
      warning,
      motd: null,
      gametype: null,
      map: null,
      playersOnline: null,
      playersMax: null,
      hostport: port,
      hostip: host,
    },
    { status: 200 }
  );
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const host = searchParams.get("host")?.trim() ?? "";
  const portParam = searchParams.get("port");

  let port = MINECRAFT_DEFAULT_PORT;

  try {
    if (!host) {
      return emptyWarningResponse("", MINECRAFT_DEFAULT_PORT, "Host parameter is required");
    }

    port = portParam ? parseInt(portParam, 10) : MINECRAFT_DEFAULT_PORT;
    if (isNaN(port) || port < 1 || port > 65535) {
      return emptyWarningResponse(host, port, "Invalid port");
    }

    const cacheKey = `server_${host}_${port}`;
    const cachedData = getCachedMinecraftData(cacheKey);
    const cacheAge = cachedData ? Date.now() - cachedData.cachedAt : Infinity;
    const hasFreshCache =
      cachedData !== null && SERVER_RATE_LIMIT_MS > 0 && cacheAge < SERVER_RATE_LIMIT_MS;

    if (SERVER_RATE_LIMIT_MS > 0) {
      const isRateLimited = !checkRateLimit(cacheKey, SERVER_RATE_LIMIT_MS);
      if (isRateLimited && cachedData) {
        return toJsonResponse(
          { ...cachedData.data, source: "tcp" },
          { cached: true, cachedAt: cachedData.cachedAt, stale: !hasFreshCache }
        );
      }
    }

    console.log(`[${host}:${port}] Starting Minecraft query...`);
    const result = await queryMinecraftServer(host, port);

    setCachedMinecraftData(cacheKey, {
      motd: result.motd,
      gametype: result.gametype,
      map: result.map,
      playersOnline: result.playersOnline,
      playersMax: result.playersMax,
      hostport: result.hostport,
      hostip: result.hostip,
    });

    const duration = Date.now() - startTime;
    console.log(
      `[${host}:${port}] Minecraft query success via ${result.source} in ${duration}ms`
    );

    return toJsonResponse(result, { cached: false });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(
      `[${host || "unknown"}:${port}] Minecraft query error after ${duration}ms:`,
      error
    );

    const cachedData = getCachedMinecraftData(`server_${host || ""}_${port}`);
    if (cachedData) {
      console.log(`[${host || "unknown"}:${port}] Returning cached data due to query error`);
      return toJsonResponse(
        { ...cachedData.data, source: "tcp" },
        { cached: true, cachedAt: cachedData.cachedAt, stale: true }
      );
    }

    return emptyWarningResponse(
      host,
      port,
      error instanceof Error ? error.message : "Failed to query server"
    );
  }
}
