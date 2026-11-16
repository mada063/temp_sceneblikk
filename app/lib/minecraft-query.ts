import dns from "dns/promises";
import net from "net";

export const MINECRAFT_DEFAULT_PORT = 25565;
const DEFAULT_TIMEOUT_MS = 8000;
/** 1.8.x protocol – widely supported for status pings. */
const STATUS_PROTOCOL_VERSION = 47;

export type MinecraftQueryResult = {
  motd: string;
  gametype: string | null;
  map: string;
  playersOnline: number;
  playersMax: number;
  hostport: number;
  hostip: string;
  source: "tcp" | "http";
};

export async function resolveMinecraftEndpoint(
  host: string,
  port: number = MINECRAFT_DEFAULT_PORT
): Promise<{ host: string; port: number }> {
  const trimmedHost = host.trim();
  if (port !== MINECRAFT_DEFAULT_PORT) {
    return { host: trimmedHost, port };
  }

  try {
    const records = await dns.resolveSrv(`_minecraft._tcp.${trimmedHost}`);
    const record = records.sort((a, b) => a.priority - b.priority || b.weight - a.weight)[0];
    if (record?.name && record.port) {
      return {
        host: record.name.replace(/\.$/, ""),
        port: record.port,
      };
    }
  } catch {
    // No SRV record – use the provided host/port.
  }

  return { host: trimmedHost, port };
}

export function stripMinecraftFormatting(text: string): string {
  if (!text) return "";
  return text.replace(/§[0-9a-fk-or]/gi, "").trim();
}

function extractTextFromDescription(description: unknown): string {
  if (!description) return "";
  if (typeof description === "string") {
    return stripMinecraftFormatting(description);
  }
  if (typeof description !== "object") return "";

  const value = description as Record<string, unknown>;
  const parts: string[] = [];

  if (typeof value.text === "string" && value.text) {
    parts.push(stripMinecraftFormatting(value.text));
  }
  if (typeof value.translate === "string" && value.translate) {
    parts.push(stripMinecraftFormatting(value.translate));
  }
  if (Array.isArray(value.extra)) {
    for (const part of value.extra) {
      const nested = extractTextFromDescription(part);
      if (nested) parts.push(nested);
    }
  }

  return parts.join("").trim();
}

function readVarInt(buffer: Buffer, offset: number): { value: number; newOffset: number } {
  let value = 0;
  let shift = 0;
  let currentOffset = offset;
  let byte: number;

  do {
    if (currentOffset >= buffer.length) {
      throw new Error("Invalid VarInt: buffer too short");
    }
    byte = buffer[currentOffset++];
    value |= (byte & 0x7f) << shift;
    shift += 7;
    if (shift >= 32) {
      throw new Error("VarInt too long");
    }
  } while ((byte & 0x80) !== 0);

  return { value, newOffset: currentOffset };
}

function writeVarInt(value: number): Buffer {
  const bytes: number[] = [];
  let val = value;

  do {
    let byte = val & 0x7f;
    val >>>= 7;
    if (val !== 0) {
      byte |= 0x80;
    }
    bytes.push(byte);
  } while (val !== 0);

  return Buffer.from(bytes);
}

function writeString(str: string): Buffer {
  const strBuffer = Buffer.from(str, "utf8");
  return Buffer.concat([writeVarInt(strBuffer.length), strBuffer]);
}

function readString(buffer: Buffer, offset: number): { value: string; newOffset: number } {
  const { value: length, newOffset: lengthOffset } = readVarInt(buffer, offset);
  if (lengthOffset + length > buffer.length) {
    throw new Error("String length exceeds buffer");
  }
  const stringBuffer = buffer.slice(lengthOffset, lengthOffset + length);
  return { value: stringBuffer.toString("utf8"), newOffset: lengthOffset + length };
}

function parseStatusResponse(jsonString: string, host: string, port: number): MinecraftQueryResult {
  const json = JSON.parse(jsonString) as {
    description?: unknown;
    players?: { online?: number; max?: number };
  };

  const motd = extractTextFromDescription(json.description) || "A Minecraft Server";
  const players = json.players ?? {};

  return {
    motd,
    gametype: "SMP",
    map: "world",
    playersOnline: players.online ?? 0,
    playersMax: players.max ?? 0,
    hostport: port,
    hostip: host,
    source: "tcp",
  };
}

