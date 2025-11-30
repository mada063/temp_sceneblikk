"use client";

import type { TransportProps, TransportData, PanelSize } from "./types";
import { formatDepartureTime, minutesUntilDeparture } from "./utils";
import { FiActivity } from "react-icons/fi";

type TransportSmallProps = TransportProps & {
  transportData: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
};

export function TransportSmall({ appearance, transportData, loading, error, timeFormat = "24h", maxDepartures = 5, panelSize = "small" }: TransportSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const badgeColor = appearance.transportBadgeColor || primaryColor;
  const badgeBorder = appearance.transportBadgeBorder || primaryColor;
  const badgeTextColor = appearance.transportBadgeTextColor || "#000000";
  const badgeRadius = appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8;
  const delayColor = appearance.transportDelayColor || "#ef4444";
  const titleFontSize = "0.625rem";
  const lineFontSize = "0.5625rem";

  if (loading || error || !transportData) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        {loading && <div className="text-2xl opacity-50 animate-pulse" style={{ color: primaryColor }}><FiActivity /></div>}
        {error && <div className="text-[9px] font-medium text-center" style={{ color: `${primaryColor}CC` }}>{error}</div>}
        {!loading && !error && <div className="text-[9px] font-medium" style={{ color: `${primaryColor}CC` }}>Ingen avganger</div>}
      </div>
    );
  }

  const departures = transportData.departures.slice(0, Math.min(maxDepartures, 5));

  return (
    <div className="flex h-full w-full flex-col gap-1 px-3">
      {transportData.stopPlace && (
        <div className="font-medium uppercase tracking-wider opacity-70" style={{ color: primaryColor, fontSize: titleFontSize }}>
          {transportData.stopPlace.name}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1">
        {departures.map((dep) => {
          const minutes = minutesUntilDeparture(dep.expectedDeparture || dep.scheduledDeparture);
          const hasDelay = dep.delay && dep.delay > 0;
          return (
            <div key={dep.id} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span
                  className="inline-flex items-center justify-center px-1 py-0.5 font-bold text-[0.5rem]"
                  style={{
                    backgroundColor: badgeColor,
                    border: `1px solid ${badgeBorder}`,
                    color: badgeTextColor,
                    minWidth: "1.75rem",
                    width: "1.75rem",
                    borderRadius: `${badgeRadius}px`,
                  }}
                >
                  {dep.line}
                </span>
                <span className="font-semibold" style={{ color: primaryColor, fontSize: lineFontSize }}>
                  {dep.destination}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <div className="opacity-80" style={{ color: primaryColor, fontSize: lineFontSize }}>
                  {minutes !== null ? `${minutes}m` : formatDepartureTime(dep.expectedDeparture || dep.scheduledDeparture, timeFormat)}
                </div>
                {hasDelay && (
                  <div className="opacity-90 font-medium" style={{ color: delayColor, fontSize: "0.4375rem" }}>
                    +{dep.delay}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


