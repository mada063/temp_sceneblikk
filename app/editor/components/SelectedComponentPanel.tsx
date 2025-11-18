"use client";

import type { ChangeEvent } from "react";

import { FiTrash2 } from "react-icons/fi";
import timezones from "../../lib/timezones.json";
import weatherLocations from "../../lib/weather-locations.json";

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

  const isDirectClock =
    isSingleSelection && selectedCellData?.componentId === "clock";
  const hasClockInPanel =
    isFreeformSelected &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "clock",
    );
  const isClock = isDirectClock || hasClockInPanel;

  const isDirectWeather =
    isSingleSelection && selectedCellData?.componentId === "weather";
  const hasWeatherInPanel =
    isFreeformSelected &&
    !!selectedCellData?.panelEntries?.some(
      (entry) => entry.componentId === "weather",
    );
  const isWeather = isDirectWeather || hasWeatherInPanel;
  
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

