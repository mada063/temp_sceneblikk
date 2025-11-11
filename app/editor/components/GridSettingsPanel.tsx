"use client";

import type { ChangeEvent, DragEvent } from "react";

import { FiChevronDown, FiSliders } from "react-icons/fi";

import {
  GRID_LIMITS,
  type GridConfig,
} from "../../lib/layout-types";
import { PLACEHOLDER_LIBRARY } from "../../lib/placeholders";
import type { GridGeometry } from "../types";

type GridSettingsPanelProps = {
  config: GridConfig;
  screenSizeDraft: string;
  onScreenSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onScreenSizeBlur: () => void;
  onDimensionChange: (
    dimension: "columns" | "rows",
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onGapChange: (event: ChangeEvent<HTMLInputElement>) => void;
  totalCells: number;
  occupiedSlots: number;
  freeSlots: number;
  geometryBuffer: number;
  geometry: GridGeometry;
  onDragStartPalette: (componentId: string) => (event: DragEvent<HTMLDivElement>) => void;
  isSettingsCollapsed: boolean;
  isLibraryCollapsed: boolean;
  onToggleSettings: () => void;
  onToggleLibrary: () => void;
};

export function GridSettingsPanel({
  config,
  screenSizeDraft,
  onScreenSizeChange,
  onScreenSizeBlur,
  onDimensionChange,
  onGapChange,
  totalCells,
  occupiedSlots,
  freeSlots,
  geometryBuffer,
  geometry,
  onDragStartPalette,
  isSettingsCollapsed,
  isLibraryCollapsed,
  onToggleSettings,
  onToggleLibrary,
}: GridSettingsPanelProps) {
  return (
    <aside className="glass-surface flex h-full flex-col overflow-hidden rounded-3xl border border-custom-color-200/70 bg-white/95 p-0 shadow-lg transition-colors dark:border-white/10 dark:bg-custom-color-900/80">
      <div className="border-b border-custom-color-100/80 px-6 py-4 dark:border-white/10">
        <button
          type="button"
          onClick={onToggleSettings}
          className="flex w-full items-center justify-between text-sm font-semibold uppercase tracking-[0.22em] text-custom-color-600 transition hover:text-custom-color-500 dark:text-custom-color-200 dark:hover:text-custom-color-100"
        >
          <span className="flex items-center gap-2">
            <FiSliders className="h-4 w-4" aria-hidden />
            Grid settings
          </span>
          <FiChevronDown
            className={`h-4 w-4 transition-transform ${isSettingsCollapsed ? "" : "rotate-180"}`}
            aria-hidden
          />
        </button>
        {!isSettingsCollapsed ? (
          <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
            <label className="space-y-2">
              <span className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.14em] text-custom-color-600 dark:text-custom-color-200">
                Screen size (inches)
                <span>{config.screenInches.toFixed(1)} in</span>
              </span>
              <input
                type="number"
                min={GRID_LIMITS.minDiagonal}
                max={GRID_LIMITS.maxDiagonal}
                step={1}
                value={screenSizeDraft}
                onChange={onScreenSizeChange}
                onBlur={onScreenSizeBlur}
                className="w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl border border-custom-color-300/50 bg-white/80 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-custom-color-600 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-100">
              <span>Orientation</span>
              <span>{config.orientation === "landscape" ? "Landscape" : "Portrait"}</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  Grid columns
                </span>
                <input
                  type="number"
                  min={GRID_LIMITS.min}
                  max={GRID_LIMITS.maxColumns}
                  value={config.columns}
                  onChange={onDimensionChange("columns")}
                  className="w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  Grid rows
                </span>
                <input
                  type="number"
                  min={GRID_LIMITS.min}
                  max={GRID_LIMITS.maxRows}
                  value={config.rows}
                  onChange={onDimensionChange("rows")}
                  className="w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                />
              </label>
            </div>

            <label className="space-y-1">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                Grid gap (px)
              </span>
              <input
                type="number"
                min={GRID_LIMITS.minGap}
                max={GRID_LIMITS.maxGap}
                value={config.gap}
                onChange={onGapChange}
                className="w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
              />
            </label>

            <div className="rounded-2xl border border-custom-color-300/60 bg-white/80 p-4 text-xs text-custom-color-700/90 dark:border-white/10 dark:bg-custom-color-800/70 dark:text-custom-color-100/80">
              <p className="font-semibold uppercase tracking-[0.22em] text-custom-color-600 dark:text-custom-color-200">
                Grid summary
              </p>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="font-semibold text-custom-color-800 dark:text-custom-color-100">
                    {config.columns} columns
                  </span>
                  {" × "}
                  <span className="font-semibold text-custom-color-800 dark:text-custom-color-100">
                    {config.rows} rows
                  </span>
                  {" = "}
                  {totalCells} cells
                </li>
                <li>Layout usage: {occupiedSlots} filled · {freeSlots} available</li>
                <li>
                  Geometry headroom: {geometry.maxSlots} modules · buffer {geometryBuffer}
                </li>
                <li>
                  Width ~{Math.round(geometry.widthPx)} px · Height ~
                  {Math.round(geometry.heightPx)} px
                </li>
              </ul>
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="border-b border-custom-color-100/70 px-6 py-4 dark:border-white/10">
          <button
            type="button"
            onClick={onToggleLibrary}
            className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-600 transition hover:text-custom-color-500 dark:text-custom-color-200 dark:hover:text-custom-color-100"
          >
            <span>Component library</span>
            <FiChevronDown
              className={`h-4 w-4 transition-transform ${isLibraryCollapsed ? "" : "rotate-180"}`}
              aria-hidden
            />
          </button>
        </div>
        {!isLibraryCollapsed ? (
          <div className="flex h-full flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <div className="grid gap-3">
                {PLACEHOLDER_LIBRARY.map((component) => (
                  <div
                    key={component.id}
                    draggable
                    onDragStart={onDragStartPalette(component.id)}
                    className="group flex cursor-grab items-start gap-3 rounded-xl border border-custom-color-300/60 bg-white/85 p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-custom-color-400/70 hover:shadow-lg active:cursor-grabbing dark:border-white/10 dark:bg-custom-color-800/70"
                  >
                    <component.icon className="mt-1 h-5 w-5 text-custom-color-600 dark:text-custom-color-200" />
                    <div>
                      <p className="text-sm font-semibold text-custom-color-900 dark:text-custom-color-100">
                        {component.label}
                      </p>
                      <p className="text-xs text-custom-color-700/80 dark:text-custom-color-100/60">
                        {component.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

