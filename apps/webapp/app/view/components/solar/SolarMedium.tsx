"use client";

import { FiSun } from "react-icons/fi";
import type { SolarProps } from "./types";
import { formatSolarTime, formatDayLength } from "./utils";
import type { SolarData } from "./types";
import { useI18n } from "../../../lib/i18n";

const SunIcon = FiSun as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type SolarMediumProps = SolarProps & {
  solarData: SolarData | null;
};

export function SolarMedium({ appearance, solarData }: SolarMediumProps) {
  const { t } = useI18n();
  const {
    solarTimeFormat = "24h",
    solarShowDayLength = true,
    solarShowSolarNoon = false,
  } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  if (!solarData) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <SunIcon className="h-16 w-16 opacity-50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-6">
      <SunIcon className="h-16 w-16 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
      <div className="grid w-full max-w-xs grid-cols-2 gap-x-6 gap-y-2 text-center">
        <div className="text-left text-sm opacity-80 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.2s", animationFillMode: "both" }}>{t("editor", "solarDawn")}</div>
        <div className="text-right text-base font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.2s", animationFillMode: "both" }}>
          {formatSolarTime(solarData.dawn, solarTimeFormat)}
        </div>
        <div className="text-left text-sm opacity-80 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}>{t("editor", "solarSunrise")}</div>
        <div className="text-right text-base font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}>
          {formatSolarTime(solarData.sunrise, solarTimeFormat)}
        </div>
        {solarShowSolarNoon && (
          <>
            <div className="text-left text-sm opacity-80 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.4s", animationFillMode: "both" }}>{t("editor", "solarNoon")}</div>
            <div className="text-right text-base font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.4s", animationFillMode: "both" }}>
              {formatSolarTime(solarData.solarNoon, solarTimeFormat)}
            </div>
          </>
        )}
        <div className="text-left text-sm opacity-80 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}>{t("editor", "solarSunset")}</div>
        <div className="text-right text-base font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}>
          {formatSolarTime(solarData.sunset, solarTimeFormat)}
        </div>
        <div className="text-left text-sm opacity-80 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.6s", animationFillMode: "both" }}>{t("editor", "solarDusk")}</div>
        <div className="text-right text-base font-semibold animate-fade-in" style={{ color: primaryColor, animationDelay: "0.6s", animationFillMode: "both" }}>
          {formatSolarTime(solarData.dusk, solarTimeFormat)}
        </div>
      </div>
      {solarShowDayLength && (
        <div className="text-base font-medium opacity-90 animate-fade-in" style={{ color: primaryColor, animationDelay: "0.7s", animationFillMode: "both" }}>
          {t("editor", "solarDayLength")}: {formatDayLength(solarData.dayLengthMinutes)}
        </div>
      )}
    </div>
  );
}
