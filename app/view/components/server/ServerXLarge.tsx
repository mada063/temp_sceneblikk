"use client";

import type { CSSProperties } from "react";
import type { ServerLabels } from "./labels";
import type { ServerProps, ServerData } from "./types";
import { ServerNameCell } from "./ServerNameCell";
import { SERVER_TYPOGRAPHY } from "./typography";
import { ServerStatusBadge } from "./ServerStatusBadge";
import { FiServer } from "react-icons/fi";

const ServerIcon = FiServer as React.ComponentType<{ className?: string; style?: CSSProperties }>;

type ServerXLargeProps = ServerProps & {
  serverData: ServerData | null;
  loading: boolean;
  error: string | null;
  labels: ServerLabels;
};

const typography = SERVER_TYPOGRAPHY.xlarge;

export function ServerXLarge({ appearance, serverData, loading, error, labels }: ServerXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const { titleFontSize } = typography;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-6xl opacity-50 animate-pulse" style={{ color: primaryColor }}>
          <ServerIcon />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-lg font-medium text-center" style={{ color: `${primaryColor}CC` }}>
          {error}
        </div>
      </div>
    );
  }

  if (!serverData || serverData.servers.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div className="text-lg font-medium" style={{ color: `${primaryColor}CC` }}>
          {labels.noServersConfigured}
        </div>
      </div>
    );
  }

  const servers = serverData.servers;
  const headerClass = "pb-4 font-medium uppercase tracking-wider opacity-70";

  return (
    <div className="flex h-full w-full min-h-0 flex-col gap-4 overflow-auto p-4 sm:p-6">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className={headerClass} style={{ color: primaryColor, fontSize: titleFontSize }}>
              {labels.statusColumn}
            </th>
            <th className={headerClass} style={{ color: primaryColor, fontSize: titleFontSize }}>
              {labels.serverColumn}
            </th>
            <th className={`${headerClass} text-right`} style={{ color: primaryColor, fontSize: titleFontSize }}>
              {labels.pingColumn}
            </th>
            <th className={`${headerClass} text-right`} style={{ color: primaryColor, fontSize: titleFontSize }}>
              {labels.portColumn}
            </th>
          </tr>
        </thead>
        <tbody>
          {servers.map((server, index) => (
              <tr key={index} className="border-t" style={{ borderColor: `${primaryColor}50` }}>
                <td className="py-4">
                  <ServerStatusBadge
                    status={server.status}
                    appearance={appearance}
                    labels={labels}
                    size="large"
                  />
                </td>
                <ServerNameCell
                  server={server}
                  primaryColor={primaryColor}
                  typography={typography}
                  labels={labels}
                  cellClassName="py-4 max-w-[22rem]"
                />
                <td
                  className="py-4 text-right font-semibold opacity-80"
                  style={{ color: primaryColor, fontSize: titleFontSize }}
                >
                  {server.ping !== null ? `${server.ping}ms` : "-"}
                </td>
                <td
                  className="py-4 text-right font-semibold opacity-80"
                  style={{ color: primaryColor, fontSize: titleFontSize }}
                >
                  {server.port !== null ? server.port : "-"}
                </td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
