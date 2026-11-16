"use client";

import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice, formatTimeRange } from "./utils";
import type { PowerData } from "./types";
import { useI18n } from "../../../lib/i18n";
import { POWER_LABELS, getPowerAreaLabel, type PowerLocale } from "./labels";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerSmallProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerSmall({ appearance, powerData, loading, error }: PowerSmallProps) {
  const { locale: appLocale } = useI18n();
  const locale: PowerLocale = appearance.powerLanguage ?? appLocale;
  const labels = POWER_LABELS[locale];
  const { powerTimeFormat = "24h" } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <ZapIcon className="h-12 w-12 animate-pulse opacity-50" />
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4" style={{ color: primaryColor }}>
        <ZapIcon className="h-12 w-12 opacity-50" />
        {error && <span className="text-xs opacity-80">{error}</span>}
      </div>
    );
  }

  const current = powerData.prices[powerData.currentIndex];
  const price = current?.NOK_per_kWh ?? 0;
  const areaLabel = getPowerAreaLabel(powerData.area, locale);

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-3">
      <div
        className="font-medium uppercase tracking-wider opacity-70 animate-fade-in"
        style={{ color: primaryColor, fontSize: "0.5rem", animationDelay: "0.2s", animationFillMode: "both" }}
      >
        {labels.powerSourceLabel}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <ZapIcon className="h-14 w-14 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
        <div className="text-center">
          <div
            className="text-2xl font-bold animate-fade-in"
            style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}
          >
            {formatPrice(price)} kr/kWh
          </div>
          {current && (
            <div
              className="mt-1 text-xs opacity-80 animate-fade-in"
              style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}
            >
              {formatTimeRange(current.timeStart, current.timeEnd, powerTimeFormat)}
            </div>
          )}
          <div
            className="mt-1 text-[0.75rem] opacity-70 animate-fade-in"
            style={{ color: primaryColor, animationDelay: "0.6s", animationFillMode: "both" }}
          >
            {areaLabel}
          </div>
        </div>
      </div>
    </div>
  );
}