function tryParseStatusPacket(dataBuffer: Buffer): MinecraftQueryResult | null {
  if (dataBuffer.length < 1) {
    return null;
  }

  const { value: packetLength, newOffset: lengthOffset } = readVarInt(dataBuffer, 0);
  if (packetLength <= 0 || dataBuffer.length < lengthOffset + packetLength) {
    return null;
  }

  const { value: packetId, newOffset: idOffset } = readVarInt(dataBuffer, lengthOffset);
  if (packetId !== 0x00) {
    return null;
  }

  const { value: jsonString } = readString(dataBuffer, idOffset);
  return parseStatusResponse(jsonString, "", MINECRAFT_DEFAULT_PORT);
}

export function queryMinecraftServerTcp(
  hostname: string,
  port: number,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<MinecraftQueryResult> {
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
        } catch {
          // Ignore cleanup errors.
        }
      }
    };

    const fail = (error: Error) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      reject(error);
    };

    timeout = setTimeout(() => fail(new Error("Connection timeout")), timeoutMs);
    socket.setTimeout(timeoutMs);

    socket.on("connect", () => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }

      timeout = setTimeout(() => fail(new Error("Response timeout")), timeoutMs);

      try {
        const handshakeData = Buffer.concat([
          writeVarInt(0x00),
          writeVarInt(STATUS_PROTOCOL_VERSION),
          writeString(hostname),
          (() => {
            const serverPort = Buffer.alloc(2);
            serverPort.writeUInt16BE(port, 0);
            return serverPort;
          })(),
          writeVarInt(0x01),
        ]);

        const statusRequestId = writeVarInt(0x00);
        const statusRequest = Buffer.concat([
          writeVarInt(statusRequestId.length),
          statusRequestId,
        ]);

        socket.write(Buffer.concat([writeVarInt(handshakeData.length), handshakeData]));
        socket.write(statusRequest);
      } catch (error) {
        fail(error instanceof Error ? error : new Error("Failed to send handshake"));
      }
    });

    socket.on("data", (data) => {
      dataBuffer = Buffer.concat([dataBuffer, data]);
      if (resolved) return;

      try {
        const parsed = tryParseStatusPacket(dataBuffer);
        if (!parsed) {
          return;
        }

        resolved = true;
        cleanup();
        resolve({
          ...parsed,
          hostport: port,
          hostip: hostname,
        });
      } catch (error) {
        fail(error instanceof Error ? error : new Error("Failed to parse status response"));
      }
    });

    socket.on("error", (error) => {
      fail(error instanceof Error ? error : new Error("Socket error"));
    });

    socket.on("timeout", () => {
      fail(new Error("Socket timeout"));
    });

    socket.connect(port, hostname);
  });
}

type McsrvstatResponse = {
  online?: boolean;
  motd?: { clean?: string[] };
  players?: { online?: number; max?: number };
  ip?: string;
  port?: number;
};

export async function queryMinecraftServerHttp(
  host: string
): Promise<MinecraftQueryResult | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(host)}`, {
      method: "GET",
      signal: controller.signal,
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as McsrvstatResponse;
    if (!data.online) {
      return null;
    }

    const motdLines = data.motd?.clean?.filter(Boolean) ?? [];
    return {
      motd: motdLines.join("\n") || "A Minecraft Server",
      gametype: "SMP",
      map: "world",
      playersOnline: data.players?.online ?? 0,
      playersMax: data.players?.max ?? 0,
      hostport: data.port ?? MINECRAFT_DEFAULT_PORT,
      hostip: data.ip ?? host,
      source: "http",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function queryMinecraftServer(
  host: string,
  port: number = MINECRAFT_DEFAULT_PORT
): Promise<MinecraftQueryResult> {
  const endpoint = await resolveMinecraftEndpoint(host, port);

  try {
    return await queryMinecraftServerTcp(endpoint.host, endpoint.port);
  } catch (tcpError) {
    const httpResult = await queryMinecraftServerHttp(host);
    if (httpResult) {
      return httpResult;
    }
    throw tcpError;
  }
}
