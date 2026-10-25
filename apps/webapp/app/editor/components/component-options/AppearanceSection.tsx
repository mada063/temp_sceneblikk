"use client";

import { useI18n } from "../../../lib/i18n";
import type { AppearanceSectionProps } from "./types";

export function AppearanceSection({
  appearance,
  onAppearanceChange,
  previousBorderWidthRef,
  previousBackgroundColorRef,
  children,
}: AppearanceSectionProps) {
  const { t } = useI18n();
  return (
    <div className="rounded-2xl border border-custom-color-300/30 bg-white/70 p-4 text-xs uppercase tracking-[0.16em] text-custom-color-600 dark:border-white/10 dark:bg-custom-color-800/70 dark:text-custom-color-200">
  <p className="text-[0.6875rem] font-semibold">
    {t("editor", "appearanceSectionTitle")}
  </p>
  <div className="mt-3 space-y-3 text-[0.6875rem] normal-case tracking-normal text-custom-color-700 dark:text-custom-color-100">
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "appearanceBackgroundColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.backgroundColor === "transparent" ? "#000000" : appearance.backgroundColor}
          onChange={(event) =>
            onAppearanceChange({ backgroundColor: event.target.value })
          }
          disabled={appearance.backgroundColor === "transparent"}
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {appearance.backgroundColor === "transparent"
            ? "TRANSPARENT"
            : appearance.backgroundColor?.toUpperCase?.() ?? ""}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "appearanceTransparentBackgroundLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.backgroundColor === "transparent"}
        onChange={(event) => {
          if (event.target.checked) {
            // Save current color before switching to transparent
            if (appearance.backgroundColor && appearance.backgroundColor !== "transparent") {
              previousBackgroundColorRef.current = appearance.backgroundColor;
            }
            onAppearanceChange({ backgroundColor: "transparent" });
          } else {
            // Restore to previous color when unchecking
            onAppearanceChange({ backgroundColor: previousBackgroundColorRef.current });
          }
        }}
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "appearanceShowBorderLabel")}
      </span>
      <input
        type="checkbox"
        checked={(appearance.borderWidth ?? 2) > 0}
        onChange={(event) => {
          if (event.target.checked) {
            // When enabling, restore to previous value or default to 2
            const newWidth = previousBorderWidthRef.current > 0 ? previousBorderWidthRef.current : 2;
            previousBorderWidthRef.current = newWidth;
            onAppearanceChange({ borderWidth: newWidth });
          } else {
            // When disabling, save current value and set to 0
            if (appearance.borderWidth > 0) {
              previousBorderWidthRef.current = appearance.borderWidth;
            }
            onAppearanceChange({ borderWidth: 0 });
          }
        }}
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "appearanceBorderColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.borderColor}
          onChange={(event) =>
            onAppearanceChange({ borderColor: event.target.value })
          }
          disabled={(appearance.borderWidth ?? 2) === 0}
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {appearance.borderColor?.toUpperCase?.() ?? ""}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "appearanceTextColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={appearance.textColor}
          onChange={(event) =>
            onAppearanceChange({ textColor: event.target.value })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {appearance.textColor?.toUpperCase?.() ?? ""}
        </span>
      </div>
    </label>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "appearanceRoundedCornersLabel")}</span>
        <span>{Math.round(appearance.borderRadius)} px</span>
      </div>
      <input
        type="range"
        min={0}
        max={64}
        step={1}
        value={appearance.borderRadius}
        onChange={(event) =>
          onAppearanceChange({
            borderRadius: Number(event.target.value),
          })
        }
        className="w-full accent-custom-color-500 dark:accent-custom-color-300"
      />
    </div>
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        <span>{t("editor", "appearanceBorderThicknessLabel")}</span>
        <span>{Math.round(appearance.borderWidth)} px</span>
      </div>
      <input
        type="range"
        min={0}
        max={16}
        step={1}
        value={appearance.borderWidth}
        onChange={(event) =>
          onAppearanceChange({
            borderWidth: Number(event.target.value),
          })
        }
        disabled={(appearance.borderWidth ?? 2) === 0}
        className="w-full accent-custom-color-500 dark:accent-custom-color-300 disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
      {children}
    </div>
    </div>
  );
}
