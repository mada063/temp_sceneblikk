"use client";

import { useI18n } from "../../../lib/i18n";
import { StopPlaceSelector } from "./StopPlaceSelector";
import type { ComponentOptionsContext } from "./types";

export function TransportOptions({ appearance, onAppearanceChange
, isTransportMediumOrLarge
}: ComponentOptionsContext
 & { isTransportMediumOrLarge: boolean }
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "transportOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportStopPlaceLabel")}
      </span>
      <StopPlaceSelector
        value={appearance.transportStopPlace ?? "62356"}
        onChange={(stopPlaceId) =>
          onAppearanceChange({
            transportStopPlace: stopPlaceId,
          })
        }
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportTimeFormatLabel")}
      </span>
      <div className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="transport-time-format"
            value="24h"
            checked={(appearance.transportTimeFormat ?? "24h") === "24h"}
            onChange={() =>
              onAppearanceChange({ transportTimeFormat: "24h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>24H</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="transport-time-format"
            value="12h"
            checked={appearance.transportTimeFormat === "12h"}
            onChange={() =>
              onAppearanceChange({ transportTimeFormat: "12h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>12H</span>
        </label>
      </div>
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "transportMaxDeparturesLabel")}</span>
        <span>{appearance.transportMaxDepartures ?? 10}</span>
      </div>
      <input
        type="range"
        min={3}
        max={20}
        step={1}
        value={appearance.transportMaxDepartures ?? 10}
        onChange={(event) =>
          onAppearanceChange({
            transportMaxDepartures: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
    {isTransportMediumOrLarge && (
      <>
        <label className="flex items-center justify-between gap-3">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            {t("editor", "transportShowDualStopsLabel")}
          </span>
          <input
            type="checkbox"
            checked={appearance.transportShowDualStops ?? false}
            onChange={(event) =>
              onAppearanceChange({
                transportShowDualStops: event.target.checked,
                // Set default second stop place if enabling
                transportStopPlace2: event.target.checked && !appearance.transportStopPlace2 
                  ? "32214" // Default to a common stop (e.g., Oslo S)
                  : appearance.transportStopPlace2,
              })
            }
            className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
        </label>
        {appearance.transportShowDualStops && (
          <label className="space-y-1">
            <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              {t("editor", "transportSecondStopPlaceLabel")}
            </span>
            <StopPlaceSelector
              value={appearance.transportStopPlace2 ?? ""}
              onChange={(stopPlaceId) =>
                onAppearanceChange({
                  transportStopPlace2: stopPlaceId,
                })
              }
            />
          </label>
        )}
      </>
    )}
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportBadgeColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.transportBadgeColor || appearance.textColor || "#ffffff"}
          onChange={(event) =>
            onAppearanceChange({
              transportBadgeColor: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(appearance.transportBadgeColor || appearance.textColor || "#ffffff").toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportBadgeBorderColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.transportBadgeBorder || appearance.textColor || "#ffffff"}
          onChange={(event) =>
            onAppearanceChange({
              transportBadgeBorder: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(appearance.transportBadgeBorder || appearance.textColor || "#ffffff").toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportBadgeTextColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.transportBadgeTextColor || "#000000"}
          onChange={(event) =>
            onAppearanceChange({
              transportBadgeTextColor: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(appearance.transportBadgeTextColor || "#000000").toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "transportDelayTextColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.transportDelayColor || "#ef4444"}
          onChange={(event) =>
            onAppearanceChange({
              transportDelayColor: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(appearance.transportDelayColor || "#ef4444").toUpperCase()}
        </span>
      </div>
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "transportBadgeRoundednessLabel")}</span>
        <span>{appearance.transportBadgeRadius ?? appearance.borderRadius ?? 10}px</span>
      </div>
      <input
        type="range"
        min={0}
        max={30}
        step={1}
        value={appearance.transportBadgeRadius ?? appearance.borderRadius ?? 10}
        onChange={(event) =>
          onAppearanceChange({
            transportBadgeRadius: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
  </div>
  );
}
