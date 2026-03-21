"use client";

import { useMemo } from "react";
import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice, formatTimeRange } from "./utils";
import type { PowerData } from "./types";
import { useI18n } from "../../../lib/i18n";
import { POWER_LABELS, getPowerAreaLabel, type PowerLocale } from "./labels";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerXLargeProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerXLarge({ appearance, powerData, loading, error }: PowerXLargeProps) {
  const { locale: appLocale } = useI18n();
  const locale: PowerLocale = appearance.powerLanguage ?? appLocale;
  const labels = POWER_LABELS[locale];
  const { powerTimeFormat = "24h", powerShowDayChart = true } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  const chartData = useMemo(() => {
    if (!powerData?.prices.length) return null;
    const min = Math.min(...powerData.prices.map((p) => p.NOK_per_kWh));
    const max = Math.max(...powerData.prices.map((p) => p.NOK_per_kWh));
    const range = max - min || 1;
    return powerData.prices.map((p, i) => ({
      ...p,
      normalized: (p.NOK_per_kWh - min) / range,
      isCurrent: i === powerData.currentIndex,
    }));
  }, [powerData]);

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <ZapIcon className="h-24 w-24 animate-pulse opacity-50" />
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <ZapIcon className="h-24 w-24 opacity-50" />
        {error && <span className="text-base opacity-80">{error}</span>}
      </div>
    );
  }

  const current = powerData.prices[powerData.currentIndex];
  const price = current?.NOK_per_kWh ?? 0;
  const areaLabel = getPowerAreaLabel(powerData.area, locale);

  return (
    <div className="flex h-full w-full flex-col gap-4 px-10 py-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className="font-medium uppercase tracking-wider opacity-70 animate-fade-in"
          style={{ color: primaryColor, fontSize: "0.5rem", animationDelay: "0.2s", animationFillMode: "both" }}
        >
          {labels.powerSourceLabel}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <div className="flex items-center gap-4">
          <ZapIcon className="h-16 w-16 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
          <div>
            <div
              className="text-4xl font-bold animate-fade-in"
              style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}
            >
              {formatPrice(price)} kr/kWh
            </div>
            <div
              className="text-sm opacity-80 animate-fade-in"
              style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}
            >
              {areaLabel}
            </div>
          </div>
        </div>
        {current && (
          <div
            className="text-base opacity-90 animate-fade-in"
            style={{ color: primaryColor, animationDelay: "0.6s", animationFillMode: "both" }}
          >
            {labels.powerPriceNow}: {formatTimeRange(current.timeStart, current.timeEnd, powerTimeFormat)}
          </div>
        )}
        {powerShowDayChart && chartData && (
          <div className="w-full max-w-2xl space-y-3">
            <div
              className="text-sm font-semibold opacity-80 animate-fade-in"
              style={{ color: primaryColor, animationDelay: "0.7s", animationFillMode: "both" }}
            >
              {labels.powerPricesToday}
            </div>
            <div className="flex items-end justify-between gap-0.5" style={{ height: "4rem" }}>
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-0 rounded-t animate-fade-in"
                  style={{
                    height: `${Math.max(10, d.normalized * 100)}%`,
                    backgroundColor: d.isCurrent ? primaryColor : `${primaryColor}99`,
                    border: d.isCurrent ? `2px solid ${primaryColor}` : "none",
                    animationDelay: `${0.8 + i * 0.06}s`,
                    animationFillMode: "both",
                  }}
                  title={`${formatPrice(d.NOK_per_kWh)} kr · ${formatTimeRange(d.timeStart, d.timeEnd, "24h")}`}
                />
              ))}
            </div>
            <div
              className="text-center text-base font-semibold animate-fade-in"
              style={{ color: primaryColor, animationDelay: "1.2s", animationFillMode: "both" }}
            >
              {labels.powerPriceNow}: {formatPrice(price)} kr/kWh
            </div>
            <div
              className="grid grid-cols-12 gap-x-0.5 gap-y-1 text-[0.75rem] opacity-80 animate-fade-in"
              style={{ color: primaryColor, animationDelay: "1.4s", animationFillMode: "both" }}
            >
              {chartData.map((d, i) => (
                <div key={i} className="flex flex-col items-center truncate">
                  <span className="font-medium">{formatPrice(d.NOK_per_kWh)}</span>
                  <span className="truncate w-full text-center">
                    {formatTimeRange(d.timeStart, d.timeEnd, "24h").split(" – ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
