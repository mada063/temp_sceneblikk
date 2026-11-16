"use client";

import { useI18n } from "../../../lib/i18n";
// @ts-ignore - JSON import
import weatherLocations from "../../../lib/weather-locations.json";
import { WeatherLocationSelector } from "./WeatherLocationSelector";
import type { ComponentOptionsContext } from "./types";

export function SolarOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "solarOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "solarLocationLabel")}
      </span>
      <WeatherLocationSelector
        value={appearance.solarLocation ?? "59.9139,10.7522"}
        onChange={(locationValue) =>
          onAppearanceChange({ solarLocation: locationValue })
        }
        locationName={(() => {
          const loc = (weatherLocations as Array<{ value: string; label: string }>).find(
            (l) => l.value === (appearance.solarLocation ?? "59.9139,10.7522")
          );
          return loc?.label;
        })()}
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "solarShowDayLength")}
      </span>
      <input
        type="checkbox"
        checked={appearance.solarShowDayLength ?? true}
        onChange={(e) => onAppearanceChange({ solarShowDayLength: e.target.checked })}
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "solarShowSolarNoon")}
      </span>
      <input
        type="checkbox"
        checked={appearance.solarShowSolarNoon ?? false}
        onChange={(e) => onAppearanceChange({ solarShowSolarNoon: e.target.checked })}
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        Tidformat
      </span>
      <div className="flex gap-2 text-[0.6875rem]">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="solar-time-format"
            checked={(appearance.solarTimeFormat ?? "24h") === "24h"}
            onChange={() => onAppearanceChange({ solarTimeFormat: "24h" })}
            className="h-3.5 w-3.5"
          />
          <span>24H</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="solar-time-format"
            checked={appearance.solarTimeFormat === "12h"}
            onChange={() => onAppearanceChange({ solarTimeFormat: "12h" })}
            className="h-3.5 w-3.5"
          />
          <span>12H</span>
        </label>
      </div>
    </div>
  </div>
  );
}
