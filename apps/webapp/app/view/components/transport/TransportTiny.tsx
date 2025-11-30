"use client";

import type { TransportProps, TransportData, PanelSize } from "./types";
import { formatDepartureTime, minutesUntilDeparture } from "./utils";
import { FiActivity } from "react-icons/fi";

type TransportTinyProps = TransportProps & {
  transportData: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
};

export function TransportTiny({ appearance, transportData, loading, error, timeFormat = "24h", panelSize = "tiny", colSpan = 1, rowSpan = 1 }: TransportTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const badgeColor = appearance.transportBadgeColor || primaryColor;
  const badgeBorder = appearance.transportBadgeBorder || primaryColor;
  const badgeTextColor = appearance.transportBadgeTextColor || "#000000";
  const badgeRadius = appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8;
  const delayColor = appearance.transportDelayColor || "#ef4444";
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const fontSize = panelArea <= 1 ? "0.5rem" : "0.5625rem";

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xl opacity-50 animate-pulse" style={{ color: primaryColor }}>
          <FiActivity />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-2">
        <div className="text-[8px] font-medium text-center" style={{ color: `${primaryColor}CC` }}>
          {error}
        </div>
      </div>
    );
  }

  if (!transportData || transportData.departures.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-2">
        <div className="text-[8px] font-medium" style={{ color: `${primaryColor}CC` }}>
          Ingen avganger
        </div>
      </div>
    );
  }

  const nextDeparture = transportData.departures[0];
  const minutes = minutesUntilDeparture(nextDeparture.expectedDeparture || nextDeparture.scheduledDeparture);
  const hasDelay = nextDeparture.delay && nextDeparture.delay > 0;

  return (
    <div className="flex h-full w-full items-center justify-center gap-2 px-2">
      <span
        className="inline-flex items-center justify-center px-1 py-0.5 font-bold text-[0.4375rem]"
        style={{
          backgroundColor: badgeColor,
          border: `1px solid ${badgeBorder}`,
          color: badgeTextColor,
          minWidth: "1.5rem",
          width: "1.5rem",
          borderRadius: `${badgeRadius}px`,
        }}
      >
        {nextDeparture.line}
      </span>
      <div className="opacity-80" style={{ color: primaryColor, fontSize: "0.4375rem" }}>
        {minutes !== null ? `${minutes}m` : formatDepartureTime(nextDeparture.expectedDeparture || nextDeparture.scheduledDeparture, timeFormat)}
      </div>
      {hasDelay && (
        <div className="opacity-90 font-medium" style={{ color: delayColor, fontSize: "0.375rem" }}>
          +{nextDeparture.delay}
        </div>
      )}
    </div>
  );
}


