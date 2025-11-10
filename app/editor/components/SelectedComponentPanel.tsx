"use client";

import type { ChangeEvent } from "react";

import { FiTrash2 } from "react-icons/fi";

import type { GridCell, GridConfig } from "../../lib/layout-types";
import { parseKey } from "../utils/grid";

type SelectedComponentPanelProps = {
  selectedCell: string | null;
  selectedCellData: GridCell | null;
  config: GridConfig;
  selectedComponentLabel?: string;
  onSpanChange: (
    dimension: "colSpan" | "rowSpan",
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onClearCell: (cellKey: string) => void;
  isFreeformSelected: boolean;
};

export function SelectedComponentPanel({
  selectedCell,
  selectedCellData,
  config,
  selectedComponentLabel,
  onSpanChange,
  onClearCell,
  isFreeformSelected,
}: SelectedComponentPanelProps) {
  const widthLimit =
    selectedCell != null
      ? Math.max(config.columns - parseKey(selectedCell).column, 1)
      : 1;
  const heightLimit =
    selectedCell != null
      ? Math.max(config.rows - parseKey(selectedCell).row, 1)
      : 1;

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
        Selected component
      </h2>
      {selectedCell && selectedCellData?.componentId ? (
        <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
          <p className="text-xs uppercase tracking-[0.2em] text-custom-color-700/70 dark:text-custom-color-100/70">
            {selectedComponentLabel ?? "Custom component"}
          </p>
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
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
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
                className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={() => onClearCell(selectedCell)}
            className="inline-flex items-center gap-2 rounded-full border border-custom-color-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
          >
            <FiTrash2 className="h-3.5 w-3.5" />
            Remove component
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

