"use client";

import { FiSun, FiCloud } from "react-icons/fi";
import type { SolarProps } from "./types";
import { formatSolarTime, formatDayLength } from "./utils";
import type { SolarData } from "./types";
import { useI18n } from "../../../lib/i18n";

const SunIcon = FiSun as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
const CloudIcon = FiCloud as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type SolarXLargeProps = SolarProps & {
  solarData: SolarData | null;
};

export function SolarXLarge({ appearance, solarData }: SolarXLargeProps) {
  const { t } = useI18n();
  const {
    solarTimeFormat = "24h",
    solarShowDayLength = true,
    solarShowSolarNoon = true,
  } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  if (!solarData) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <SunIcon className="h-24 w-24 opacity-50 animate-pulse" />
      </div>
    );
  }

  const rows: Array<{ labelKey: "solarDawn" | "solarSunrise" | "solarNoon" | "solarSunset" | "solarDusk"; time: Date; icon: typeof SunIcon }> = [
    { labelKey: "solarDawn", time: solarData.dawn, icon: CloudIcon },
    { labelKey: "solarSunrise", time: solarData.sunrise, icon: SunIcon },
    ...(solarShowSolarNoon ? [{ labelKey: "solarNoon" as const, time: solarData.solarNoon, icon: SunIcon }] : []),
    { labelKey: "solarSunset", time: solarData.sunset, icon: SunIcon },
    { labelKey: "solarDusk", time: solarData.dusk, icon: CloudIcon },
  ];

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-8 px-10">
      <SunIcon className="h-24 w-24 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
      <div className="w-full max-w-md space-y-4">
        {rows.map(({ labelKey, time, icon: Icon }, idx) => (
          <div
            key={labelKey}
            className="flex items-center justify-between gap-3 rounded-2xl px-5 py-3 animate-fade-in"
            style={{ backgroundColor: `${primaryColor}18`, color: primaryColor, animationDelay: `${0.2 + idx * 0.1}s`, animationFillMode: "both" }}
          >
            <span className="flex items-center gap-2.5 text-lg font-medium">
              <Icon className="h-6 w-6 flex-shrink-0 opacity-90" />
              {t("editor", labelKey)}
            </span>
            <span className="text-lg font-semibold">{formatSolarTime(time, solarTimeFormat)}</span>
          </div>
        ))}
      </div>
      {solarShowDayLength && (
        <div className="text-xl font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.7s", animationFillMode: "both" }}>
          {t("editor", "solarDayLength")}: {formatDayLength(solarData.dayLengthMinutes)}
        </div>
      )}
    </div>
  );
}
