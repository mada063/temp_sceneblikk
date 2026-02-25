"use client";

import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice, formatTimeRange } from "./utils";
import type { PowerData } from "./types";
import { POWER_AREA_LABELS } from "./types";
import { useI18n } from "../../../lib/i18n";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerSmallProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerSmall({ appearance, powerData, loading, error }: PowerSmallProps) {
  const { t } = useI18n();
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
  const areaLabel = POWER_AREA_LABELS[powerData.area as keyof typeof POWER_AREA_LABELS] ?? powerData.area;

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-3">
      <div className="font-medium uppercase tracking-wider opacity-70" style={{ color: primaryColor, fontSize: "0.5rem" }}>
        {t("editor", "powerSourceLabel")}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
      <ZapIcon className="h-14 w-14 opacity-90" style={{ color: primaryColor }} />
      <div className="text-center">
        <div className="text-2xl font-bold" style={{ color: primaryColor }}>
          {formatPrice(price)} kr/kWh
        </div>
        {current && (
          <div className="mt-1 text-xs opacity-80" style={{ color: primaryColor }}>
            {formatTimeRange(current.timeStart, current.timeEnd, powerTimeFormat)}
          </div>
        )}
        <div className="mt-1 text-[0.75rem] opacity-70" style={{ color: primaryColor }}>
          {areaLabel}
        </div>
      </div>
      </div>
    </div>
  );
}
