"use client";

import { useMemo, useState, type ChangeEvent, type DragEvent } from "react";

import { FiChevronDown, FiSearch, FiSliders, FiMaximize2 } from "react-icons/fi";
import { ColorPicker } from "./ColorPicker";

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
  onBackgroundColorChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
  onDetachLibrary?: () => void;
  isLibraryDetached?: boolean;
};

export function GridSettingsPanel({
  config,
  screenSizeDraft,
  onScreenSizeChange,
  onScreenSizeBlur,
  onDimensionChange,
  onGapChange,
  onBackgroundColorChange,
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
  onDetachLibrary,
  isLibraryDetached = false,
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
          <GridSettingsContent
            config={config}
            screenSizeDraft={screenSizeDraft}
            onScreenSizeChange={onScreenSizeChange}
            onScreenSizeBlur={onScreenSizeBlur}
            onDimensionChange={onDimensionChange}
            onGapChange={onGapChange}
            onBackgroundColorChange={onBackgroundColorChange}
            totalCells={totalCells}
            occupiedSlots={occupiedSlots}
            freeSlots={freeSlots}
            geometryBuffer={geometryBuffer}
            geometry={geometry}
          />
        ) : null}
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="border-b border-custom-color-100/70 px-6 py-4 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onToggleLibrary}
              className="flex flex-1 items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-600 transition hover:text-custom-color-500 dark:text-custom-color-200 dark:hover:text-custom-color-100"
            >
              <span>Component library</span>
              <FiChevronDown
                className={`h-4 w-4 transition-transform ${isLibraryCollapsed ? "" : "rotate-180"}`}
                aria-hidden
              />
            </button>
            {onDetachLibrary && !isLibraryDetached && (
              <button
                type="button"
                onClick={onDetachLibrary}
                className="rounded-lg p-1.5 text-custom-color-600 transition hover:bg-custom-color-200/50 hover:text-custom-color-800 dark:text-custom-color-200 dark:hover:bg-custom-color-700/50 dark:hover:text-custom-color-100"
                aria-label="Detach component library"
                title="Detach component library"
              >
                <FiMaximize2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        {!isLibraryCollapsed && !isLibraryDetached ? (
          <ComponentLibrary onDragStartPalette={onDragStartPalette} />
        ) : null}
      </div>
    </aside>
  );
}

type GridSettingsContentProps = {
  config: GridConfig;
  screenSizeDraft: string;
  onScreenSizeChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onScreenSizeBlur: () => void;
  onDimensionChange: (
    dimension: "columns" | "rows",
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onGapChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBackgroundColorChange: (event: ChangeEvent<HTMLInputElement>) => void;
  totalCells: number;
  occupiedSlots: number;
  freeSlots: number;
  geometryBuffer: number;
  geometry: GridGeometry;
};

function GridSettingsContent({
  config,
  screenSizeDraft,
  onScreenSizeChange,
  onScreenSizeBlur,
  onDimensionChange,
  onGapChange,
  onBackgroundColorChange,
  totalCells,
  occupiedSlots,
  freeSlots,
  geometryBuffer,
  geometry,
}: GridSettingsContentProps) {
  const [summaryCollapsed, setSummaryCollapsed] = useState(true);

  return (
    <div className="mt-4 space-y-3 text-sm text-custom-color-900 dark:text-custom-color-50">
      <div className="space-y-1.5">
        <label className="block">
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
            className="mt-1.5 w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              Grid columns
            </span>
            <input
              type="number"
              min={GRID_LIMITS.min}
              max={GRID_LIMITS.maxColumns}
              value={config.columns}
              onChange={onDimensionChange("columns")}
              className="mt-1.5 w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
              Grid rows
            </span>
            <input
              type="number"
              min={GRID_LIMITS.min}
              max={GRID_LIMITS.maxRows}
              value={config.rows}
              onChange={onDimensionChange("rows")}
              className="mt-1.5 w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
            />
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Grid gap (px)
          </span>
          <input
            type="number"
            min={GRID_LIMITS.minGap}
            max={GRID_LIMITS.maxGap}
            value={config.gap}
            onChange={onGapChange}
            className="mt-1.5 w-full rounded-lg border border-custom-color-300/60 bg-white/95 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
          />
        </label>
      </div>

      <div className="space-y-1.5">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
            Background color
          </span>
          <div className="mt-1.5">
            <ColorPicker
              value={config.backgroundColor ?? "#0a3d62"}
              onChange={onBackgroundColorChange}
            />
          </div>
        </label>
      </div>

      <div className="rounded-2xl border border-custom-color-300/60 bg-white/80 dark:border-white/10 dark:bg-custom-color-800/70">
        <button
          type="button"
          onClick={() => setSummaryCollapsed(!summaryCollapsed)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-custom-color-600 transition hover:text-custom-color-500 dark:text-custom-color-200 dark:hover:text-custom-color-100"
        >
          <span>Grid summary</span>
          <FiChevronDown
            className={`h-4 w-4 transition-transform ${summaryCollapsed ? "" : "rotate-180"}`}
            aria-hidden
          />
        </button>
        {!summaryCollapsed ? (
          <ul className="space-y-2 border-t border-custom-color-300/60 px-4 pb-4 pt-3 text-xs text-custom-color-700/90 dark:border-white/10 dark:text-custom-color-100/80">
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
        ) : null}
      </div>
    </div>
  );
}

type ComponentLibraryProps = {
  onDragStartPalette: (componentId: string) => (event: DragEvent<HTMLDivElement>) => void;
};

function ComponentLibrary({ onDragStartPalette }: ComponentLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) {
      return PLACEHOLDER_LIBRARY;
    }
    const query = searchQuery.toLowerCase().trim();
    return PLACEHOLDER_LIBRARY.filter(
      (component) =>
        component.label.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.id.toLowerCase().includes(query),
    );
  }, [searchQuery]);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="border-b border-custom-color-100/70 px-6 py-3 dark:border-white/10">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-color-800 dark:text-custom-color-50" />
          <input
            type="search"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-custom-color-50 bg-white/95 pl-10 pr-3 py-2 text-sm font-medium text-custom-color-800 dark:text-custom-color-50 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50 dark:placeholder:text-custom-color-300/50"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4 custom-scrollbar">
        {filteredComponents.length > 0 ? (
          <div className="grid gap-3">
            {filteredComponents.map((component) => (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FiSearch className="mb-3 h-8 w-8 text-custom-color-800 dark:text-custom-color-50" />
            <p className="text-sm font-semibold text-custom-color-800 dark:text-custom-color-50">
              No components found
            </p>
            <p className="mt-1 text-xs text-custom-color-500 dark:text-custom-color-300">
              Try a different search term
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

