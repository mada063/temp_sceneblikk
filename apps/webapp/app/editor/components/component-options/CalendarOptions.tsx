"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function CalendarOptions({ appearance, onAppearanceChange
, googleConnected
}: ComponentOptionsContext
 & { googleConnected: boolean | null }
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "calendarOptionsTitle")}
    </p>
    <div className="space-y-2">
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          {t("editor", "calendarProviderLabel")}
        </span>
        <select
          value={appearance.calendarProvider ?? "demo"}
          onChange={(event) =>
            onAppearanceChange({
              calendarProvider: event.target.value as "demo" | "google",
            })
          }
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        >
          <option value="demo">
            {t("editor", "calendarProviderDemoLabel")}
          </option>
          <option value="google">
            {t("editor", "calendarProviderGoogleLabel")}
          </option>
          <option value="outlook" disabled>
            {t("editor", "calendarProviderOutlookSoonLabel")}
          </option>
        </select>
      </label>
      {appearance.calendarProvider === "google" && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={async () => {
              try {
                const response = await fetch("/api/google/oauth/url");
                if (!response.ok) {
                  const errorData = await response.json().catch(() => ({}));
                  console.error("Failed to get Google OAuth URL:", response.status, errorData);
                  return;
                }
                const data = await response.json();
                if (data?.url) {
                  window.location.href = data.url as string;
                } else {
                  console.error("No OAuth URL in response:", data);
                }
              } catch (error) {
                console.error("Error fetching Google OAuth URL:", error);
              }
            }}
            className="inline-flex items-center justify-center rounded-full border border-custom-color-400 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
          >
            {t("editor", "calendarConnectGoogleButton")}
          </button>
          {googleConnected !== null && (
            <span className="inline-flex items-center gap-1 text-[0.625rem] font-medium text-custom-color-500 dark:text-custom-color-400">
              <span
                className={`h-2 w-2 rounded-full ${
                  googleConnected
                    ? "bg-emerald-400"
                    : "bg-amber-400"
                }`}
              />
              {googleConnected
                ? t("editor", "googleOAuthConnected")
                : t("editor", "googleOAuthNotConnected")}
            </span>
          )}
        </div>
      )}
      <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
        {t("editor", "calendarConnectGoogleHelp")}
      </p>
    </div>
    {appearance.calendarProvider === "google" && (
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          {t("editor", "calendarIdLabel")}
        </span>
        <input
          type="text"
          value={appearance.calendarId ?? "primary"}
          onChange={(event) =>
            onAppearanceChange({
              calendarId: event.target.value,
            })
          }
          placeholder="primary"
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        />
        <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
          {t("editor", "calendarIdHelp")}
        </p>
      </label>
    )}
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarShowUpcomingLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.calendarShowUpcoming ?? true}
        onChange={(event) =>
          onAppearanceChange({
            calendarShowUpcoming: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarDisableAnimationsLabel")}
      </span>
      <input
        type="checkbox"
        checked={appearance.calendarDisableAnimations ?? false}
        onChange={(event) =>
          onAppearanceChange({
            calendarDisableAnimations: event.target.checked,
          })
        }
        className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
      />
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarAccentColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={
            appearance.calendarAccentColor ||
            appearance.borderColor ||
            appearance.textColor ||
            "#ffffff"
          }
          onChange={(event) =>
            onAppearanceChange({
              calendarAccentColor: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(
            appearance.calendarAccentColor ||
            appearance.borderColor ||
            appearance.textColor ||
            "#ffffff"
          ).toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarMutedTextColorLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={
            appearance.calendarMutedColor ||
            appearance.textColor ||
            "#cccccc"
          }
          onChange={(event) =>
            onAppearanceChange({
              calendarMutedColor: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(
            appearance.calendarMutedColor ||
            appearance.textColor ||
            "#cccccc"
          ).toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarCellBackgroundLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={
            appearance.calendarCellBackground ||
            appearance.backgroundColor ||
            "#0f172a"
          }
          onChange={(event) =>
            onAppearanceChange({
              calendarCellBackground: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(
            appearance.calendarCellBackground ||
            appearance.backgroundColor ||
            "#0f172a"
          ).toUpperCase()}
        </span>
      </div>
    </label>
    <label className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarTodayHighlightLabel")}
      </span>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={
            appearance.calendarTodayHighlight ||
            appearance.borderColor ||
            "#ffffff"
          }
          onChange={(event) =>
            onAppearanceChange({
              calendarTodayHighlight: event.target.value,
            })
          }
          className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
        />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
          {(
            appearance.calendarTodayHighlight ||
            appearance.borderColor ||
            "#ffffff"
          ).toUpperCase()}
        </span>
      </div>
    </label>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "calendarEventColorsLabel")}
      </span>
      <textarea
        value={appearance.calendarEventPalette ?? ""}
        onChange={(event) =>
          onAppearanceChange({
            calendarEventPalette: event.target.value,
          })
        }
        rows={2}
        placeholder={t(
          "editor",
          "calendarEventColorsPlaceholder",
        )}
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      />
      <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
        {t("editor", "calendarEventColorsHelp")}
      </p>
    </label>
  </div>
  );
}
