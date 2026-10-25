"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function MediaOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "mediaOptionsTitle")}
    </p>
    <div className="space-y-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "mediaTypeLabel")}
      </span>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="media-type"
            value="image"
            checked={appearance.mediaType === "image"}
            onChange={() =>
              onAppearanceChange({ mediaType: "image" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>{t("editor", "mediaTypeImageLabel")}</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="media-type"
            value="video"
            checked={appearance.mediaType === "video"}
            onChange={() =>
              onAppearanceChange({ mediaType: "video" })
            }
            className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
          <span>{t("editor", "mediaTypeVideoLabel")}</span>
        </label>
      </div>
    </div>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "mediaUrlsLabel")}
      </span>
      <textarea
        value={appearance.mediaUrls ?? ""}
        onChange={(event) =>
          onAppearanceChange({
            mediaUrls: event.target.value,
          })
        }
        placeholder={t("editor", "mediaUrlsPlaceholder")}
        rows={4}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      />
      <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
        {t("editor", "mediaUrlsHelp")}
      </p>
    </label>
    <div className="flex items-center gap-3">
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={appearance.mediaAutoPlay ?? true}
          onChange={(event) =>
            onAppearanceChange({
              mediaAutoPlay: event.target.checked,
            })
          }
          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
        />
        <span>{t("editor", "mediaAutoPlayLabel")}</span>
      </label>
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "mediaTransitionDurationLabel")}</span>
        <span>{appearance.mediaTransitionDuration ?? 5}s</span>
      </div>
      <input
        type="range"
        min={1}
        max={30}
        step={1}
        value={appearance.mediaTransitionDuration ?? 5}
        onChange={(event) =>
          onAppearanceChange({
            mediaTransitionDuration: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
  </div>
  );
}
