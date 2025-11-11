"use client";

import type { ChangeEvent } from "react";

import { FiTrash2 } from "react-icons/fi";

import type {
  CellAppearance,
  GridCell,
  GridConfig,
} from "../../lib/layout-types";
import { makeDefaultAppearance } from "../../lib/layout-types";
import { parseKey } from "../utils/grid";

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
}: SelectedComponentPanelProps) {
  const hasSelection = selectionCount > 0;
  const isSingleSelection = selectionCount === 1;
  const widthLimit =
    primarySelectedCell != null
      ? Math.max(config.columns - parseKey(primarySelectedCell).column, 1)
      : 1;
  const heightLimit =
    primarySelectedCell != null
      ? Math.max(config.rows - parseKey(primarySelectedCell).row, 1)
      : 1;
  const appearance = selectedAppearance ?? makeDefaultAppearance();

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
        Selected component
      </h2>
      {hasSelection && selectedCellData?.componentId ? (
        <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
          <p className="text-xs uppercase tracking-[0.2em] text-custom-color-700/70 dark:text-custom-color-100/70">
            {selectedComponentLabel ?? "Custom component"}
          </p>
          {selectionCount > 1 ? (
            <p className="rounded-full bg-custom-color-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
              {selectionCount} components selected
            </p>
          ) : null}
          {isFreeformSelected ? (
            <p className="text-xs text-custom-color-600/80 dark:text-custom-color-100/60">
              Drag empty cells to redraw the panel footprint, drop library items onto it to
              build the playlist, or adjust its size below.
            </p>
          ) : null}
          <div className="grid grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                Width (columns)
              </span>
              <input
                type="number"
                min={1}
                max={widthLimit}
                value={selectedCellData.colSpan ?? 1}
                onChange={onSpanChange("colSpan")}
                disabled={!isSingleSelection}
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                Height (rows)
              </span>
              <input
                type="number"
                min={1}
                max={heightLimit}
                value={selectedCellData.rowSpan ?? 1}
                onChange={onSpanChange("rowSpan")}
                disabled={!isSingleSelection}
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>
          </div>
          <div className="rounded-2xl border border-custom-color-300/30 bg-white/70 p-4 text-xs uppercase tracking-[0.16em] text-custom-color-600 dark:border-white/10 dark:bg-custom-color-800/70 dark:text-custom-color-200">
            <p className="text-[11px] font-semibold">Appearance</p>
            <div className="mt-3 space-y-3 text-[11px] normal-case tracking-normal text-custom-color-700 dark:text-custom-color-100">
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  Background color
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.backgroundColor}
                    onChange={(event) =>
                      onAppearanceChange({ backgroundColor: event.target.value })
                    }
                    className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                  />
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                    {appearance.backgroundColor?.toUpperCase?.() ?? ""}
                  </span>
                </div>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  Border color
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.borderColor}
                    onChange={(event) =>
                      onAppearanceChange({ borderColor: event.target.value })
                    }
                    className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                  />
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                    {appearance.borderColor?.toUpperCase?.() ?? ""}
                  </span>
                </div>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  Text color
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
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                    {appearance.textColor?.toUpperCase?.() ?? ""}
                  </span>
                </div>
              </label>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  <span>Rounded corners</span>
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
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  <span>Border thickness</span>
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
                  className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                />
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearSelection}
            disabled={!hasSelection}
            className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-600 transition hover:bg-custom-color-200/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            {selectionCount > 1 ? "Remove selected" : "Remove component"}
          </button>
        </div>
      ) : (
        <p className="mt-4 text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
          Select any component on the canvas to fine-tune its footprint or remove it from
          the layout.
        </p>
      )}
    </div>
  );
}

