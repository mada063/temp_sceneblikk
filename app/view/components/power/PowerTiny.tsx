"use client";

import { FiZap } from "react-icons/fi";
import type { PowerProps } from "./types";
import { formatPrice } from "./utils";
import type { PowerData } from "./types";
import { useI18n } from "../../../lib/i18n";
import { POWER_LABELS, type PowerLocale } from "./labels";

const ZapIcon = FiZap as React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

type PowerTinyProps = PowerProps & {
  powerData: PowerData | null;
  loading: boolean;
  error: string | null;
};

export function PowerTiny({ appearance, powerData, loading, error }: PowerTinyProps) {
  const { locale: appLocale } = useI18n();
  const locale: PowerLocale = appearance.powerLanguage ?? appLocale;
  const labels = POWER_LABELS[locale];
  const primaryColor = appearance.textColor || "#ffffff";

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center" style={{ color: primaryColor }}>
        <ZapIcon className="h-10 w-10 animate-pulse opacity-50" />
      </div>
    );
  }

  if (error || !powerData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-1 px-2" style={{ color: primaryColor }}>
        <ZapIcon className="h-10 w-10 opacity-50" />
        {error && <span className="text-[0.5rem] opacity-80">{error}</span>}
      </div>
    );
  }

  const current = powerData.prices[powerData.currentIndex];
  const price = current?.NOK_per_kWh ?? 0;

  return (
    <div className="flex h-full w-full flex-col gap-0.5 px-2 py-1">
      <div
        className="font-medium uppercase tracking-wider opacity-70 animate-fade-in"
        style={{ color: primaryColor, fontSize: "0.5rem", animationDelay: "0.2s", animationFillMode: "both" }}
      >
        {labels.powerSourceLabel}
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1">
        <ZapIcon className="h-12 w-12 opacity-90 animate-fade-in" style={{ color: primaryColor }} />
        <span
          className="text-lg font-bold animate-fade-in"
          style={{ color: primaryColor, animationDelay: "0.3s", animationFillMode: "both" }}
        >
          {formatPrice(price)} kr
        </span>
        <span
          className="text-[0.75rem] opacity-80 animate-fade-in"
          style={{ color: primaryColor, animationDelay: "0.5s", animationFillMode: "both" }}
        >
          /kWh
        </span>
      </div>
    </div>
  );
}
