"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function NewsOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "newsOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "newsFeedLabel")}
      </span>
      <select
        value={appearance.newsFeed ?? "nrk_main"}
        onChange={(event) =>
          onAppearanceChange({
            newsFeed: event.target.value,
          })
        }
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      >
        <optgroup label="NRK">
          <option value="nrk_main">NRK Hovedside</option>
          <option value="nrk_nyheter">NRK Nyheter</option>
          <option value="nrk_sport">NRK Sport</option>
          <option value="nrk_kultur">NRK Kultur</option>
          <option value="nrk_innenriks">NRK Innenriks</option>
          <option value="nrk_urix">NRK Urix</option>
        </optgroup>
        <optgroup label="TV2">
          <option value="tv2_nyheter">TV2 Nyheter</option>
          <option value="tv2_sport">TV2 Sport</option>
          <option value="tv2_innenriks">TV2 Innenriks</option>
          <option value="tv2_utenriks">TV2 Utenriks</option>
          <option value="tv2_fotball">TV2 Fotball</option>
        </optgroup>
        <optgroup label="Dagens Næringsliv">
          <option value="dn_main">DN Hovedside</option>
        </optgroup>
      </select>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "newsShowSourceLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.newsShowSource ?? true}
        onChange={(event) =>
          onAppearanceChange({
            newsShowSource: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "newsMaxItemsLabel")}</span>
        <span>{appearance.newsMaxItems ?? 10}</span>
      </div>
      <input
        type="range"
        min={5}
        max={20}
        step={1}
        value={appearance.newsMaxItems ?? 10}
        onChange={(event) =>
          onAppearanceChange({
            newsMaxItems: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "newsScrollSpeedLabel")}</span>
        <span>{appearance.newsScrollSpeed ?? 50} px/s</span>
      </div>
      <input
        type="range"
        min={20}
        max={100}
        step={10}
        value={appearance.newsScrollSpeed ?? 50}
        onChange={(event) =>
          onAppearanceChange({
            newsScrollSpeed: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
  </div>
  );
}
