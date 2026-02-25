"use client";

import { useMemo } from "react";
import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice, formatTimeRange } from "./utils";
import type { PowerData } from "./types";
import { POWER_AREA_LABELS } from "./types";
import { useI18n } from "../../../lib/i18n";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerLargeProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerLarge({ appearance, powerData, loading, error }: PowerLargeProps) {
  const { t } = useI18n();
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
        <ZapIcon className="h-20 w-20 animate-pulse opacity-50" />
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <ZapIcon className="h-20 w-20 opacity-50" />
        {error && <span className="text-sm opacity-80">{error}</span>}
      </div>
    );
  }

  const current = powerData.prices[powerData.currentIndex];
  const price = current?.NOK_per_kWh ?? 0;
  const areaLabel = POWER_AREA_LABELS[powerData.area as keyof typeof POWER_AREA_LABELS] ?? powerData.area;

  return (
    <div className="flex h-full w-full flex-col gap-4 px-8 py-4">
      <div className="flex items-start justify-between gap-2">
        <div
          className="font-medium uppercase tracking-wider opacity-70"
          style={{ color: primaryColor, fontSize: "0.5rem" }}
        >
          {t("editor", "powerSourceLabel")}
        </div>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="flex items-center gap-3">
          <ZapIcon className="h-12 w-12 opacity-90" style={{ color: primaryColor }} />
          <div>
            <div className="text-2xl font-bold" style={{ color: primaryColor }}>
              {formatPrice(price)} kr/kWh
            </div>
            <div className="text-sm opacity-80" style={{ color: primaryColor }}>
              {areaLabel}
            </div>
          </div>
        </div>
        {current && (
          <div className="text-base opacity-90" style={{ color: primaryColor }}>
            {formatTimeRange(current.timeStart, current.timeEnd, powerTimeFormat)}
          </div>
        )}
        {powerShowDayChart && chartData && (
          <div className="w-full max-w-md space-y-2">
            <div className="flex items-end justify-between gap-0.5" style={{ height: "3rem" }}>
              {chartData.map((d, i) => (
                <div
                  key={i}
                  className="flex-1 min-w-0 rounded-t opacity-80"
                  style={{
                    height: `${Math.max(8, d.normalized * 100)}%`,
                    backgroundColor: d.isCurrent ? primaryColor : `${primaryColor}99`,
                    border: d.isCurrent ? `2px solid ${primaryColor}` : "none",
                  }}
                  title={`${formatPrice(d.NOK_per_kWh)} kr · ${formatTimeRange(d.timeStart, d.timeEnd, "24h")}`}
                />
              ))}
            </div>
            <div className="text-center text-base font-semibold" style={{ color: primaryColor }}>
              {t("editor", "powerPriceNow")}: {formatPrice(price)} kr/kWh
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
