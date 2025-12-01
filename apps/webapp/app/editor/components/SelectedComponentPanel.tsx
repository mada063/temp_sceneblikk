"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";

import { FiTrash2, FiSearch } from "react-icons/fi";
import timezones from "../../lib/timezones.json";
import weatherLocations from "../../lib/weather-locations.json";
import transportLocations from "../../lib/transport-locations.json";
import { searchStopPlaces } from "../../view/components/transport/utils";
import type { StopPlace } from "../../view/components/transport/types";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { ChartsEditor } from "./ChartsEditor";

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
  allHaveSameComponent?: boolean;
  allSelectedCellsData?: Array<{ key: string; cell: GridCell }>;
};

/**
 * Helper component for searchable stop place selector
 */
function StopPlaceSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (stopPlaceId: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StopPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Extract numeric ID from NSR:StopPlace:XXX format for display
  const extractNumericId = (id: string): string => {
    const match = id.match(/NSR:StopPlace:(\d+)/);
    return match ? match[1] : id;
  };

  // Handle search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchStopPlaces(searchQuery.trim(), 8);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching stop places:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectStopPlace = (stopPlace: StopPlace) => {
    // Store just the numeric ID (e.g., "32214") for simplicity
    // The utils will convert it to NSR:StopPlace:32214 format when needed
    const idToStore = extractNumericId(stopPlace.id);
    
    onChange(idToStore);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Display value: show search query if active, otherwise show stored value
  const displayValue = searchQuery !== "" ? searchQuery : (value || "");

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          onChange={(event) => {
            const newValue = event.target.value;
            setSearchQuery(newValue);
            setShowDropdown(true);
            // Also update the value directly if user is typing
            onChange(newValue.trim());
          }}
          onFocus={() => {
            // Clear search query on focus to show current value and allow searching
            if (!searchQuery) {
              setSearchQuery("");
            }
            if (searchResults.length > 0 || searchQuery.length >= 2) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            // Don't hide dropdown immediately to allow clicking on results
            setTimeout(() => setShowDropdown(false), 200);
          }}
          placeholder="Search stop place or enter ID (e.g., 32214)"
          className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 pr-10 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
        />
        <FiSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-color-400 dark:text-custom-color-500" />
      </div>
      
      {showDropdown && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-custom-color-300/50 bg-white shadow-lg dark:border-white/10 dark:bg-custom-color-800">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              Searching...
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              No results found. You can enter a stop place ID directly (e.g., 32214).
            </div>
          ) : (
            searchResults.map((stopPlace) => (
              <button
                key={stopPlace.id}
                type="button"
                onClick={() => handleSelectStopPlace(stopPlace)}
                className="w-full px-4 py-2 text-left text-sm text-custom-color-800 hover:bg-custom-color-100 dark:text-custom-color-50 dark:hover:bg-custom-color-700"
              >
                <div className="font-medium">{stopPlace.name}</div>
                <div className="text-xs text-custom-color-500 dark:text-custom-color-400">
                  ID: {extractNumericId(stopPlace.id)}
                </div>
              </button>
            ))
          )}
        </div>
      )}
      
      {value && !searchQuery && (
        <p className="mt-1 text-xs text-custom-color-500 dark:text-custom-color-400">
          Stop place ID: {value}
          <span className="ml-2 text-[10px] opacity-70">
            (from{" "}
            <a
              href="https://stoppested.entur.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-custom-color-600 dark:hover:text-custom-color-300"
            >
              stoppested.entur.org
            </a>
            )
          </span>
        </p>
      )}
    </div>
  );
}

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
}: SelectedComponentPanelProps) {
  const hasSelection = selectionCount > 0;
  const isSingleSelection = selectionCount === 1;
  // Allow component options to be shown if all selected cells have the same component type
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
  
  // Track the previous border width to restore when toggling border back on
  const previousBorderWidthRef = useRef<number>(appearance.borderWidth > 0 ? appearance.borderWidth : 2);
  
  // Update the ref whenever borderWidth changes and is > 0
  useEffect(() => {
    if (appearance.borderWidth > 0) {
      previousBorderWidthRef.current = appearance.borderWidth;
    }
  }, [appearance.borderWidth]);

  // Get the component ID - prioritize selectedCellData, but also check allSelectedCellsData when multiple are selected
  // When multiple cells are selected and all have the same component, get componentId from any of them
  let componentId = selectedCellData?.componentId ?? null;
  
  // If componentId is not available from selectedCellData, try to get it from allSelectedCellsData
  if (!componentId && allSelectedCellsData.length > 0) {
    componentId = allSelectedCellsData.find(item => item.cell?.componentId)?.cell?.componentId ?? null;
  }
  
  // Check if we're dealing with freeform regions - if so, check panelEntries for component type
  // When multiple freeform regions are selected, check if they all have the same component in panelEntries
  let effectiveComponentId = componentId;
  if (componentId === "freeform-region" && allSelectedCellsData.length > 0) {
    // Get the first component from panelEntries of each selected cell
    const panelEntryComponents = allSelectedCellsData
      .map(item => {
        const entries = item.cell?.panelEntries ?? [];
        return entries.length > 0 ? entries[0]?.componentId : null;
      })
      .filter(id => id != null);
    
    // If all selected freeform regions have the same component in their first panelEntry, use that
    if (panelEntryComponents.length > 0 && panelEntryComponents.every(id => id === panelEntryComponents[0])) {
      effectiveComponentId = panelEntryComponents[0] ?? componentId;
    }
  }

  const isDirectClock =
    canShowComponentOptions && effectiveComponentId === "clock";
  const hasClockInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "clock",
    );
  const isClock = isDirectClock || hasClockInPanel;

  const isDirectWeather =
    canShowComponentOptions && effectiveComponentId === "weather";
  const hasWeatherInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "weather",
    );
  const isWeather = isDirectWeather || hasWeatherInPanel;

  const isDirectNews =
    canShowComponentOptions && effectiveComponentId === "news";
  const hasNewsInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "news",
    );
  const isNews = isDirectNews || hasNewsInPanel;

  const isDirectAnnouncement =
    canShowComponentOptions && effectiveComponentId === "announcement";
  const hasAnnouncementInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "announcement",
    );
  const isAnnouncement = isDirectAnnouncement || hasAnnouncementInPanel;

  const isDirectBrand =
    canShowComponentOptions && effectiveComponentId === "brand";
  const hasBrandInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "brand",
    );
  const isBrand = isDirectBrand || hasBrandInPanel;

  const isDirectTransport =
    canShowComponentOptions && effectiveComponentId === "transport";
  const hasTransportInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "transport",
    );
  const isTransport = isDirectTransport || hasTransportInPanel;

  const isDirectMedia =
    canShowComponentOptions && effectiveComponentId === "media";
  const hasMediaInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "media",
    );
  const isMedia = isDirectMedia || hasMediaInPanel;

  const isDirectCharts =
    canShowComponentOptions && effectiveComponentId === "charts";
  const hasChartsInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "charts",
    );
  const isCharts = isDirectCharts || hasChartsInPanel;
  
  // Check if panel is full screen (takes up entire grid)
  const isFullScreen = isSingleSelection && selectedCellData && 
    selectedCellData.colSpan === config.columns && 
    selectedCellData.rowSpan === config.rows;
  
  // Check if clock panel is 1/4 or more of the grid
  const isClockQuarterOrMore = isClock && isSingleSelection && selectedCellData && (() => {
    const totalGridSize = config.columns * config.rows;
    const panelArea = (selectedCellData.colSpan ?? 1) * (selectedCellData.rowSpan ?? 1);
    if (totalGridSize === 0) {
      return panelArea >= 4; // At least 4 grid cells
    }
    const fraction = panelArea / totalGridSize;
    return fraction >= 0.25; // 1/4 or more
  })();

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
        Selected component
      </h2>
      {hasSelection && (effectiveComponentId || (selectionCount > 1 && allHaveSameComponent)) ? (
        <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
          <p className="text-xs uppercase tracking-[0.2em] text-custom-color-700/70 dark:text-custom-color-100/70">
            {selectedComponentLabel ?? "Custom component"}
            {!isSingleSelection && allHaveSameComponent && (
              <span className="ml-2 text-[10px] font-normal normal-case opacity-70">
                ({selectionCount} selected)
              </span>
            )}
          </p>
          {selectionCount > 1 && !allHaveSameComponent ? (
            <p className="rounded-full bg-custom-color-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
              {selectionCount} components selected (different types)
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
                value={selectedCellData?.colSpan ?? 1}
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
                value={selectedCellData?.rowSpan ?? 1}
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
                  Show border
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
                  Border color
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
                  disabled={(appearance.borderWidth ?? 2) === 0}
                  className="w-full accent-custom-color-500 dark:accent-custom-color-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {isClock ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Clock options
                  </p>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Show seconds
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.showClockSeconds ?? true}
                      onChange={(event) =>
                        onAppearanceChange({
                          showClockSeconds: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Show date
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.showClockDate ?? false}
                      onChange={(event) =>
                        onAppearanceChange({
                          showClockDate: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                    />
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Time format
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="clock-format"
                          value="24h"
                          checked={(appearance.clockFormat ?? "24h") === "24h"}
                          onChange={() =>
                            onAppearanceChange({ clockFormat: "24h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>24H</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="clock-format"
                          value="12h"
                          checked={appearance.clockFormat === "12h"}
                          onChange={() =>
                            onAppearanceChange({ clockFormat: "12h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>12H</span>
                      </label>
                    </div>
                  </div>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Timezone
                    </span>
                    <select
                      value={appearance.clockTimezone ?? "Europe/Oslo"}
                      onChange={(event) =>
                        onAppearanceChange({
                          clockTimezone: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    >
                      {timezones.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Clock style
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="clock-style"
                          value="digital"
                          checked={(appearance.clockStyle ?? "digital") === "digital"}
                          onChange={() =>
                            onAppearanceChange({ clockStyle: "digital" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>Digital</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="clock-style"
                          value="analog"
                          checked={appearance.clockStyle === "analog"}
                          onChange={() =>
                            onAppearanceChange({ clockStyle: "analog" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>Analog</span>
                      </label>
                    </div>
                  </div>
                  {isClockQuarterOrMore && (
                    <>
                      <label className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                          Show multiple clocks
                        </span>
                        <input
                          type="checkbox"
                          checked={appearance.showMultipleClocks ?? false}
                          onChange={(event) =>
                            onAppearanceChange({
                              showMultipleClocks: event.target.checked,
                              // Set default second timezone if enabling
                              clockTimezone2: event.target.checked && !appearance.clockTimezone2 
                                ? "Europe/London"
                                : appearance.clockTimezone2,
                            })
                          }
                          className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                      </label>
                      {appearance.showMultipleClocks && (
                        <>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                              Second Timezone
                            </span>
                            <select
                              value={appearance.clockTimezone2 ?? "Europe/London"}
                              onChange={(event) =>
                                onAppearanceChange({
                                  clockTimezone2: event.target.value,
                                })
                              }
                              className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                            >
                              {timezones.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                  {tz.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                              Third Timezone
                            </span>
                            <select
                              value={appearance.clockTimezone3 ?? ""}
                              onChange={(event) =>
                                onAppearanceChange({
                                  clockTimezone3: event.target.value || undefined,
                                })
                              }
                              className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                            >
                              <option value="">None</option>
                              {timezones.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                  {tz.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                              Fourth Timezone
                            </span>
                            <select
                              value={appearance.clockTimezone4 ?? ""}
                              onChange={(event) =>
                                onAppearanceChange({
                                  clockTimezone4: event.target.value || undefined,
                                })
                              }
                              className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                            >
                              <option value="">None</option>
                              {timezones.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                  {tz.label}
                                </option>
                              ))}
                            </select>
                          </label>
                        </>
                      )}
                    </>
                  )}
                </div>
              ) : null}

              {isWeather ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Weather options
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Location
                    </span>
                    <select
                      value={appearance.weatherLocation ?? "59.9139,10.7522"}
                      onChange={(event) =>
                        onAppearanceChange({
                          weatherLocation: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    >
                      {weatherLocations.map((loc) => (
                        <option key={loc.value} value={loc.value}>
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Show air quality
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.showAirQuality ?? true}
                      onChange={(event) =>
                        onAppearanceChange({
                          showAirQuality: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Show location forecast
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.showLocationForecast ?? true}
                      onChange={(event) =>
                        onAppearanceChange({
                          showLocationForecast: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                    />
                  </label>
                  {isFullScreen && (
                    <>
                      <label className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                          Show 2 charts
                        </span>
                        <input
                          type="checkbox"
                          checked={appearance.showTwoCharts ?? false}
                          onChange={(event) =>
                            onAppearanceChange({
                              showTwoCharts: event.target.checked,
                              // Set default second location if enabling
                              weatherLocation2: event.target.checked && !appearance.weatherLocation2 
                                ? "60.3913,5.3221" // Default to Bergen
                                : appearance.weatherLocation2,
                            })
                          }
                          className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                      </label>
                      {appearance.showTwoCharts && (
                        <label className="space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                            Second Location
                          </span>
                          <select
                            value={appearance.weatherLocation2 ?? "60.3913,5.3221"}
                            onChange={(event) =>
                              onAppearanceChange({
                                weatherLocation2: event.target.value,
                              })
                            }
                            className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                          >
                            {weatherLocations.map((loc) => (
                              <option key={loc.value} value={loc.value}>
                                {loc.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Time format
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="weather-time-format"
                          value="24h"
                          checked={(appearance.weatherTimeFormat ?? "24h") === "24h"}
                          onChange={() =>
                            onAppearanceChange({ weatherTimeFormat: "24h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>24H</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="weather-time-format"
                          value="12h"
                          checked={appearance.weatherTimeFormat === "12h"}
                          onChange={() =>
                            onAppearanceChange({ weatherTimeFormat: "12h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>12H</span>
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}
              {isNews ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    News options
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      News feed
                    </span>
                    <select
                      value={appearance.newsFeed ?? "nrk_main"}
                      onChange={(event) =>
                        onAppearanceChange({
                          newsFeed: event.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    >
                      <optgroup label="NRK">
                        <option value="nrk_main">NRK Hovedside</option>
                        <option value="nrk_nyheter">NRK Nyheter</option>
                        <option value="nrk_sport">NRK Sport</option>
                        <option value="nrk_kultur">NRK Kultur</option>
                        <option value="nrk_innenriks">NRK Innenriks</option>
                        <option value="nrk_urix">NRK Urix</option>
                      </optgroup>
                      <optgroup label="TV2">
                        <option value="tv2_nyheter">TV2 Nyheter</option>
                        <option value="tv2_sport">TV2 Sport</option>
                        <option value="tv2_innenriks">TV2 Innenriks</option>
                        <option value="tv2_utenriks">TV2 Utenriks</option>
                        <option value="tv2_fotball">TV2 Fotball</option>
                      </optgroup>
                      <optgroup label="Dagens Næringsliv">
                        <option value="dn_main">DN Hovedside</option>
                      </optgroup>
                    </select>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Show source
                    </span>
                    <input
                      type="checkbox"
                      checked={appearance.newsShowSource ?? true}
                      onChange={(event) =>
                        onAppearanceChange({
                          newsShowSource: event.target.checked,
                        })
                      }
                      className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                    />
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>Max items</span>
                      <span>{appearance.newsMaxItems ?? 10}</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={20}
                      step={1}
                      value={appearance.newsMaxItems ?? 10}
                      onChange={(event) =>
                        onAppearanceChange({
                          newsMaxItems: Number(event.target.value),
                        })
                      }
                      className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>Scroll speed</span>
                      <span>{appearance.newsScrollSpeed ?? 50} px/s</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={100}
                      step={10}
                      value={appearance.newsScrollSpeed ?? 50}
                      onChange={(event) =>
                        onAppearanceChange({
                          newsScrollSpeed: Number(event.target.value),
                        })
                      }
                      className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                    />
                  </div>
                </div>
              ) : null}
              {isAnnouncement ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Announcement options
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Announcement text
                    </span>
                    <AnnouncementEditor
                      value={appearance.announcementText ?? ""}
                      onChange={(value) =>
                        onAppearanceChange({
                          announcementText: value,
                        })
                      }
                      placeholder="Enter announcement text..."
                    />
                  </label>
                </div>
              ) : null}
              {isBrand ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Branding options
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Logo URL
                    </span>
                    <input
                      type="url"
                      value={appearance.brandingLogoUrl ?? ""}
                      onChange={(event) =>
                        onAppearanceChange({
                          brandingLogoUrl: event.target.value,
                        })
                      }
                      placeholder="https://example.com/logo.png"
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Branding text
                    </span>
                    <input
                      type="text"
                      value={appearance.brandingText ?? ""}
                      onChange={(event) =>
                        onAppearanceChange({
                          brandingText: event.target.value,
                        })
                      }
                      placeholder="Company name or tagline"
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    />
                  </label>
                </div>
              ) : null}
              {isTransport ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Transport options
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Stop place ID
                    </span>
                    <StopPlaceSelector
                      value={appearance.transportStopPlace ?? "Oslo S"}
                      onChange={(stopPlaceId) =>
                        onAppearanceChange({
                          transportStopPlace: stopPlaceId,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Time format
                    </span>
                    <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="transport-time-format"
                          value="24h"
                          checked={(appearance.transportTimeFormat ?? "24h") === "24h"}
                          onChange={() =>
                            onAppearanceChange({ transportTimeFormat: "24h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>24H</span>
                      </label>
                      <label className="inline-flex items-center gap-1">
                        <input
                          type="radio"
                          name="transport-time-format"
                          value="12h"
                          checked={appearance.transportTimeFormat === "12h"}
                          onChange={() =>
                            onAppearanceChange({ transportTimeFormat: "12h" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>12H</span>
                      </label>
                    </div>
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>Max departures</span>
                      <span>{appearance.transportMaxDepartures ?? 10}</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={appearance.transportMaxDepartures ?? 10}
                      onChange={(event) =>
                        onAppearanceChange({
                          transportMaxDepartures: Number(event.target.value),
                        })
                      }
                      className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                    />
                  </div>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Badge color
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.transportBadgeColor || appearance.textColor || "#ffffff"}
                        onChange={(event) =>
                          onAppearanceChange({
                            transportBadgeColor: event.target.value,
                          })
                        }
                        className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                      />
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                        {(appearance.transportBadgeColor || appearance.textColor || "#ffffff").toUpperCase()}
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Badge border color
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.transportBadgeBorder || appearance.textColor || "#ffffff"}
                        onChange={(event) =>
                          onAppearanceChange({
                            transportBadgeBorder: event.target.value,
                          })
                        }
                        className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                      />
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                        {(appearance.transportBadgeBorder || appearance.textColor || "#ffffff").toUpperCase()}
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Badge text color
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.transportBadgeTextColor || "#000000"}
                        onChange={(event) =>
                          onAppearanceChange({
                            transportBadgeTextColor: event.target.value,
                          })
                        }
                        className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                      />
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                        {(appearance.transportBadgeTextColor || "#000000").toUpperCase()}
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Delay text color
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={appearance.transportDelayColor || "#ef4444"}
                        onChange={(event) =>
                          onAppearanceChange({
                            transportDelayColor: event.target.value,
                          })
                        }
                        className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm"
                      />
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                        {(appearance.transportDelayColor || "#ef4444").toUpperCase()}
                      </span>
                    </div>
                  </label>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>Badge roundedness</span>
                      <span>{appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={appearance.transportBadgeRadius ?? appearance.borderRadius ?? 8}
                      onChange={(event) =>
                        onAppearanceChange({
                          transportBadgeRadius: Number(event.target.value),
                        })
                      }
                      className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                    />
                  </div>
                </div>
              ) : null}
              {isMedia ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Media options
                  </p>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Media type
                    </span>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="media-type"
                          value="image"
                          checked={appearance.mediaType === "image"}
                          onChange={() =>
                            onAppearanceChange({ mediaType: "image" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>Image</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="media-type"
                          value="video"
                          checked={appearance.mediaType === "video"}
                          onChange={() =>
                            onAppearanceChange({ mediaType: "video" })
                          }
                          className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                        <span>Video</span>
                      </label>
                    </div>
                  </div>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      Media URLs
                    </span>
                    <textarea
                      value={appearance.mediaUrls ?? ""}
                      onChange={(event) =>
                        onAppearanceChange({
                          mediaUrls: event.target.value,
                        })
                      }
                      placeholder="https://example.com/image1.jpg https://example.com/image2.jpg"
                      rows={4}
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    />
                    <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                      Enter URLs separated by commas or spaces. One per line also works.
                    </p>
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={appearance.mediaAutoPlay ?? true}
                        onChange={(event) =>
                          onAppearanceChange({
                            mediaAutoPlay: event.target.checked,
                          })
                        }
                        className="h-3.5 w-3.5 border border-custom-color-400 text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                      />
                      <span>Auto-play carousel</span>
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>Transition duration</span>
                      <span>{appearance.mediaTransitionDuration ?? 5}s</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={30}
                      step={1}
                      value={appearance.mediaTransitionDuration ?? 5}
                      onChange={(event) =>
                        onAppearanceChange({
                          mediaTransitionDuration: Number(event.target.value),
                        })
                      }
                      className="w-full accent-custom-color-500 dark:accent-custom-color-300"
                    />
                  </div>
                </div>
              ) : null}
              {isCharts ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    Chart options
                  </p>
                  <ChartsEditor
                    value={appearance.chartsConfig ?? ""}
                    onChange={(value) =>
                      onAppearanceChange({ chartsConfig: value })
                    }
                  />
                </div>
              ) : null}
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

