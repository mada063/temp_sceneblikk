"use client";

import type { ServerInfo } from "./types";
import type { ServerLabels } from "./labels";
import type { ServerTypography } from "./typography";
import { formatMinecraftPlayers, isMinecraftServerInfo } from "./utils";

type ServerNameCellProps = {
  server: ServerInfo;
  primaryColor: string;
  typography: ServerTypography;
  labels: ServerLabels;
  cellClassName?: string;
};

export function ServerNameCell({
  server,
  primaryColor,
  typography,
  labels,
  cellClassName = "",
}: ServerNameCellProps) {
  const { titleFontSize } = typography;
  const players = formatMinecraftPlayers(server, labels.playersLabel);
  const motd = isMinecraftServerInfo(server) && server.motd ? server.motd : null;

  return (
    <td className={cellClassName}>
      <div className="min-w-0">
        <div
          className="truncate font-semibold"
          style={{ color: primaryColor, fontSize: titleFontSize }}
        >
          {server.name}
        </div>
        {isMinecraftServerInfo(server) && (motd || players) ? (
          <div className="mt-0.5 flex min-w-0 flex-col gap-0.5">
            {motd ? (
              <div
                className="truncate opacity-70"
                style={{ color: primaryColor, fontSize: titleFontSize }}
              >
                {motd}
              </div>
            ) : null}
            {players ? (
              <div className="opacity-70" style={{ color: primaryColor, fontSize: titleFontSize }}>
                {players}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </td>
  );
}
