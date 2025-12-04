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

type TransportTinyProps = TransportProps & {
  transportData: TransportData | null;
  secondaryTransportData?: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
  dualStopEnabled?: boolean;
};

export function TransportTiny({ appearance, transportData, loading, error, timeFormat = "24h", panelSize = "tiny", colSpan = 1, rowSpan = 1 }: TransportTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const badgeColor = appearance.transportBadgeColor || primaryColor;
  const badgeBorder = appearance.transportBadgeBorder || primaryColor;
  const badgeTextColor = appearance.transportBadgeTextColor || "#000000";
  const badgeRadius = appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8;
  const delayColor = appearance.transportDelayColor || "#ef4444";
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-xl opacity-50 animate-pulse" style={{ color: primaryColor }}>
          <ActivityIcon />
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

  const visibleDepartures = useMemo(
    () => transportData.departures.slice(0, 1),
    [transportData.departures]
  );
  const rowData = useMemo(() => {
    return visibleDepartures.map((dep) => {
      const minutes = minutesUntilDeparture(
        dep.expectedDeparture || dep.scheduledDeparture
      );
      return {
        id: dep.id,
        dep,
        minutes,
        fallback: formatDepartureTime(
          dep.expectedDeparture || dep.scheduledDeparture,
          timeFormat
        ),
        hasDelay: dep.delay && dep.delay > 0,
      };
    });
  }, [visibleDepartures, timeFormat]);
  const totalRows = rowData.length;
  const nextRow = rowData[0];

  const { playInitialFade, shouldBounce, newItemIds } = useDepartureAnimations(visibleDepartures);
  const minuteAnimationIds = useMinuteFlipAnimation(rowData);
  const isInitialSequence = playInitialFade && totalRows > 0;
  const isNew = nextRow ? newItemIds.has(nextRow.id) : false;
  const initialStaggerSeconds = TRANSPORT_ANIMATION.initialStagger / 1000;
  const bounceCompletionDelaySeconds =
    (TRANSPORT_ANIMATION.duration +
      Math.max(0, totalRows - 1) * TRANSPORT_ANIMATION.bounceStagger) /
    1000;
  const fadeBufferSeconds = TRANSPORT_ANIMATION.newFadeExtraDelay / 1000;
  if (!nextRow) {
    return null;
  }
  const rowAnimationClass = isInitialSequence
    ? "animate-slide-up-bounce"
    : isNew
    ? "animate-fade-in"
    : shouldBounce
    ? "animate-slide-up-bounce"
    : "";
  let rowAnimationDelay: string | undefined;
  if (isInitialSequence) {
    rowAnimationDelay = `${(totalRows - 1) * initialStaggerSeconds}s`;
  } else if (rowAnimationClass === "animate-slide-up-bounce") {
    rowAnimationDelay = "0s";
  } else if (isNew) {
    const delaySeconds =
      (shouldBounce ? bounceCompletionDelaySeconds : 0) + fadeBufferSeconds;
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
      className={`flex h-full w-full items-center justify-center gap-2 p-4 sm:p-6 ${
        playInitialFade ? "animate-fade-in" : ""
      }`}
    >
      <div
        className={`flex items-center gap-2 ${rowAnimationClass}`}
        style={{
          ...rowBaseStyle,
          animationFillMode: rowAnimationClass ? "forwards" : undefined,
          animationDelay: rowAnimationDelay,
        }}
      >
        <TransportBadge
          line={nextRow.dep.line}
          serviceType={nextRow.dep.serviceType}
          badgeColor={badgeColor}
          badgeBorder={badgeBorder}
          badgeTextColor={badgeTextColor}
          badgeRadius={badgeRadius}
          size="compact"
        />
        <MinutesDisplay
          minutes={nextRow.minutes}
          fallback={nextRow.fallback}
          suffix="m"
          className="opacity-80"
          style={{ color: primaryColor, fontSize: "0.4375rem" }}
          animateDigits={minuteAnimationIds.has(nextRow.id)}
        />
        {nextRow.hasDelay && (
          <div className="opacity-90 font-medium" style={{ color: delayColor, fontSize: "0.375rem" }}>
            +{nextRow.dep.delay}
          </div>
        )}
      </div>
    </div>
  );
}


