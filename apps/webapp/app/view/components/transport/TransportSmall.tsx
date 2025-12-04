"use client";

import { useMemo } from "react";
import { TransportBadge } from "./TransportBadge";
import { MinutesDisplay } from "./MinutesDisplay";
import { useDepartureAnimations, TRANSPORT_ANIMATION } from "./useDepartureAnimations";
import { useMinuteFlipAnimation } from "./useMinuteFlipAnimation";
import type { TransportProps, TransportData, PanelSize } from "./types";
import { formatDepartureTime, minutesUntilDeparture } from "./utils";
import { FiActivity } from "react-icons/fi";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const ActivityIcon = FiActivity as React.ComponentType<{ className?: string }>;
import { hexToRgba } from "../calendar/utils";

type TransportSmallProps = TransportProps & {
  transportData: TransportData | null;
  secondaryTransportData?: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
  dualStopEnabled?: boolean;
};

export function TransportSmall({ appearance, transportData, loading, error, timeFormat = "24h", maxDepartures = 5, panelSize = "small" }: TransportSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const rowBorderColor = hexToRgba(primaryColor, 0.25);
  const rowBackground = hexToRgba(primaryColor, 0.05);
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
        {loading && <div className="text-2xl opacity-50 animate-pulse" style={{ color: primaryColor }}><ActivityIcon /></div>}
        {error && <div className="text-[9px] font-medium text-center" style={{ color: `${primaryColor}CC` }}>{error}</div>}
        {!loading && !error && <div className="text-[9px] font-medium" style={{ color: `${primaryColor}CC` }}>Ingen avganger</div>}
      </div>
    );
  }

  const departures = transportData.departures.slice(0, maxDepartures);
  const rowData = useMemo(() => {
    return departures.map((dep) => {
      const minutes = minutesUntilDeparture(dep.expectedDeparture || dep.scheduledDeparture);
      return {
        id: dep.id,
        dep,
        minutes,
        fallback: formatDepartureTime(dep.expectedDeparture || dep.scheduledDeparture, timeFormat),
        hasDelay: dep.delay && dep.delay > 0,
      };
    });
  }, [departures, timeFormat]);
  const { playInitialFade, shouldBounce, newItemIds } = useDepartureAnimations(departures);
  const minuteAnimationIds = useMinuteFlipAnimation(rowData);
  const totalRows = rowData.length;
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
      className={`flex h-full w-full flex-col gap-1 p-4 sm:p-6 ${
        playInitialFade ? "animate-fade-in" : ""
      }`}
    >
      {transportData.stopPlace && (
        <div className="font-medium uppercase tracking-wider opacity-70" style={{ color: primaryColor, fontSize: titleFontSize }}>
          {transportData.stopPlace.name}
        </div>
      )}
      <div className="flex-1 flex flex-col gap-1">
        {rowData.map((row, index) => {
          const isNew = newItemIds.has(row.id);
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
              key={row.id}
              className={`flex items-center justify-between gap-2 rounded-2xl px-3 py-2 ${rowAnimationClass}`}
              style={{
                borderColor: rowBorderColor,
                backgroundColor: rowBackground,
                ...rowBaseStyle,
                animationDelay: rowAnimationDelay,
                animationFillMode: rowAnimationClass ? "forwards" : undefined,
              }}
            >
              <div className="flex items-center gap-1.5">
                <TransportBadge
                  line={row.dep.line}
                  serviceType={row.dep.serviceType}
                  badgeColor={badgeColor}
                  badgeBorder={badgeBorder}
                  badgeTextColor={badgeTextColor}
                  badgeRadius={badgeRadius}
                  size="default"
                />
                <span className="font-semibold" style={{ color: primaryColor, fontSize: lineFontSize }}>
                  {row.dep.destination}
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <MinutesDisplay
                  minutes={row.minutes}
                  fallback={row.fallback}
                  suffix="m"
                  className="opacity-80"
                  style={{ color: primaryColor, fontSize: lineFontSize }}
                  animateDigits={minuteAnimationIds.has(row.id)}
                />
                {row.hasDelay && (
                  <div className="opacity-90 font-medium" style={{ color: delayColor, fontSize: "0.4375rem" }}>
                    +{row.dep.delay}
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


