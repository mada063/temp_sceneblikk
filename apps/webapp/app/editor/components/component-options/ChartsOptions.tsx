"use client";

import { useI18n } from "../../../lib/i18n";
import { ChartsEditor } from "../ChartsEditor";
import type { ComponentOptionsContext } from "./types";

export function ChartsOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      {t("editor", "chartsOptionsTitle")}
    </p>
    <ChartsEditor
      value={appearance.chartsConfig ?? ""}
      onChange={(value) =>
        onAppearanceChange({ chartsConfig: value })
      }
    />
  </div>
  );
}
