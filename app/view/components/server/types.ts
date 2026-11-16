import type { CellAppearance } from "../../../lib/layout-types";

export type ServerProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type ServerKind = "website" | "minecraft";

export type ServerInfo = {
  name: string;
  kind: ServerKind;
  status: "online" | "offline" | "unknown";
  ping: number | null; // in milliseconds
  port: number | null;
  // Minecraft-specific fields
  motd?: string | null; // Message of the Day
  playersOnline?: number | null;
  playersMax?: number | null;
};

export type ServerData = {
  servers: ServerInfo[];
  lastUpdated: Date;
};

