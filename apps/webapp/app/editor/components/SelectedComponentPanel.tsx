"use client";

import { useState, useEffect, useRef, useMemo, type ChangeEvent } from "react";

import { FiTrash2 } from "react-icons/fi";

const TrashIcon = FiTrash2 as React.ComponentType<{ className?: string }>;

import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import { buildComponentSelectionFlags } from "../../lib/component-registry";
import { useI18n } from "../../lib/i18n";
import type {
  CellAppearance,
  GridCell,
  GridConfig,
} from "../../lib/layout-types";
import { makeDefaultAppearance } from "../../lib/layout-types";
import { parseKey } from "../utils/grid";
import { ComponentOptionsPanel } from "./component-options/ComponentOptionsPanel";

type SelectedComponentPanelProps = {
  selectionCount: number;
  primarySelectedCell: string | null;
  selectedCellData: GridCell | null;
  config: GridConfig;
  selectedComponentLabel?: string;
  onSpanChange: (
    dimension: "colSpan" | "rowSpan",
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onClearSelection: () => void;
  isFreeformSelected: boolean;
  selectedAppearance: CellAppearance | null;
  onAppearanceChange: (changes: Partial<CellAppearance>) => void;
  allHaveSameComponent?: boolean;
  allSelectedCellsData?: Array<{ key: string; cell: GridCell }>;
  selectedEntryId?: string | null;
  selectedPanelEntries?: Array<{ id: string; componentId: string }>;
};

export function SelectedComponentPanel({
  selectionCount,
  primarySelectedCell,
  selectedCellData,
  config,
  selectedComponentLabel,
  onSpanChange,
  onClearSelection,
  isFreeformSelected,
  selectedAppearance,
  onAppearanceChange,
  allHaveSameComponent = true,
  allSelectedCellsData = [],
  selectedEntryId,
  selectedPanelEntries,
}: SelectedComponentPanelProps) {
  const { t, locale } = useI18n();
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const hasSelection = selectionCount > 0;
  const isSingleSelection = selectionCount === 1;
  const canShowComponentOptions = isSingleSelection || allHaveSameComponent;
  const widthLimit =
    primarySelectedCell != null
      ? Math.max(config.columns - parseKey(primarySelectedCell).column, 1)
      : 1;
  const heightLimit =
    primarySelectedCell != null
      ? Math.max(config.rows - parseKey(primarySelectedCell).row, 1)
      : 1;
  const appearance = selectedAppearance ?? makeDefaultAppearance();

  useEffect(() => {
    let cancelled = false;

    const checkStatus = async () => {
      try {
        const response = await fetch("/api/google/oauth/status");
        if (!response.ok) {
          if (!cancelled) setGoogleConnected(false);
          return;
        }
        const data: { connected?: boolean } = await response.json();
        if (!cancelled) {
          setGoogleConnected(Boolean(data?.connected));
        }
      } catch {
        if (!cancelled) setGoogleConnected(false);
      }
    };

    checkStatus().catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const previousBorderWidthRef = useRef<number>(
    appearance.borderWidth > 0 ? appearance.borderWidth : 2,
  );

  useEffect(() => {
    if (appearance.borderWidth > 0) {
      previousBorderWidthRef.current = appearance.borderWidth;
    }
  }, [appearance.borderWidth]);

  const previousBackgroundColorRef = useRef<string>(
    appearance.backgroundColor && appearance.backgroundColor !== "transparent"
      ? appearance.backgroundColor
      : "#2563eb",
  );

  useEffect(() => {
    if (
      appearance.backgroundColor &&
      appearance.backgroundColor !== "transparent"
    ) {
      previousBackgroundColorRef.current = appearance.backgroundColor;
    }
  }, [appearance.backgroundColor]);

  let componentId = selectedCellData?.componentId ?? null;

  if (!componentId && allSelectedCellsData.length > 0) {
    componentId =
      allSelectedCellsData.find((item) => item.cell?.componentId)?.cell
        ?.componentId ?? null;
  }

  let effectiveComponentId = componentId;
  if (componentId === "freeform-region" && allSelectedCellsData.length > 0) {
    const panelEntryComponents = allSelectedCellsData
      .map((item) => {
        const entries = item.cell?.panelEntries ?? [];
        return entries.length > 0 ? entries[0]?.componentId : null;
      })
      .filter((id) => id != null);

    if (
      panelEntryComponents.length > 0 &&
      panelEntryComponents.every((id) => id === panelEntryComponents[0])
    ) {
      effectiveComponentId = panelEntryComponents[0] ?? componentId;
    }
  }

  const componentSelection = useMemo(
    () =>
      buildComponentSelectionFlags({
        canShowComponentOptions,
        effectiveComponentId,
        isFreeformSelected,
        componentId,
        allHaveSameComponent,
        panelEntries: selectedCellData?.panelEntries,
      }),
    [
      canShowComponentOptions,
      effectiveComponentId,
      isFreeformSelected,
      componentId,
      allHaveSameComponent,
      selectedCellData?.panelEntries,
    ],
  );

  const isClock = !!componentSelection.clock;
  const isTransport = !!componentSelection.transport;

  const isFullScreen = Boolean(
    isSingleSelection &&
      selectedCellData &&
      selectedCellData.colSpan === config.columns &&
      selectedCellData.rowSpan === config.rows,
  );

  const isClockQuarterOrMore = Boolean(
    isClock &&
      isSingleSelection &&
      selectedCellData &&
      (() => {
        const totalGridSize = config.columns * config.rows;
        const panelArea =
          (selectedCellData.colSpan ?? 1) * (selectedCellData.rowSpan ?? 1);
        if (totalGridSize === 0) {
          return panelArea >= 4;
        }
        return panelArea / totalGridSize >= 0.25;
      })(),
  );

  const isTransportMediumOrLarge = Boolean(
    isTransport &&
      isSingleSelection &&
      selectedCellData &&
      (() => {
        const cols = selectedCellData.colSpan ?? 1;
        const rows = selectedCellData.rowSpan ?? 1;
        const panelArea = cols * rows;
        const totalGridSize = config.columns * config.rows;

        if (!totalGridSize || totalGridSize === 0) {
          return panelArea >= 3;
        }

        return panelArea / totalGridSize >= 0.25;
      })(),
  );

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
        {t("editor", "selectedComponentTitle")}
      </h2>
      {hasSelection &&
      (effectiveComponentId || (selectionCount > 1 && allHaveSameComponent)) ? (
        <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
          <p className="text-xs uppercase tracking-[0.2em] text-custom-color-700/70 dark:text-custom-color-100/70">
            {selectedComponentLabel ??
              t("editor", "selectedComponentDefaultLabel")}
            {!isSingleSelection && allHaveSameComponent && (
              <span className="ml-2 text-[0.625rem] font-normal normal-case opacity-70">
                ({selectionCount} {t("editor", "selectedComponentMultipleSuffix")}
                )
              </span>
            )}
          </p>
          {selectionCount > 1 && !allHaveSameComponent ? (
            <p className="rounded-full bg-custom-color-500/10 px-3 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
              {selectionCount} {t("editor", "selectedComponentDifferentTypes")}
            </p>
          ) : null}
          {isFreeformSelected ? (
            <>
              <p className="text-xs text-custom-color-600/80 dark:text-custom-color-100/60">
                {t("editor", "freeformHint")}
              </p>
              {selectedEntryId &&
                selectedPanelEntries &&
                (() => {
                  const entry = selectedPanelEntries.find(
                    (e) => e.id === selectedEntryId,
                  );
                  const entryIndex = selectedPanelEntries.findIndex(
                    (e) => e.id === selectedEntryId,
                  );
                  if (entry) {
                    const definition = PLACEHOLDER_MAP[entry.componentId];
                    const label =
                      definition && locale === "nb" && definition.labelNb
                        ? definition.labelNb
                        : (definition?.label ?? entry.componentId);
                    return (
                      <p className="rounded-full bg-custom-color-500/10 px-3 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
                        Editing entry #{entryIndex + 1}: {label} (individual
                        settings)
                      </p>
                    );
                  }
                  return null;
                })()}
            </>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                {t("editor", "dimensionWidthColumnsLabel")}
              </span>
              <input
                type="number"
                min={1}
                max={widthLimit}
                value={selectedCellData?.colSpan ?? 1}
                onChange={onSpanChange("colSpan")}
                disabled={!isSingleSelection}
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                {t("editor", "dimensionHeightRowsLabel")}
              </span>
              <input
                type="number"
                min={1}
                max={heightLimit}
                value={selectedCellData?.rowSpan ?? 1}
                onChange={onSpanChange("rowSpan")}
                disabled={!isSingleSelection}
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>
          </div>

          <ComponentOptionsPanel
            componentSelection={componentSelection}
            context={{
              appearance,
              onAppearanceChange,
              googleConnected,
              isFullScreen,
              isClockQuarterOrMore,
              isTransportMediumOrLarge,
            }}
            previousBorderWidthRef={previousBorderWidthRef}
            previousBackgroundColorRef={previousBackgroundColorRef}
          />

          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasSelection}
            className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-600 transition hover:bg-custom-color-200/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
          >
            <TrashIcon className="h-3.5 w-3.5" />
            {selectionCount > 1
              ? t("editor", "removeMultiple")
              : t("editor", "removeSingle")}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
          {t("editor", "selectedComponentEmptyHint")}
        </p>
      )}
    </div>
  );
}
