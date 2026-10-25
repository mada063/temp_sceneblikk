"use client";

import { useI18n } from "../../../lib/i18n";

import type { ComponentOptionsContext } from "./types";

export function TasksOptions({ appearance, onAppearanceChange
, googleConnected
}: ComponentOptionsContext
 & { googleConnected: boolean | null }
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "tasksOptionsTitle")}
    </p>
    <div className="space-y-2">
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          {t("editor", "tasksProviderLabel")}
        </span>
        <select
          value={appearance.tasksProvider ?? "demo"}
          onChange={(event) =>
            onAppearanceChange({
              tasksProvider: event.target.value as "demo" | "google",
            })
          }
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        >
          <option value="demo">
            {t("editor", "tasksProviderDemoLabel")}
          </option>
          <option value="google">
            {t("editor", "tasksProviderGoogleLabel")}
          </option>
          <option value="outlook" disabled>
            {t("editor", "tasksProviderOutlookSoonLabel")}
          </option>
        </select>
      </label>
      {appearance.tasksProvider === "google" && (
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
            {t("editor", "tasksConnectGoogleButton")}
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
        {t("editor", "tasksConnectGoogleHelp")}
      </p>
    </div>
    {appearance.tasksProvider === "google" && (
      <label className="space-y-1">
        <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          {t("editor", "tasksListIdLabel")}
        </span>
        <input
          type="text"
          value={appearance.tasksListId ?? ""}
          onChange={(event) =>
            onAppearanceChange({
              tasksListId: event.target.value,
            })
          }
          placeholder={t(
            "editor",
            "tasksListIdPlaceholder",
          )}
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        />
        <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
          {t("editor", "tasksListIdHelp")}
        </p>
      </label>
    )}
  </div>
  );
}
