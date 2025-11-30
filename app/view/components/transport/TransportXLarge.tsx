"use client";

import type { TransportProps, TransportData, PanelSize } from "./types";
import { formatDepartureTime, minutesUntilDeparture } from "./utils";
import { FiActivity } from "react-icons/fi";

type TransportXLargeProps = TransportProps & {
  transportData: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
};

export function TransportXLarge({ appearance, transportData, loading, error, timeFormat = "24h", maxDepartures = 15, panelSize = "xlarge" }: TransportXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const badgeColor = appearance.transportBadgeColor || primaryColor;
  const badgeBorder = appearance.transportBadgeBorder || primaryColor;
  const badgeTextColor = appearance.transportBadgeTextColor || "#000000";
  const badgeRadius = appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8;
  const delayColor = appearance.transportDelayColor || "#ef4444";
  const titleFontSize = "1.125rem";
  const lineFontSize = "0.875rem";

  if (loading || error || !transportData) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        {loading && <div className="text-6xl opacity-50 animate-pulse" style={{ color: primaryColor }}><FiActivity /></div>}
        {error && <div className="text-lg font-medium text-center" style={{ color: `${primaryColor}CC` }}>{error}</div>}
        {!loading && !error && <div className="text-lg font-medium" style={{ color: `${primaryColor}CC` }}>Ingen avganger</div>}
      </div>
    );
  }

  const departures = transportData.departures.slice(0, Math.min(maxDepartures, 15));

  return (
    <div className="flex h-full w-full flex-col gap-4 px-6 py-4">
      {transportData.stopPlace && (
        <div className="font-medium uppercase tracking-wider opacity-70 px-1" style={{ color: primaryColor, fontSize: titleFontSize }}>
          {transportData.stopPlace.name}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-4">
        {departures.map((dep) => {
          const minutes = minutesUntilDeparture(dep.expectedDeparture || dep.scheduledDeparture);
          const hasDelay = dep.delay && dep.delay > 0;
          return (
            <div key={dep.id} className="flex items-center justify-between gap-4 border-b border-opacity-30 pb-4 last:border-b-0" style={{ borderColor: `${primaryColor}50` }}>
              <div className="flex-1 flex items-center gap-3">
                <span
                  className="inline-flex items-center justify-center px-2.5 py-1.5 font-bold text-sm"
                  style={{
                    backgroundColor: badgeColor,
                    border: `1px solid ${badgeBorder}`,
                    color: badgeTextColor,
                    minWidth: "3rem",
                    width: "3rem",
                    borderRadius: `${badgeRadius}px`,
                  }}
                >
                  {dep.line}
                </span>
                <span className="font-semibold" style={{ color: primaryColor, fontSize: lineFontSize }}>
                  {dep.destination}
                </span>
                <div className="flex gap-3 mt-1">
                  {dep.platform && <div className="opacity-70" style={{ color: primaryColor, fontSize: "0.75rem" }}>Plattform {dep.platform}</div>}
                  {dep.serviceType && <div className="opacity-70" style={{ color: primaryColor, fontSize: "0.75rem" }}>{dep.serviceType}</div>}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold" style={{ color: primaryColor, fontSize: lineFontSize }}>
                  {minutes !== null ? `${minutes} min` : formatDepartureTime(dep.expectedDeparture || dep.scheduledDeparture, timeFormat)}
                </div>
                {hasDelay && (
                  <div className="opacity-90 font-medium mt-1" style={{ color: delayColor, fontSize: "0.75rem" }}>
                    +{dep.delay} min
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


