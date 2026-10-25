"use client";

import { useI18n } from "../../../lib/i18n";
import timezones from "../../../lib/timezones.json";
import type { ComponentOptionsContext } from "./types";

export function ClockOptions({ appearance, onAppearanceChange
, isClockQuarterOrMore
}: ComponentOptionsContext
 & { isClockQuarterOrMore: boolean }
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "clockOptionsTitle")}
    </p>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "clockShowSecondsLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.showClockSeconds ?? true}
        onChange={(event) =>
          onAppearanceChange({
            showClockSeconds: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "clockShowDateLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.showClockDate ?? false}
        onChange={(event) =>
          onAppearanceChange({
            showClockDate: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "timeFormatLabel")}
      </span>
      <div className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="clock-format"
            value="24h"
            checked={(appearance.clockFormat ?? "24h") === "24h"}
            onChange={() =>
              onAppearanceChange({ clockFormat: "24h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>24H</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="clock-format"
            value="12h"
            checked={appearance.clockFormat === "12h"}
            onChange={() =>
              onAppearanceChange({ clockFormat: "12h" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>12H</span>
        </label>
      </div>
    </div>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "clockTimezoneLabel")}
      </span>
      <select
        value={appearance.clockTimezone ?? "Europe/Oslo"}
        onChange={(event) =>
          onAppearanceChange({
            clockTimezone: event.target.value,
          })
        }
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      >
        {timezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
    </label>
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "clockStyleLabel")}
      </span>
      <div className="flex items-center gap-2 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="clock-style"
            value="digital"
            checked={(appearance.clockStyle ?? "digital") === "digital"}
            onChange={() =>
              onAppearanceChange({ clockStyle: "digital" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>{t("editor", "clockStyleDigitalLabel")}</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="clock-style"
            value="analog"
            checked={appearance.clockStyle === "analog"}
            onChange={() =>
              onAppearanceChange({ clockStyle: "analog" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>{t("editor", "clockStyleAnalogLabel")}</span>
        </label>
      </div>
    </div>
    {isClockQuarterOrMore && (
      <>
        <label className="flex items-center justify-between gap-3">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            {t("editor", "clockShowMultipleClocksLabel")}
          </span>
          <input
            type="checkbox"
            checked={appearance.showMultipleClocks ?? false}
            onChange={(event) =>
              onAppearanceChange({
                showMultipleClocks: event.target.checked,
                // Set default second timezone if enabling
                clockTimezone2: event.target.checked && !appearance.clockTimezone2 
                  ? "Europe/London"
                  : appearance.clockTimezone2,
              })
            }
            className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
        </label>
        {appearance.showMultipleClocks && (
          <>
            <label className="space-y-1">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                {t("editor", "clockSecondTimezoneLabel")}
              </span>
              <select
                value={appearance.clockTimezone2 ?? "Europe/London"}
                onChange={(event) =>
                  onAppearanceChange({
                    clockTimezone2: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                {t("editor", "clockThirdTimezoneLabel")}
              </span>
              <select
                value={appearance.clockTimezone3 ?? ""}
                onChange={(event) =>
                  onAppearanceChange({
                    clockTimezone3: event.target.value || undefined,
                  })
                }
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              >
                <option value="">{t("editor", "noneOptionLabel")}</option>
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                {t("editor", "clockFourthTimezoneLabel")}
              </span>
              <select
                value={appearance.clockTimezone4 ?? ""}
                onChange={(event) =>
                  onAppearanceChange({
                    clockTimezone4: event.target.value || undefined,
                  })
                }
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              >
                <option value="">{t("editor", "noneOptionLabel")}</option>
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </label>
          </>
        )}
      </>
    )}
  </div>
  );
}
