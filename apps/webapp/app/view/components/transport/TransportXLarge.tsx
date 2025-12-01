"use client";

import { TransportBadge } from "./TransportBadge";
import { useDepartureAnimations, TRANSPORT_ANIMATION } from "./useDepartureAnimations";
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

  const departures = transportData.departures.slice(0, maxDepartures);
  const { playInitialFade, shouldBounce, newItemIds } = useDepartureAnimations(departures);
  const totalRows = departures.length;
  const isInitialSequence = playInitialFade && totalRows > 0;
  const initialStaggerSeconds = TRANSPORT_ANIMATION.initialStagger / 1000;
  const bounceStaggerSeconds = TRANSPORT_ANIMATION.bounceStagger / 1000;
  const bounceCompletionDelaySeconds =
    (TRANSPORT_ANIMATION.duration +
      Math.max(0, totalRows - 1) * TRANSPORT_ANIMATION.bounceStagger) /
    1000;
  const fadeBufferSeconds = TRANSPORT_ANIMATION.newFadeExtraDelay / 1000;
  let newRowCounter = 0;

  return (
    <div
      className={`flex h-full w-full flex-col gap-4 px-6 py-4 ${
        playInitialFade ? "animate-fade-in" : ""
      }`}
    >
      {transportData.stopPlace && (
        <div className="font-medium uppercase tracking-wider opacity-70 px-1" style={{ color: primaryColor, fontSize: titleFontSize }}>
          {transportData.stopPlace.name}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-4">
        {departures.map((dep, index) => {
          const minutes = minutesUntilDeparture(dep.expectedDeparture || dep.scheduledDeparture);
          const hasDelay = dep.delay && dep.delay > 0;
          const isNew = newItemIds.has(dep.id);
          const currentNewIndex = isNew ? newRowCounter++ : undefined;
          const rowAnimationClass = isInitialSequence
            ? "animate-slide-up-bounce"
            : isNew
            ? "animate-fade-in"
            : shouldBounce
            ? "animate-slide-up-bounce"
            : "";
          let rowAnimationDelay: string | undefined;
          if (isInitialSequence) {
            rowAnimationDelay = `${(totalRows - index - 1) * initialStaggerSeconds}s`;
          } else if (rowAnimationClass === "animate-slide-up-bounce") {
            rowAnimationDelay = `${index * bounceStaggerSeconds}s`;
          } else if (isNew && currentNewIndex !== undefined) {
            const delaySeconds =
              (shouldBounce ? bounceCompletionDelaySeconds : 0) +
              fadeBufferSeconds +
              currentNewIndex * initialStaggerSeconds;
            rowAnimationDelay = `${delaySeconds}s`;
          }
          const rowBaseStyle =
            isInitialSequence
              ? { opacity: 0, transform: "translateY(120%)" }
              : isNew
              ? { opacity: 0 }
              : undefined;
          return (
            <div 
              key={dep.id} 
              className={`flex items-center justify-between gap-4 border-b border-opacity-30 pb-4 last:border-b-0 ${rowAnimationClass}`}
              style={{ 
                borderColor: `${primaryColor}50`,
                ...rowBaseStyle,
                animationDelay: rowAnimationDelay,
                animationFillMode: rowAnimationClass ? "forwards" : undefined,
              }}
            >
              <div className="flex-1 flex items-center gap-3">
                <TransportBadge
                  line={dep.line}
                  serviceType={dep.serviceType}
                  badgeColor={badgeColor}
                  badgeBorder={badgeBorder}
                  badgeTextColor={badgeTextColor}
                  badgeRadius={badgeRadius}
                  size="large"
                />
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


