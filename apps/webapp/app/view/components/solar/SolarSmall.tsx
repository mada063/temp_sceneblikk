"use client";

import { FiSun } from "react-icons/fi";
import type { SolarProps } from "./types";
import { formatSolarTime, formatDayLength } from "./utils";
import type { SolarData } from "./types";
import { useI18n } from "../../../lib/i18n";

const SunIcon = FiSun as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type SolarSmallProps = SolarProps & {
  solarData: SolarData | null;
};

export function SolarSmall({ appearance, solarData }: SolarSmallProps) {
  const { t } = useI18n();
  const { solarTimeFormat = "24h", solarShowDayLength = true } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  if (!solarData) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <SunIcon className="h-12 w-12 opacity-50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4">
      <SunIcon className="h-14 w-14 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
      <div className="flex flex-col items-center gap-1 text-center">
        <div
          className="text-lg font-semibold animate-fade-in"
          style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}
        >
          ↑ {formatSolarTime(solarData.sunrise, solarTimeFormat)}
        </div>
        <div
          className="text-lg font-semibold animate-fade-in"
          style={{ color: primaryColor, animationDelay: "0.4s", animationFillMode: "both" }}
        >
          ↓ {formatSolarTime(solarData.sunset, solarTimeFormat)}
        </div>
        {solarShowDayLength && (
          <div
            className="text-sm opacity-80 animate-fade-in"
            style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}
          >
            {formatDayLength(solarData.dayLengthMinutes)}
          </div>
        )}
      </div>
    </div>
  );
}
