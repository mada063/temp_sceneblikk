"use client";

import { FiSun } from "react-icons/fi";
import type { SolarProps } from "./types";
import { formatSolarTime } from "./utils";
import type { SolarData } from "./types";
import { useI18n } from "../../../lib/i18n";

const SunIcon = FiSun as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type SolarTinyProps = SolarProps & {
  solarData: SolarData | null;
};

export function SolarTiny({ appearance, solarData }: SolarTinyProps) {
  const { t } = useI18n();
  const { solarTimeFormat = "24h" } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  const eventKeys: Record<string, string> = {
    dawn: t("editor", "solarNextDawn"),
    sunrise: t("editor", "solarNextSunrise"),
    sunset: t("editor", "solarNextSunset"),
    dusk: t("editor", "solarNextDusk"),
  };

  if (!solarData) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <SunIcon className="h-10 w-10 opacity-50" />
      </div>
    );
  }

  const nextLabel = solarData.nextEvent ? eventKeys[solarData.nextEvent] ?? solarData.nextEvent : t("editor", "solarNight");
  const nextTime = solarData.nextEventTime
    ? formatSolarTime(solarData.nextEventTime, solarTimeFormat)
    : null;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2">
      <SunIcon className="h-12 w-12 opacity-90" style={{ color: primaryColor }} />
      <span className="text-center text-base font-medium opacity-90" style={{ color: primaryColor }}>
        {nextLabel}
        {nextTime ? ` ${nextTime}` : ""}
      </span>
    </div>
  );
}
