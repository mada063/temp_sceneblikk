"use client";

import { useEffect, useMemo, useState } from "react";
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

type TransportMediumProps = TransportProps & {
  transportData: TransportData | null;
  secondaryTransportData?: TransportData | null;
  loading: boolean;
  error: string | null;
  timeFormat?: "12h" | "24h";
  maxDepartures?: number;
  panelSize?: PanelSize;
  dualStopEnabled?: boolean;
};

type MediumStopSectionProps = {
  data: TransportData | null;
  appearance: TransportProps["appearance"];
  timeFormat: "12h" | "24h";
  maxDepartures: number;
  dualMode: boolean;
  delayColor: string;
  badgeColor: string;
  badgeBorder: string;
  badgeTextColor: string;
  badgeRadius: number;
  titleFontSize: string;
  lineFontSize: string;
};

export function TransportMedium({
  appearance,
  transportData,
  secondaryTransportData,
  dualStopEnabled = false,
  loading,
  error,
  timeFormat = "24h",
  maxDepartures = 5,
  panelSize = "medium",
}: TransportMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const badgeColor = appearance.transportBadgeColor || primaryColor;
  const badgeBorder = appearance.transportBadgeBorder || primaryColor;
  const badgeTextColor = appearance.transportBadgeTextColor || "#000000";
  const badgeRadius = appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8;
  const delayColor = appearance.transportDelayColor || "#ef4444";
  const titleFontSize = "0.8125rem";
  const lineFontSize = "0.6875rem";
  const showDual = dualStopEnabled && secondaryTransportData;

  const [panelAnimated, setPanelAnimated] = useState(false);
  useEffect(() => {
    if (!panelAnimated && transportData) {
      setPanelAnimated(true);
    }
  }, [panelAnimated, transportData]);

  if (loading || error || !transportData) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        {loading && <div className="text-4xl opacity-50 animate-pulse" style={{ color: primaryColor }}><ActivityIcon /></div>}
        {error && <div className="text-sm font-medium text-center" style={{ color: `${primaryColor}CC` }}>{error}</div>}
        {!loading && !error && <div className="text-sm font-medium" style={{ color: `${primaryColor}CC` }}>Ingen avganger</div>}
      </div>
    );
  }

  const stopSections = showDual && secondaryTransportData 
    ? [transportData, secondaryTransportData] 
    : [transportData];

  return (
    <div
      className={`flex h-full w-full flex-col gap-2 p-4 sm:p-6 ${
        panelAnimated ? "" : "animate-fade-in"
      }`}
    >
      <div className={`flex flex-1 ${showDual ? "flex-row gap-4" : "flex-col gap-2"}`}>
        {stopSections.map((sectionData, idx) => (
          <MediumStopSection
            key={sectionData?.stopPlace?.id ?? idx}
            data={sectionData}
            appearance={appearance}
            timeFormat={timeFormat}
            maxDepartures={maxDepartures}
            dualMode={Boolean(showDual)}
            delayColor={delayColor}
            badgeColor={badgeColor}
            badgeBorder={badgeBorder}
            badgeTextColor={badgeTextColor}
            badgeRadius={badgeRadius}
            titleFontSize={titleFontSize}
            lineFontSize={lineFontSize}
          />
        ))}
        {showDual && !secondaryTransportData && (
          <div className="flex-1 flex items-center justify-center text-sm opacity-50" style={{ color: primaryColor }}>
            Loading second stop...
          </div>
        )}
      </div>
    </div>
  );
}

function MediumStopSection({
  data,
  appearance,
  timeFormat,
  maxDepartures,
  dualMode,
  delayColor,
  badgeColor,
  badgeBorder,
  badgeTextColor,
  badgeRadius,
  titleFontSize,
  lineFontSize,
}: MediumStopSectionProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const rowBorderColor = hexToRgba(primaryColor, 0.25);
  const rowBackground = hexToRgba(primaryColor, 0.05);
  const departures = useMemo(
    () => (data?.departures ? data.departures.slice(0, maxDepartures) : []),
    [data?.departures, maxDepartures]
  );
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
  const initialStaggerSeconds = TRANSPORT_ANIMATION.initialStagger / 1000;
  const bounceStaggerSeconds = TRANSPORT_ANIMATION.bounceStagger / 1000;
  const bounceCompletionDelaySeconds =
    (TRANSPORT_ANIMATION.duration +
      Math.max(0, totalRows - 1) * TRANSPORT_ANIMATION.bounceStagger) /
    1000;
  const fadeBufferSeconds = TRANSPORT_ANIMATION.newFadeExtraDelay / 1000;
  let newRowCounter = 0;

  return (
    <div className={`flex flex-col gap-2 ${dualMode ? "flex-1 min-w-0" : "flex-1"}`}>
      {data?.stopPlace && (
        <div
          className="font-medium uppercase tracking-wider opacity-70 px-1"
          style={{ color: primaryColor, fontSize: titleFontSize }}
        >
          {data.stopPlace.name}
        </div>
      )}
      {totalRows === 0 ? (
        <div
          className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-white/20 px-3 py-4 text-sm text-white/60"
          style={{ minHeight: dualMode ? "8rem" : undefined }}
        >
          Ingen avganger for øyeblikket
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2">
          {rowData.map((row, index) => {
            const isNew = newItemIds.has(row.id);
            const isInitialSequence = playInitialFade && totalRows > 0;
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
                className={`flex items-center justify-between gap-3 rounded-2xl px-3 py-2 ${rowAnimationClass}`}
                style={{
                  borderColor: rowBorderColor,
                  backgroundColor: rowBackground,
                  ...rowBaseStyle,
                  animationDelay: rowAnimationDelay,
                  animationFillMode: rowAnimationClass ? "forwards" : undefined,
                }}
              >
                <div className="flex-1 flex items-center gap-2">
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
                  {row.dep.platform && (
                    <div className="opacity-70" style={{ color: primaryColor, fontSize: "0.5625rem" }}>
                      Plattform {row.dep.platform}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {row.hasDelay && (
                    <div className="opacity-90 font-medium" style={{ color: delayColor, fontSize: "0.5625rem" }}>
                      +{row.dep.delay} min
                    </div>
                  )}
                  <MinutesDisplay
                    minutes={row.minutes}
                    fallback={row.fallback}
                    suffix="min"
                    className="font-semibold"
                    style={{ color: primaryColor, fontSize: lineFontSize }}
                    animateDigits={minuteAnimationIds.has(row.id)}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

