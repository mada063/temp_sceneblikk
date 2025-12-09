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

type ServerSmallProps = ServerProps & {
  serverData: ServerData | null;
  loading: boolean;
  error: string | null;
};

export function ServerSmall({ appearance, serverData, loading, error }: ServerSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div className="text-2xl opacity-50 animate-pulse" style={{ color: primaryColor }}>
          <ServerIcon />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div className="text-xs font-medium text-center" style={{ color: `${primaryColor}CC` }}>
          {error}
        </div>
      </div>
    );
  }

  if (!serverData || serverData.servers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div className="text-xs font-medium" style={{ color: `${primaryColor}CC` }}>
          No servers configured
        </div>
      </div>
    );
  }

  const servers = serverData.servers.slice(0, 3); // Show max 3 for small
  const isMinecraft = servers.some((s) => s.motd !== undefined || s.playersOnline !== undefined);

  return (
    <div className="flex h-full w-full flex-col gap-1 p-3">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr>
            <th className="text-[9px] font-semibold uppercase tracking-wider pb-1" style={{ color: primaryColor }}>
              Status
            </th>
            <th className="text-[9px] font-semibold uppercase tracking-wider pb-1" style={{ color: primaryColor }}>
              Name
            </th>
            {isMinecraft && (
              <th className="text-[9px] font-semibold uppercase tracking-wider pb-1" style={{ color: primaryColor }}>
                MOTD
              </th>
            )}
            {isMinecraft && (
              <th className="text-[9px] font-semibold uppercase tracking-wider pb-1 text-right" style={{ color: primaryColor }}>
                Players
              </th>
            )}
            <th className="text-[9px] font-semibold uppercase tracking-wider pb-1 text-right" style={{ color: primaryColor }}>
              Ping
            </th>
            <th className="text-[9px] font-semibold uppercase tracking-wider pb-1 text-right" style={{ color: primaryColor }}>
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
              <tr key={index} className="border-t" style={{ borderColor: `${primaryColor}20` }}>
                <td className="py-1">
                  <StatusIcon className="inline-block" style={{ color: statusColor }} size={12} />
                </td>
                <td className="text-[9px] font-medium py-1 truncate max-w-[60px]" style={{ color: primaryColor }}>
                  {server.name}
                </td>
                {isMinecraft && (
                  <td className="text-[9px] font-medium py-1 truncate max-w-[80px]" style={{ color: primaryColor }}>
                    {server.motd || "-"}
                  </td>
                )}
                {isMinecraft && (
                  <td className="text-[9px] font-medium py-1 text-right" style={{ color: primaryColor }}>
                    {server.playersOnline != null && server.playersMax != null
                      ? `${server.playersOnline}/${server.playersMax}`
                      : server.playersOnline != null
                      ? server.playersOnline.toString()
                      : "-"}
                  </td>
                )}
                <td className="text-[9px] font-medium py-1 text-right" style={{ color: primaryColor }}>
                  {server.ping !== null ? `${server.ping}ms` : "-"}
                </td>
                <td className="text-[9px] font-medium py-1 text-right" style={{ color: primaryColor }}>
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

