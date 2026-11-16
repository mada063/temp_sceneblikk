"use client";

import { useI18n } from "../../../lib/i18n";
import { FiPlus, FiX } from "react-icons/fi";

const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;
const XIcon = FiX as React.ComponentType<{ className?: string }>;
import {
  isBadgeShowBorder,
  isBadgeShowText,
  isBadgeTransparent,
} from "../../../view/components/server/badge-styles";
import type { ComponentOptionsContext } from "./types";

export function ServerOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "serverOptionsTitle")}
    </p>
    <label className="space-y-1">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "serverLanguageLabel")}
      </span>
      <select
        value={appearance.serverLanguage ?? ""}
        onChange={(event) =>
          onAppearanceChange({
            serverLanguage: (event.target.value || undefined) as
              | "nb"
              | "en"
              | undefined,
          })
        }
        className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
      >
        <option value="">{t("editor", "serverLanguageApp")}</option>
        <option value="nb">{t("editor", "serverLanguageNb")}</option>
        <option value="en">{t("editor", "serverLanguageEn")}</option>
      </select>
    </label>
    <div className="space-y-2">
      <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "serverUrlsLabel")}
      </span>
      <div className="space-y-2">
        {(() => {
          const urls = Array.isArray(appearance.serverUrls) && appearance.serverUrls.length > 0
            ? appearance.serverUrls
            : [""];
          return urls.map((url, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={url}
              onChange={(event) => {
                const currentUrls = Array.isArray(appearance.serverUrls) && appearance.serverUrls.length > 0
                  ? [...appearance.serverUrls]
                  : [""];
                currentUrls[index] = event.target.value;
                onAppearanceChange({ serverUrls: currentUrls });
              }}
              placeholder={t("editor", "serverUrlsPlaceholder")}
              className="flex-1 rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            />
            <button
              type="button"
              onClick={() => {
                const currentUrls = Array.isArray(appearance.serverUrls) && appearance.serverUrls.length > 0
                  ? [...appearance.serverUrls]
                  : [""];
                // Don't allow removing if there's only one field
                if (currentUrls.length > 1) {
                  currentUrls.splice(index, 1);
                  onAppearanceChange({ serverUrls: currentUrls });
                }
              }}
              disabled={urls.length === 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-custom-color-300/50 bg-white/80 text-custom-color-600 shadow-sm hover:bg-custom-color-100 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-200 dark:hover:bg-custom-color-700"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ));
        })()}
        <button
          type="button"
          onClick={() => {
            const currentUrls = Array.isArray(appearance.serverUrls) && appearance.serverUrls.length > 0
              ? [...appearance.serverUrls]
              : [""];
            onAppearanceChange({ serverUrls: [...currentUrls, ""] });
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-600 shadow-sm hover:bg-custom-color-100 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-200 dark:hover:bg-custom-color-700"
        >
          <PlusIcon className="h-4 w-4" />
          <span>{t("editor", "serverAddUrlButton")}</span>
        </button>
      </div>
      <p className="text-[0.625rem] text-custom-color-500 dark:text-custom-color-400">
        {t("editor", "serverUrlsHelp")}
      </p>
    </div>
    <div className="space-y-3 border-t border-custom-color-300/40 pt-3">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
        {t("editor", "serverStatusBadgeTitle")}
      </p>
      {(
        [
          {
            field: "serverStatusBadgeTransparent" as const,
            labelKey: "serverStatusBadgeTransparentLabel" as const,
          },
          {
            field: "serverStatusBadgeShowBorder" as const,
            labelKey: "serverStatusBadgeShowBorderLabel" as const,
          },
          {
            field: "serverStatusBadgeShowText" as const,
            labelKey: "serverStatusBadgeShowTextLabel" as const,
          },
        ] as const
      ).map((toggle) => (
        <label key={toggle.field} className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            {t("editor", toggle.labelKey)}
          </span>
          <input
            type="checkbox"
            checked={
              toggle.field === "serverStatusBadgeTransparent"
                ? isBadgeTransparent(appearance)
                : toggle.field === "serverStatusBadgeShowBorder"
                  ? isBadgeShowBorder(appearance)
                  : isBadgeShowText(appearance)
            }
            onChange={(event) =>
              onAppearanceChange({
                [toggle.field]: event.target.checked,
              })
            }
            className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
          />
        </label>
      ))}
      {(
        [
          {
            titleKey: "serverStatusBadgeOnlineTitle" as const,
            bgKey: "serverBadgeOnlineColor" as const,
            borderKey: "serverBadgeOnlineBorder" as const,
            textKey: "serverBadgeOnlineText" as const,
            defaults: {
              bg: "#22c55e",
              border: "#16a34a",
              text: "#ffffff",
            },
          },
          {
            titleKey: "serverStatusBadgeOfflineTitle" as const,
            bgKey: "serverBadgeOfflineColor" as const,
            borderKey: "serverBadgeOfflineBorder" as const,
            textKey: "serverBadgeOfflineText" as const,
            defaults: {
              bg: "#ef4444",
              border: "#dc2626",
              text: "#ffffff",
            },
          },
          {
            titleKey: "serverStatusBadgeUnknownTitle" as const,
            bgKey: "serverBadgeUnknownColor" as const,
            borderKey: "serverBadgeUnknownBorder" as const,
            textKey: "serverBadgeUnknownText" as const,
            defaults: {
              bg: "#f59e0b",
              border: "#d97706",
              text: "#ffffff",
            },
          },
        ] as const
      ).map((group) => {
        const transparent = isBadgeTransparent(appearance);
        const showBorder = isBadgeShowBorder(appearance);
        const showText = isBadgeShowText(appearance);
        const colorFields = (
          [
            {
              enabled: !transparent,
              labelKey: "serverStatusBadgeBackgroundLabel" as const,
              field: group.bgKey,
              fallback: group.defaults.bg,
            },
            {
              enabled: showBorder,
              labelKey: "serverStatusBadgeBorderLabel" as const,
              field: group.borderKey,
              fallback: group.defaults.border,
            },
            {
              enabled: showText,
              labelKey: "serverStatusBadgeTextLabel" as const,
              field: group.textKey,
              fallback: group.defaults.text,
            },
          ] as const
        ).filter((colorField) => colorField.enabled);

        if (colorFields.length === 0) {
          return null;
        }

        return (
          <div
            key={group.titleKey}
            className="space-y-2 rounded-lg border border-custom-color-300/30 p-2 dark:border-white/10"
          >
            <p className="text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-custom-color-600 dark:text-custom-color-200">
              {t("editor", group.titleKey)}
            </p>
            {colorFields.map((colorField) => {
              const value =
                (appearance[colorField.field] as string | undefined) ||
                colorField.fallback;
              return (
                <label
                  key={colorField.field}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    {t("editor", colorField.labelKey)}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={value}
                      onChange={(event) =>
                        onAppearanceChange({
                          [colorField.field]: event.target.value,
                        })
                      }
                      className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                    />
                    <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                      {value.toUpperCase()}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>
        );
      })}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
          <span>{t("editor", "serverStatusBadgeRoundednessLabel")}</span>
          <span>{appearance.serverStatusBadgeRadius ?? appearance.borderRadius ?? 10}px</span>
        </div>
        <input
          type="range"
          min={0}
          max={30}
          step={1}
          value={appearance.serverStatusBadgeRadius ?? appearance.borderRadius ?? 10}
          onChange={(event) =>
            onAppearanceChange({
              serverStatusBadgeRadius: Number(event.target.value),
            })
          }
          className="w-full accent-custom-color-500 dark:accent-custom-color-300"
        />
      </div>
    </div>
  </div>
  );
}
