"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function BrandOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "brandOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "brandLogoUrlLabel")}
      </span>
      <input
        type="url"
        value={appearance.brandingLogoUrl ?? ""}
        onChange={(event) =>
          onAppearanceChange({
            brandingLogoUrl: event.target.value,
          })
        }
        placeholder="https://example.com/logo.png"
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      />
    </label>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "brandTextLabel")}
      </span>
      <input
        type="text"
        value={appearance.brandingText ?? ""}
        onChange={(event) =>
          onAppearanceChange({
            brandingText: event.target.value,
          })
        }
        placeholder={t("editor", "brandTextPlaceholder")}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      />
    </label>
  </div>
  );
}
