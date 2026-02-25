"use client";

import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice, formatTimeRange } from "./utils";
import type { PowerData } from "./types";
import { POWER_AREA_LABELS } from "./types";
import { useI18n } from "../../../lib/i18n";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerMediumProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerMedium({ appearance, powerData, loading, error }: PowerMediumProps) {
  const { t } = useI18n();
  const { powerTimeFormat = "24h" } = appearance;
  const primaryColor = appearance.textColor || "#ffffff";

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <ZapIcon className="h-16 w-16 animate-pulse opacity-50" />
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2" style={{ color: primaryColor }}>
        <ZapIcon className="h-16 w-16 opacity-50" />
        {error && <span className="text-sm opacity-80">{error}</span>}
      </div>
    );
  }

  const current = powerData.prices[powerData.currentIndex];
  const price = current?.NOK_per_kWh ?? 0;
  const areaLabel = POWER_AREA_LABELS[powerData.area as keyof typeof POWER_AREA_LABELS] ?? powerData.area;
  const minP = Math.min(...powerData.prices.map((p) => p.NOK_per_kWh));
  const maxP = Math.max(...powerData.prices.map((p) => p.NOK_per_kWh));

  return (
    <div className="flex h-full w-full flex-col gap-2 px-6 py-3">
      <div className="font-medium uppercase tracking-wider opacity-70" style={{ color: primaryColor, fontSize: "0.5rem" }}>
        {t("editor", "powerSourceLabel")}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
      <ZapIcon className="h-14 w-14 opacity-90" style={{ color: primaryColor }} />
      <div className="text-center">
        <div className="text-3xl font-bold" style={{ color: primaryColor }}>
          {formatPrice(price)} kr/kWh
        </div>
        {current && (
          <div className="mt-1 text-sm opacity-80" style={{ color: primaryColor }}>
            {formatTimeRange(current.timeStart, current.timeEnd, powerTimeFormat)}
          </div>
        )}
        <div className="mt-2 text-xs opacity-70" style={{ color: primaryColor }}>
          {areaLabel} · I dag {formatPrice(minP)} – {formatPrice(maxP)} kr
        </div>
      </div>
      </div>
    </div>
  );
}
