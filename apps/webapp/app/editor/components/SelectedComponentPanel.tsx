"use client";

import { useState, useEffect, useRef, type ChangeEvent } from "react";

import { FiTrash2, FiSearch } from "react-icons/fi";
import timezones from "../../lib/timezones.json";
// @ts-ignore - JSON import
import weatherLocations from "../../lib/weather-locations.json";
import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import { searchStopPlaces, findStopPlace } from "../../view/components/transport/utils";
import type { StopPlace } from "../../view/components/transport/types";
import { searchWeatherLocations, findWeatherLocation } from "../../view/components/weather/location-utils";
import type { WeatherLocation } from "../../view/components/weather/types";
import { AnnouncementEditor } from "./AnnouncementEditor";
import { ChartsEditor } from "./ChartsEditor";
import { useI18n } from "../../lib/i18n";

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
  selectedEntryId?: string | null;
  selectedPanelEntries?: Array<{ id: string; componentId: string }>;
};

/**
 * Helper component for searchable stop place selector
 */
function StopPlaceSelector({
  value,
  onChange,
  stopPlaceName,
}: {
  value: string;
  onChange: (stopPlaceId: string) => void;
  stopPlaceName?: string;
}) {
  const { locale } = useI18n();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StopPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(stopPlaceName || null);
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
    
    setCurrentName(stopPlace.name);
    onChange(idToStore);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setIsFocused(false);
  };

  // Update current name when stopPlaceName prop changes
  useEffect(() => {
    if (stopPlaceName) {
      setCurrentName(stopPlaceName);
    }
  }, [stopPlaceName]);

  // Fetch stop place name when value changes (if we don't have a name)
  useEffect(() => {
    if (value && !currentName && !searchQuery) {
      // Try to fetch the name from the ID
      findStopPlace(value)
        .then((stopPlace) => {
          if (stopPlace?.name) {
            setCurrentName(stopPlace.name);
          }
        })
        .catch(() => {
          // Silently fail - we'll just show the ID
        });
    }
  }, [value, currentName, searchQuery]);

  // Track if input is focused to control display behavior
  const [isFocused, setIsFocused] = useState(false);

  // Display value: show search query when typing, otherwise show name/ID
  const displayValue = searchQuery !== "" 
    ? searchQuery 
    : (currentName || value || "");

  // Placeholder: show default placeholder
  const placeholder =
    locale === "nb"
      ? "Søk etter holdeplass eller skriv inn ID (f.eks. 32214)"
      : "Search stop place or enter ID (e.g., 32214)";

  // Check if we should show the value with placeholder opacity (focused but not typing)
  const showPlaceholderStyle = isFocused && !searchQuery && (currentName || value);

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
            setIsFocused(true);
            // Clear search query on focus to allow fresh typing
            setSearchQuery("");
            setShowDropdown(false);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => {
              setShowDropdown(false);
              // Reset search query when blurring if no selection was made
              if (searchQuery && searchQuery !== currentName && searchQuery !== value) {
                setSearchQuery("");
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 pr-10 text-sm font-medium shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 ${
            showPlaceholderStyle 
              ? "text-custom-color-400 dark:text-custom-color-500" 
              : "text-custom-color-800 dark:text-custom-color-50"
          }`}
        />
        <FiSearch className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-custom-color-400 dark:text-custom-color-500" />
      </div>
      
      {showDropdown && (searchResults.length > 0 || isSearching) && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-custom-color-300/50 bg-white shadow-lg dark:border-white/10 dark:bg-custom-color-800">
          {isSearching ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              {locale === "nb" ? "Søker …" : "Searching..."}
            </div>
          ) : searchResults.length === 0 ? (
            <div className="px-4 py-3 text-sm text-custom-color-600 dark:text-custom-color-400">
              {locale === "nb"
                ? "Ingen treff. Du kan også skrive inn en holdeplass-ID direkte (f.eks. 32214)."
                : "No results found. You can enter a stop place ID directly (e.g., 32214)."}
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
                {stopPlace.id && (
                  <div className="text-xs text-custom-color-500 dark:text-custom-color-400">
                    ID: {extractNumericId(stopPlace.id)}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      )}
      
    </div>
  );
}

/**
 * Helper component for searchable weather location selector
 */
function WeatherLocationSelector({
  value,
  onChange,
  locationName,
}: {
  value: string;
  onChange: (locationValue: string) => void;
  locationName?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<WeatherLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentName, setCurrentName] = useState<string | null>(locationName || null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    searchTimeoutRef.current = setTimeout(() => {
      try {
        const results = searchWeatherLocations(searchQuery.trim(), 8);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching weather locations:", error);
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

  const handleSelectLocation = (location: WeatherLocation) => {
    setCurrentName(location.label);
    onChange(location.value);
    setSearchQuery("");
    setSearchResults([]);
    setShowDropdown(false);
    setIsFocused(false);
  };

  // Update current name when locationName prop changes
  useEffect(() => {
    if (locationName) {
      setCurrentName(locationName);
    }
  }, [locationName]);

  // Fetch location name when value changes (if we don't have a name)
  useEffect(() => {
    if (value && !currentName && !searchQuery) {
      const location = findWeatherLocation(value);
      if (location?.label) {
        setCurrentName(location.label);
      }
    }
  }, [value, currentName, searchQuery]);

  // Track if input is focused to control display behavior
  const [isFocused, setIsFocused] = useState(false);

  // Display value: show search query when typing, otherwise show name/coordinates
  const displayValue = searchQuery !== "" 
    ? searchQuery 
    : (currentName || value || "");

  // Placeholder: show default placeholder when not focused, or when focused and no current value
  const placeholder = "Search location (e.g., Bergen, Stavanger, Vestland)";

  // Check if we should show the value with placeholder opacity (focused but not typing)
  const showPlaceholderStyle = isFocused && !searchQuery && (currentName || value);

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
          }}
          onFocus={() => {
            setIsFocused(true);
            // Clear search query on focus to allow fresh typing
            setSearchQuery("");
            setShowDropdown(false);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => {
              setShowDropdown(false);
              // Reset search query when blurring if no selection was made
              if (searchQuery && searchQuery !== currentName) {
                setSearchQuery("");
              }
            }, 200);
          }}
          placeholder={placeholder}
          className={`w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 pr-10 text-sm font-medium shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 ${
            showPlaceholderStyle 
              ? "text-custom-color-400 dark:text-custom-color-500" 
              : "text-custom-color-800 dark:text-custom-color-50"
          }`}
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
              No results found. Try searching by city, municipality, or county name.
            </div>
          ) : (
            searchResults.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => handleSelectLocation(location)}
                className="w-full px-4 py-2 text-left text-sm text-custom-color-800 hover:bg-custom-color-100 dark:text-custom-color-50 dark:hover:bg-custom-color-700"
              >
                <div className="font-medium">{location.label}</div>
                {location.county && (
                  <div className="text-xs text-custom-color-500 dark:text-custom-color-400">
                    {location.county}{location.municipality && location.municipality !== location.name ? `, ${location.municipality}` : ""}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
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
  selectedEntryId,
  selectedPanelEntries,
}: SelectedComponentPanelProps) {
  const { t, locale } = useI18n();
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

  // Track the previous background color to restore when toggling transparent off
  const previousBackgroundColorRef = useRef<string>(
    appearance.backgroundColor && appearance.backgroundColor !== "transparent" 
      ? appearance.backgroundColor 
      : "#2563eb"
  );
  
  // Update the ref whenever backgroundColor changes and is not transparent
  useEffect(() => {
    if (appearance.backgroundColor && appearance.backgroundColor !== "transparent") {
      previousBackgroundColorRef.current = appearance.backgroundColor;
    }
  }, [appearance.backgroundColor]);

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

  const isDirectCalendar =
    canShowComponentOptions && effectiveComponentId === "calendar";
  const hasCalendarInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "calendar",
    );
  const isCalendar = isDirectCalendar || hasCalendarInPanel;

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

  const isDirectTasks =
    canShowComponentOptions && effectiveComponentId === "tasks";
  const hasTasksInPanel =
    (isFreeformSelected || (componentId === "freeform-region" && allHaveSameComponent)) &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "tasks",
    );
  const isTasks = isDirectTasks || hasTasksInPanel;
  
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

  // Check if transport panel is medium or large (for dual stop feature)
  // Allow dual stops for medium panels (>= 0.25 of grid or >= 3 cells)
  const isTransportMediumOrLarge = isTransport && isSingleSelection && selectedCellData && (() => {
    const cols = selectedCellData.colSpan ?? 1;
    const rows = selectedCellData.rowSpan ?? 1;
    const panelArea = cols * rows;
    const totalGridSize = config.columns * config.rows;
    
    if (!totalGridSize || totalGridSize === 0) {
      return panelArea >= 3; // At least 3 grid cells
    }
    
    const fraction = panelArea / totalGridSize;
    // Medium or large: >= 0.25 (1/4) of grid
    return fraction >= 0.25;
  })();

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <h2 className="text-lg font-semibold text-custom-color-800 dark:text-custom-color-100">
        {t("editor", "selectedComponentTitle")}
      </h2>
      {hasSelection && (effectiveComponentId || (selectionCount > 1 && allHaveSameComponent)) ? (
        <div className="mt-4 space-y-4 text-sm text-custom-color-900 dark:text-custom-color-50">
          <p className="text-xs uppercase tracking-[0.2em] text-custom-color-700/70 dark:text-custom-color-100/70">
            {selectedComponentLabel ?? t("editor", "selectedComponentDefaultLabel")}
            {!isSingleSelection && allHaveSameComponent && (
              <span className="ml-2 text-[10px] font-normal normal-case opacity-70">
                ({selectionCount} {t("editor", "selectedComponentMultipleSuffix")})
              </span>
            )}
          </p>
          {selectionCount > 1 && !allHaveSameComponent ? (
            <p className="rounded-full bg-custom-color-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
              {selectionCount} {t("editor", "selectedComponentDifferentTypes")}
            </p>
          ) : null}
          {isFreeformSelected ? (
            <>
              <p className="text-xs text-custom-color-600/80 dark:text-custom-color-100/60">
                {t("editor", "freeformHint")}
              </p>
              {selectedEntryId && selectedPanelEntries && (() => {
                const entry = selectedPanelEntries.find(e => e.id === selectedEntryId);
                const entryIndex = selectedPanelEntries.findIndex(e => e.id === selectedEntryId);
                if (entry) {
                  const definition = PLACEHOLDER_MAP[entry.componentId];
                  const label =
                    definition && locale === "nb" && definition.labelNb
                      ? definition.labelNb
                      : definition?.label ?? entry.componentId;
                  return (
                    <p className="rounded-full bg-custom-color-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:bg-custom-color-200/10 dark:text-custom-color-100/80">
                      Editing entry #{entryIndex + 1}: {label} (individual settings)
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
          <div className="rounded-2xl border border-custom-color-300/30 bg-white/70 p-4 text-xs uppercase tracking-[0.16em] text-custom-color-600 dark:border-white/10 dark:bg-custom-color-800/70 dark:text-custom-color-200">
            <p className="text-[11px] font-semibold">
              {t("editor", "appearanceSectionTitle")}
            </p>
            <div className="mt-3 space-y-3 text-[11px] normal-case tracking-normal text-custom-color-700 dark:text-custom-color-100">
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  {t("editor", "appearanceBackgroundColorLabel")}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={appearance.backgroundColor === "transparent" ? "#000000" : appearance.backgroundColor}
                    onChange={(event) =>
                      onAppearanceChange({ backgroundColor: event.target.value })
                    }
                    disabled={appearance.backgroundColor === "transparent"}
                    className="h-9 w-9 cursor-pointer rounded-md border border-black/10 bg-transparent p-0 shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                    {appearance.backgroundColor === "transparent"
                      ? "TRANSPARENT"
                      : appearance.backgroundColor?.toUpperCase?.() ?? ""}
                  </span>
                </div>
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  {t("editor", "appearanceTransparentBackgroundLabel")}
                </span>
                <input
                  type="checkbox"
                  checked={appearance.backgroundColor === "transparent"}
                  onChange={(event) => {
                    if (event.target.checked) {
                      // Save current color before switching to transparent
                      if (appearance.backgroundColor && appearance.backgroundColor !== "transparent") {
                        previousBackgroundColorRef.current = appearance.backgroundColor;
                      }
                      onAppearanceChange({ backgroundColor: "transparent" });
                    } else {
                      // Restore to previous color when unchecking
                      onAppearanceChange({ backgroundColor: previousBackgroundColorRef.current });
                    }
                  }}
                  className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                />
              </label>
              <label className="flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                  {t("editor", "appearanceShowBorderLabel")}
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
                  {t("editor", "appearanceBorderColorLabel")}
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
                  {t("editor", "appearanceTextColorLabel")}
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
                  <span>{t("editor", "appearanceRoundedCornersLabel")}</span>
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
                  <span>{t("editor", "appearanceBorderThicknessLabel")}</span>
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
                    {t("editor", "clockOptionsTitle")}
                  </p>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "clockShowSecondsLabel")}
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
                      {t("editor", "clockShowDateLabel")}
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
                      {t("editor", "timeFormatLabel")}
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
                      {t("editor", "clockTimezoneLabel")}
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
                      {t("editor", "clockStyleLabel")}
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
                        <span>{t("editor", "clockStyleDigitalLabel")}</span>
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
                        <span>{t("editor", "clockStyleAnalogLabel")}</span>
                      </label>
                    </div>
                  </div>
                  {isClockQuarterOrMore && (
                    <>
                      <label className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                          {t("editor", "clockShowMultipleClocksLabel")}
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
                              {t("editor", "clockSecondTimezoneLabel")}
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
                              {t("editor", "clockThirdTimezoneLabel")}
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
                              <option value="">{t("editor", "noneOptionLabel")}</option>
                              {timezones.map((tz) => (
                                <option key={tz.value} value={tz.value}>
                                  {tz.label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="space-y-1">
                            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                              {t("editor", "clockFourthTimezoneLabel")}
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
                              <option value="">{t("editor", "noneOptionLabel")}</option>
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
                    {t("editor", "weatherOptionsTitle")}
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "weatherLocationLabel")}
                    </span>
                    <WeatherLocationSelector
                      value={appearance.weatherLocation ?? "59.9139,10.7522"}
                      onChange={(locationValue) =>
                        onAppearanceChange({
                          weatherLocation: locationValue,
                        })
                      }
                      locationName={(() => {
                        const loc = (weatherLocations as Array<{ value: string; label: string }>).find(
                          (l) => l.value === (appearance.weatherLocation ?? "59.9139,10.7522")
                        );
                        return loc?.label;
                      })()}
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "weatherShowAirQualityLabel")}
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
                      {t("editor", "weatherShowLocationForecastLabel")}
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
                          {t("editor", "weatherShowTwoChartsLabel")}
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
                            {t("editor", "weatherSecondLocationLabel")}
                          </span>
                          <WeatherLocationSelector
                            value={appearance.weatherLocation2 ?? "60.3913,5.3221"}
                            onChange={(locationValue) =>
                              onAppearanceChange({
                                weatherLocation2: locationValue,
                              })
                            }
                            locationName={(() => {
                              const loc = (weatherLocations as Array<{ value: string; label: string }>).find(
                                (l) => l.value === (appearance.weatherLocation2 ?? "60.3913,5.3221")
                              );
                              return loc?.label;
                            })()}
                          />
                        </label>
                      )}
                    </>
                  )}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "timeFormatLabel")}
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
                    {t("editor", "newsOptionsTitle")}
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "newsFeedLabel")}
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
                      {t("editor", "newsShowSourceLabel")}
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
                      <span>{t("editor", "newsMaxItemsLabel")}</span>
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
                      <span>{t("editor", "newsScrollSpeedLabel")}</span>
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
                    {t("editor", "announcementOptionsTitle")}
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "announcementTextLabel")}
                    </span>
                    <AnnouncementEditor
                      value={appearance.announcementText ?? ""}
                      onChange={(value) =>
                        onAppearanceChange({
                          announcementText: value,
                        })
                      }
                      placeholder={t("editor", "announcementPlaceholder")}
                    />
                  </label>
                </div>
              ) : null}
              {isBrand ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    {t("editor", "brandOptionsTitle")}
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "brandLogoUrlLabel")}
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
                      {t("editor", "brandTextLabel")}
                    </span>
                    <input
                      type="text"
                      value={appearance.brandingText ?? ""}
                      onChange={(event) =>
                        onAppearanceChange({
                          brandingText: event.target.value,
                        })
                      }
                      placeholder={t("editor", "brandTextPlaceholder")}
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    />
                  </label>
                </div>
              ) : null}
              {isCalendar ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    {t("editor", "calendarOptionsTitle")}
                  </p>
                  <div className="space-y-2">
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/google/oauth/url");
                            if (!response.ok) return;
                            const data = await response.json();
                            if (data?.url) {
                              window.location.href = data.url as string;
                            }
                          } catch {
                            // Silently ignore errors – user can retry
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-custom-color-400 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
                      >
                        {t("editor", "calendarConnectGoogleButton")}
                      </button>
                    )}
                    <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                      {t("editor", "calendarConnectGoogleHelp")}
                    </p>
                  </div>
                  {appearance.calendarProvider === "google" && (
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                      <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                        {t("editor", "calendarIdHelp")}
                      </p>
                    </label>
                  )}
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
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
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
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
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
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
                      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-custom-color-500 dark:text-custom-color-100/80">
                        {(
                          appearance.calendarTodayHighlight ||
                          appearance.borderColor ||
                          "#ffffff"
                        ).toUpperCase()}
                      </span>
                    </div>
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                    <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                      {t("editor", "calendarEventColorsHelp")}
                    </p>
                  </label>
                </div>
              ) : null}
              {isTransport ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    {t("editor", "transportOptionsTitle")}
                  </p>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "transportStopPlaceLabel")}
                    </span>
                    <StopPlaceSelector
                      value={appearance.transportStopPlace ?? "62356"}
                      onChange={(stopPlaceId) =>
                        onAppearanceChange({
                          transportStopPlace: stopPlaceId,
                        })
                      }
                    />
                  </label>
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "transportTimeFormatLabel")}
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
                      <span>{t("editor", "transportMaxDeparturesLabel")}</span>
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
                  {isTransportMediumOrLarge && (
                    <>
                      <label className="flex items-center justify-between gap-3">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                          {t("editor", "transportShowDualStopsLabel")}
                        </span>
                        <input
                          type="checkbox"
                          checked={appearance.transportShowDualStops ?? false}
                          onChange={(event) =>
                            onAppearanceChange({
                              transportShowDualStops: event.target.checked,
                              // Set default second stop place if enabling
                              transportStopPlace2: event.target.checked && !appearance.transportStopPlace2 
                                ? "32214" // Default to a common stop (e.g., Oslo S)
                                : appearance.transportStopPlace2,
                            })
                          }
                          className="h-4 w-4 rounded border border-custom-color-400 bg-white text-custom-color-500 focus:ring-custom-color-500 dark:border-white/40 dark:bg-custom-color-900"
                        />
                      </label>
                      {appearance.transportShowDualStops && (
                        <label className="space-y-1">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                            {t("editor", "transportSecondStopPlaceLabel")}
                          </span>
                          <StopPlaceSelector
                            value={appearance.transportStopPlace2 ?? ""}
                            onChange={(stopPlaceId) =>
                              onAppearanceChange({
                                transportStopPlace2: stopPlaceId,
                              })
                            }
                          />
                        </label>
                      )}
                    </>
                  )}
                  <label className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "transportBadgeColorLabel")}
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
                      {t("editor", "transportBadgeBorderColorLabel")}
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
                      {t("editor", "transportBadgeTextColorLabel")}
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
                      {t("editor", "transportDelayTextColorLabel")}
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
                      <span>{t("editor", "transportBadgeRoundednessLabel")}</span>
                      <span>{appearance.transportBadgeRadius ?? appearance.borderRadius ?? 10}px</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={30}
                      step={1}
                      value={appearance.transportBadgeRadius ?? appearance.borderRadius ?? 10}
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
                    {t("editor", "mediaOptionsTitle")}
                  </p>
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "mediaTypeLabel")}
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
                        <span>{t("editor", "mediaTypeImageLabel")}</span>
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
                        <span>{t("editor", "mediaTypeVideoLabel")}</span>
                      </label>
                    </div>
                  </div>
                  <label className="space-y-1">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      {t("editor", "mediaUrlsLabel")}
                    </span>
                    <textarea
                      value={appearance.mediaUrls ?? ""}
                      onChange={(event) =>
                        onAppearanceChange({
                          mediaUrls: event.target.value,
                        })
                      }
                      placeholder={t("editor", "mediaUrlsPlaceholder")}
                      rows={4}
                      className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-3 py-2 text-sm font-medium text-custom-color-800 shadow-sm focus:border-custom-color-500 focus:outline-none dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                    />
                    <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                      {t("editor", "mediaUrlsHelp")}
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
                      <span>{t("editor", "mediaAutoPlayLabel")}</span>
                    </label>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                      <span>{t("editor", "mediaTransitionDurationLabel")}</span>
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
                    {t("editor", "chartsOptionsTitle")}
                  </p>
                  <ChartsEditor
                    value={appearance.chartsConfig ?? ""}
                    onChange={(value) =>
                      onAppearanceChange({ chartsConfig: value })
                    }
                  />
                </div>
              ) : null}
              {isTasks ? (
                <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[11px]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
                    {t("editor", "tasksOptionsTitle")}
                  </p>
                  <div className="space-y-2">
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const response = await fetch("/api/google/oauth/url");
                            if (!response.ok) return;
                            const data = await response.json();
                            if (data?.url) {
                              window.location.href = data.url as string;
                            }
                          } catch {
                            // Ignore – user can retry
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-full border border-custom-color-400 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 transition hover:bg-custom-color-200/40 dark:border-custom-color-300/40 dark:text-custom-color-100 dark:hover:bg-custom-color-700/50"
                      >
                        {t("editor", "tasksConnectGoogleButton")}
                      </button>
                    )}
                    <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                      {t("editor", "tasksConnectGoogleHelp")}
                    </p>
                  </div>
                  {appearance.tasksProvider === "google" && (
                    <label className="space-y-1">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
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
                      <p className="text-[10px] text-custom-color-500 dark:text-custom-color-400">
                        {t("editor", "tasksListIdHelp")}
                      </p>
                    </label>
                  )}
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

