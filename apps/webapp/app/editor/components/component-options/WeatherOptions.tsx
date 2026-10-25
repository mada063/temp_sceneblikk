"use client";

import { useI18n } from "../../../lib/i18n";
// @ts-ignore - JSON import
import weatherLocations from "../../../lib/weather-locations.json";
import { WeatherLocationSelector } from "./WeatherLocationSelector";
import type { ComponentOptionsContext } from "./types";

export function WeatherOptions({ appearance, onAppearanceChange
, isFullScreen
}: ComponentOptionsContext
 & { isFullScreen: boolean }
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "weatherOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "weatherLocationLabel")}
      </span>
      <WeatherLocationSelector
        value={appearance.weatherLocation ?? "59.9139,10.7522"}
        onChange={(locationValue) =>
          onAppearanceChange({
            weatherLocation: locationValue,
          })
        }
        locationName={(() => {
          const loc = (weatherLocations as Array<{ value: string; label: string }>).find(
            (l) => l.value === (appearance.weatherLocation ?? "59.9139,10.7522")
          );
          return loc?.label;
        })()}
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "weatherShowAirQualityLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.showAirQuality ?? true}
        onChange={(event) =>
          onAppearanceChange({
            showAirQuality: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "weatherShowLocationForecastLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.showLocationForecast ?? true}
        onChange={(event) =>
          onAppearanceChange({
            showLocationForecast: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    {isFullScreen && (
      <>
        <label className="flex items-center justify-between gap-3">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            {t("editor", "weatherShowTwoChartsLabel")}
          </span>
          <input
            type="checkbox"
            checked={appearance.showTwoCharts ?? false}
            onChange={(event) =>
              onAppearanceChange({
                showTwoCharts: event.target.checked,
                // Set default second location if enabling
                weatherLocation2: event.target.checked && !appearance.weatherLocation2 
                  ? "60.3913,5.3221" // Default to Bergen
                  : appearance.weatherLocation2,
              })
            }
            className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
        </label>
        {appearance.showTwoCharts && (
          <label className="space-y-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              {t("editor", "weatherSecondLocationLabel")}
            </span>
            <WeatherLocationSelector
              value={appearance.weatherLocation2 ?? "60.3913,5.3221"}
              onChange={(locationValue) =>
                onAppearanceChange({
                  weatherLocation2: locationValue,
                })
              }
              locationName={(() => {
                const loc = (weatherLocations as Array<{ value: string; label: string }>).find(
                  (l) => l.value === (appearance.weatherLocation2 ?? "60.3913,5.3221")
                );
                return loc?.label;
              })()}
            />
          </label>
        )}
      </>
    )}
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "timeFormatLabel")}
      </span>
      <div className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="weather-time-format"
            value="24h"
            checked={(appearance.weatherTimeFormat ?? "24h") === "24h"}
            onChange={() =>
              onAppearanceChange({ weatherTimeFormat: "24h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>24H</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="weather-time-format"
            value="12h"
            checked={appearance.weatherTimeFormat === "12h"}
            onChange={() =>
              onAppearanceChange({ weatherTimeFormat: "12h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>12H</span>
        </label>
      </div>
    </div>
  </div>
  );
}
