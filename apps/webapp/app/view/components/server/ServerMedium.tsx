"use client";

import type { CSSProperties } from "react";
import type { ServerProps, ServerData } from "./types";
import { FiServer, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";

// Loosely typed icon components
type IconProps = {
  className?: string;
  style?: CSSProperties;
  size?: number;
};

const ServerIcon = FiServer as React.ComponentType<IconProps>;
const CheckCircleIcon = FiCheckCircle as React.ComponentType<IconProps>;
const XCircleIcon = FiXCircle as React.ComponentType<IconProps>;
const AlertCircleIcon = FiAlertCircle as React.ComponentType<IconProps>;

type ServerMediumProps = ServerProps & {
  serverData: ServerData | null;
  loading: boolean;
  error: string | null;
};

export function ServerMedium({ appearance, serverData, loading, error }: ServerMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="text-3xl opacity-50 animate-pulse" style={{ color: primaryColor }}>
          <ServerIcon />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="text-sm font-medium text-center" style={{ color: `${primaryColor}CC` }}>
          {error}
        </div>
      </div>
    );
  }

  if (!serverData || serverData.servers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="text-sm font-medium" style={{ color: `${primaryColor}CC` }}>
          No servers configured
        </div>
      </div>
    );
  }

  const servers = serverData.servers.slice(0, 5); // Show max 5 for medium
  const isMinecraft = servers.some((s) => s.motd !== undefined || s.playersOnline !== undefined);

  return (
    <div className="flex h-full w-full flex-col gap-2 p-4">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="text-xs font-semibold uppercase tracking-wider pb-2" style={{ color: primaryColor }}>
              Status
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider pb-2" style={{ color: primaryColor }}>
              Name
            </th>
            {isMinecraft && (
              <th className="text-xs font-semibold uppercase tracking-wider pb-2" style={{ color: primaryColor }}>
                MOTD
              </th>
            )}
            {isMinecraft && (
              <th className="text-xs font-semibold uppercase tracking-wider pb-2 text-right" style={{ color: primaryColor }}>
                Players
              </th>
            )}
            <th className="text-xs font-semibold uppercase tracking-wider pb-2 text-right" style={{ color: primaryColor }}>
              Ping
            </th>
            <th className="text-xs font-semibold uppercase tracking-wider pb-2 text-right" style={{ color: primaryColor }}>
              Port
            </th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server, index) => {
            const StatusIcon = server.status === "online" ? CheckCircleIcon : 
                              server.status === "offline" ? XCircleIcon : AlertCircleIcon;
            const statusColor = server.status === "online" ? "#22c55e" : 
                               server.status === "offline" ? "#ef4444" : "#f59e0b";

            return (
              <tr key={index} className="border-t" style={{ borderColor: `${primaryColor}30` }}>
                <td className="py-2">
                  <StatusIcon className="inline-block" style={{ color: statusColor }} size={16} />
                </td>
                <td className="text-xs font-medium py-2 truncate max-w-[120px]" style={{ color: primaryColor }}>
                  {server.name}
                </td>
                {isMinecraft && (
                  <td className="text-xs font-medium py-2 truncate max-w-[150px]" style={{ color: primaryColor }}>
                    {server.motd || "-"}
                  </td>
                )}
                {isMinecraft && (
                  <td className="text-xs font-medium py-2 text-right" style={{ color: primaryColor }}>
                    {server.playersOnline != null && server.playersMax != null
                      ? `${server.playersOnline}/${server.playersMax}`
                      : server.playersOnline != null
                      ? server.playersOnline.toString()
                      : "-"}
                  </td>
                )}
                <td className="text-xs font-medium py-2 text-right" style={{ color: primaryColor }}>
                  {server.ping !== null ? `${server.ping}ms` : "-"}
                </td>
                <td className="text-xs font-medium py-2 text-right" style={{ color: primaryColor }}>
                  {server.port !== null ? server.port : "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

