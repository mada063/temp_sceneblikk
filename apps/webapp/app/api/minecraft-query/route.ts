import { NextRequest, NextResponse } from "next/server";
import net from "net";
import { checkRateLimit, getTimeUntilNextCall } from "../../lib/rate-limit-server";
import { getCachedMinecraftData, setCachedMinecraftData } from "../../lib/minecraft-cache";

const DEFAULT_TIMEOUT = 8000; // 8 seconds
const PROTOCOL_VERSION = 47; // 1.8.x protocol version (widely supported)

// Rate limit: Adjustable - default 1 minute (60000 ms)
// Set to 0 to disable rate limiting
const SERVER_RATE_LIMIT_MS = 1 * 60 * 1000;

interface MinecraftQueryResult {
  motd: string;
  gametype: string | null;
  map: string;
  playersOnline: number;
  playersMax: number;
  hostport: number;
  hostip: string;
}

/**
 * Read VarInt from buffer
 */
function readVarInt(buffer: Buffer, offset: number): { value: number; newOffset: number } {
  let value = 0;
  let shift = 0;
  let byte: number;
  let currentOffset = offset;

  do {
    if (currentOffset >= buffer.length) {
      throw new Error("Invalid VarInt: buffer too short");
    }
    byte = buffer[currentOffset++];
    value |= (byte & 0x7F) << shift;
    shift += 7;
    if (shift >= 32) {
      throw new Error("VarInt too long");
    }
  } while ((byte & 0x80) !== 0);

  return { value, newOffset: currentOffset };
}

/**
 * Write VarInt to buffer
 */
function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let val = value;

  do {
    let byte = val & 0x7F;
    val >>>= 7;
    if (val !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (val !== 0);

  return Buffer.from(bytes);
}

/**
 * Write string to buffer (VarInt length + UTF-8 string)
 */
function writeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, "utf8");
  const lengthBuffer = writeVarInt(strBuffer.length);
  return Buffer.concat([lengthBuffer, strBuffer]);
}

/**
 * Read string from buffer (VarInt length + UTF-8 string)
 */
function readString(buffer: Buffer, offset: number): { value: string; newOffset: number } {
  const { value: length, newOffset: lengthOffset } = readVarInt(buffer, offset);
  if (lengthOffset + length > buffer.length) {
    throw new Error("String length exceeds buffer");
  }
  const stringBuffer = buffer.slice(lengthOffset, lengthOffset + length);
  const value = stringBuffer.toString("utf8");
  return { value, newOffset: lengthOffset + length };
}

/**
 * Strip Minecraft formatting codes from text
 */
function stripMinecraftFormatting(text: string): string {
  if (!text) return "";
  // Remove § and color/format codes
  return text.replace(/§[0-9a-fk-or]/gi, "").trim();
}

/**
 * Query Minecraft server using Server List Ping (TCP)
 */
