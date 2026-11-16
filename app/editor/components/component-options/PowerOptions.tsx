"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function PowerOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      Strømpris
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        Prisområde
      </span>
      <select
        value={appearance.powerArea ?? "NO1"}
        onChange={(e) => onAppearanceChange({ powerArea: e.target.value as "NO1" | "NO2" | "NO3" | "NO4" | "NO5" })}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      >
        <option value="NO1">NO1 – Oslo / Øst-Norge</option>
        <option value="NO2">NO2 – Kristiansand / Sør-Norge</option>
        <option value="NO3">NO3 – Trondheim / Midt-Norge</option>
        <option value="NO4">NO4 – Tromsø / Nord-Norge</option>
        <option value="NO5">NO5 – Bergen / Vest-Norge</option>
      </select>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        Vis dagsgraf
      </span>
      <input
        type="checkbox"
        checked={appearance.powerShowDayChart ?? true}
        onChange={(e) => onAppearanceChange({ powerShowDayChart: e.target.checked })}
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "powerLanguageLabel")}
      </span>
      <select
        value={appearance.powerLanguage ?? ""}
        onChange={(e) => onAppearanceChange({ powerLanguage: (e.target.value || undefined) as "nb" | "en" | undefined })}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      >
        <option value="">{t("editor", "powerLanguageApp")}</option>
        <option value="nb">{t("editor", "powerLanguageNb")}</option>
        <option value="en">{t("editor", "powerLanguageEn")}</option>
      </select>
    </label>
    <div className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        Tidformat
      </span>
      <div className="flex gap-2 text-[0.6875rem]">
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="power-time-format"
            checked={(appearance.powerTimeFormat ?? "24h") === "24h"}
            onChange={() => onAppearanceChange({ powerTimeFormat: "24h" })}
            className="h-3.5 w-3.5"
          />
          <span>24H</span>
        </label>
        <label className="inline-flex items-center gap-1">
          <input
            type="radio"
            name="power-time-format"
            checked={appearance.powerTimeFormat === "12h"}
            onChange={() => onAppearanceChange({ powerTimeFormat: "12h" })}
            className="h-3.5 w-3.5"
          />
          <span>12H</span>
        </label>
      </div>
    </div>
    <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
      Strømpriser fra Hva koster strømmen.no (åpent API)
    </p>
  </div>
  );
}