function queryMinecraftServer(hostname: string, port: number): Promise<MinecraftQueryResult> {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let dataBuffer = Buffer.alloc(0);
    let resolved = false;

    let timeout: NodeJS.Timeout | null = null;

    const cleanup = () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      if (!socket.destroyed) {
        try {
          socket.destroy();
        } catch (err) {
          // Ignore cleanup errors
        }
      }
    };

    timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Connection timeout"));
      }
    }, DEFAULT_TIMEOUT);

    socket.setTimeout(DEFAULT_TIMEOUT);

    socket.on("connect", () => {
      // Clear connection timeout
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      // Set response timeout
      timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(new Error("Response timeout"));
        }
      }, DEFAULT_TIMEOUT);

      try {
        // Build handshake packet
        // Packet structure:
        // - Packet Length (VarInt): length of packet ID + data
        // - Packet ID (VarInt): 0x00 for handshake
        // - Protocol Version (VarInt)
        // - Server Address (String)
        // - Server Port (Unsigned Short, big-endian)
        // - Next State (VarInt): 1 for status

        const packetId = writeVarInt(0x00); // Handshake packet ID
        const protocolVersion = writeVarInt(PROTOCOL_VERSION);
        const serverAddress = writeString(hostname);
        const serverPort = Buffer.alloc(2);
        serverPort.writeUInt16BE(port, 0);
        const nextState = writeVarInt(1); // Status state

        const handshakeData = Buffer.concat([
          packetId,
          protocolVersion,
          serverAddress,
          serverPort,
          nextState,
        ]);

        const handshakeLength = writeVarInt(handshakeData.length);
        const fullHandshake = Buffer.concat([handshakeLength, handshakeData]);

        // Build status request packet
        // Packet structure:
        // - Packet Length (VarInt): length of packet ID
        // - Packet ID (VarInt): 0x00 for status request

        const statusRequestId = writeVarInt(0x00); // Status request packet ID
        const statusRequestLength = writeVarInt(statusRequestId.length);
        const fullStatusRequest = Buffer.concat([statusRequestLength, statusRequestId]);

        // Send both packets
        socket.write(fullHandshake);
        socket.write(fullStatusRequest);
      } catch (err) {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(err);
        }
      }
    });

    socket.on("data", (data) => {
      dataBuffer = Buffer.concat([dataBuffer, data]);

      if (resolved) return;

      try {
        // Parse response
        // Packet structure:
        // - Packet Length (VarInt)
        // - Packet ID (VarInt): 0x00 for status response
        // - JSON Response (String)

        let offset = 0;
        const { value: packetLength, newOffset: lengthOffset } = readVarInt(dataBuffer, offset);
        offset = lengthOffset;

        // Check if we have the full packet
        if (dataBuffer.length < packetLength + lengthOffset) {
          return; // Wait for more data
        }

        // Read packet ID
        const { value: packetId, newOffset: idOffset } = readVarInt(dataBuffer, offset);
        offset = idOffset;

        if (packetId !== 0x00) {
          if (!resolved) {
            resolved = true;
            cleanup();
            reject(new Error(`Unexpected packet ID: ${packetId}`));
          }
          return;
        }

        // Read JSON string
        const { value: jsonString } = readString(dataBuffer, offset);

        // Parse JSON
        const json = JSON.parse(jsonString);

        // Extract information
        const description = json.description;
        let motd = "";
        if (typeof description === "string") {
          motd = stripMinecraftFormatting(description);
        } else if (description && description.text) {
          motd = stripMinecraftFormatting(description.text);
        } else if (description && description.extra) {
          motd = stripMinecraftFormatting(
            description.extra.map((part: any) => part.text || "").join("")
          );
        } else if (description && typeof description === "object") {
          // Try to extract text from various formats
          motd = stripMinecraftFormatting(JSON.stringify(description));
        }

        const players = json.players || {};
        const playersOnline = players.online || 0;
        const playersMax = players.max || 0;

        if (!resolved) {
          resolved = true;
          cleanup();
          resolve({
            motd: motd || "A Minecraft Server",
            gametype: "SMP",
            map: "world",
            playersOnline,
            playersMax,
            hostport: port,
            hostip: hostname,
          });
        }
      } catch (err) {
        if (!resolved) {
          resolved = true;
          cleanup();
          reject(err);
        }
      }
    });

    socket.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(err);
      }
    });

    socket.on("timeout", () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        reject(new Error("Socket timeout"));
      }
    });

    socket.connect(port, hostname);
  });
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const searchParams = request.nextUrl.searchParams;
  const host = searchParams.get("host");
  const portParam = searchParams.get("port");
  
  let port = 25565;
  
  try {
    if (!host) {
      return NextResponse.json({ 
        warning: "Host parameter is required",
        motd: null,
        gametype: null,
        map: null,
        playersOnline: null,
        playersMax: null,
        hostport: 25565,
        hostip: "",
      }, { status: 200 });
    }

    port = portParam ? parseInt(portParam, 10) : 25565;
    if (isNaN(port) || port < 1 || port > 65535) {
      return NextResponse.json({ 
        warning: "Invalid port",
        motd: null,
        gametype: null,
        map: null,
        playersOnline: null,
        playersMax: null,
        hostport: port,
        hostip: host || "",
      }, { status: 200 });
    }

    // Create cache key
    const cacheKey = `server_${host}_${port}`;
    
    // Check if we have cached data first
    const cachedData = getCachedMinecraftData(cacheKey);
    const cacheAge = cachedData ? Date.now() - cachedData.cachedAt : Infinity;
    const isCacheStale = SERVER_RATE_LIMIT_MS > 0 && cacheAge >= SERVER_RATE_LIMIT_MS;
    const hasCache = cachedData !== null && !isCacheStale;

    // Check rate limit if enabled (SERVER_RATE_LIMIT_MS > 0)
    if (SERVER_RATE_LIMIT_MS > 0) {
      const rateLimitKey = `server_${host}_${port}`;
      const isRateLimited = !checkRateLimit(rateLimitKey, SERVER_RATE_LIMIT_MS);
      
      if (isRateLimited) {
        // Rate limited - check if we have cached data
        if (hasCache) {
          // Return cached data with a flag indicating it's from cache
          return NextResponse.json({
            motd: cachedData.data.motd,
            gametype: cachedData.data.gametype,
            map: cachedData.data.map,
            playersOnline: cachedData.data.playersOnline,
            playersMax: cachedData.data.playersMax,
            hostport: cachedData.data.hostport,
            hostip: cachedData.data.hostip,
            cached: true,
            cachedAt: cachedData.cachedAt,
          });
        }

        // No cache exists - allow first fetch to populate cache
        // This allows 1 fetch on first load even when rate limited
        // The rate limit check will still record the call, so subsequent calls will be rate limited
      }
    }

    console.log(`[${host}:${port}] Starting Minecraft query...`);
    
    // Query the Minecraft server
    const result = await queryMinecraftServer(host, port);
    
    // Store the fetched data in cache
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
    console.log(`[${host}:${port}] Minecraft query success in ${duration}ms`);

    return NextResponse.json({
      motd: result.motd,
      gametype: result.gametype,
      map: result.map,
      playersOnline: result.playersOnline,
      playersMax: result.playersMax,
      hostport: result.hostport,
      hostip: result.hostip,
      cached: false,
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[${host || "unknown"}:${port}] Minecraft query error after ${duration}ms:`, error);
    
    // On error, try to return cached data if available
    const cachedData = getCachedMinecraftData(`server_${host || ""}_${port}`);
    if (cachedData) {
      console.log(`[${host || "unknown"}:${port}] Returning cached data due to query error`);
      return NextResponse.json({
        motd: cachedData.data.motd,
        gametype: cachedData.data.gametype,
        map: cachedData.data.map,
        playersOnline: cachedData.data.playersOnline,
        playersMax: cachedData.data.playersMax,
        hostport: cachedData.data.hostport,
        hostip: cachedData.data.hostip,
        cached: true,
        cachedAt: cachedData.cachedAt,
      });
    }
    
    // Return warning in JSON with 200 status so client can handle it
    return NextResponse.json(
      { 
        warning: error instanceof Error ? error.message : "Failed to query server",
        motd: null,
        gametype: null,
        map: null,
        playersOnline: null,
        playersMax: null,
        hostport: port,
        hostip: host || "",
      },
      { status: 200 } // Return 200 so client can check for warning field
    );
  }
}
