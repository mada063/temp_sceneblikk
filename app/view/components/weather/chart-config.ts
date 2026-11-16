import { isHorizontalPanel } from "../../../lib/chart-utils";
import type { ForecastItem } from "./utils";

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type HoursToShowOptions = {
  panelSize: PanelSize;
  colSpan: number;
  rowSpan: number;
  totalGridSize?: number;
  showTwoCharts?: boolean;
  isFullScreen?: boolean;
};

/**
 * Calculates the number of forecast hours to display based on panel configuration
 */
export function calculateHoursToShow(options: HoursToShowOptions): number {
  const { panelSize, colSpan, rowSpan, totalGridSize, showTwoCharts, isFullScreen } = options;

  // Dual charts always get 48 hours
  if (showTwoCharts && isFullScreen) {
    return 48;
  }

  switch (panelSize) {
    case "medium":
      return 5;
    case "large": {
      // More than 50% (2/4) horizontal panels should show 24 hours
      // 50% or less horizontal panels can show 48 hours
      const panelArea = colSpan * rowSpan;
      const fraction = totalGridSize && totalGridSize > 0 ? panelArea / totalGridSize : 0;
      const isHorizontal = colSpan >= rowSpan;

      if (fraction > 0.5 && isHorizontal) {
        return 24; // More than 50% horizontal panels get 24 hours
      } else if (fraction <= 0.5 && isHorizontal) {
        return 48; // 50% or less horizontal panels get 48 hours
      } else {
        return 24; // Regular large panels (vertical) get 24 hours
      }
    }
    case "xlarge":
      return 48; // xlarge always gets 48 hours
    default:
      return 0; // tiny and small don't show charts
  }
}

export type TemperatureRangeOptions = {
  forecastData: ForecastItem[];
  colSpan: number;
  rowSpan: number;
  panelSize: PanelSize;
};

export type TemperatureRange = {
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  /** Min/max from forecast data (not axis padding). */
  dataMinTemp: number;
  dataMaxTemp: number;
  yAxisTemps: number[];
};

/**
 * Calculates the temperature range and Y-axis values for the chart
 */
export function calculateTemperatureRange(
  options: TemperatureRangeOptions
): TemperatureRange {
  const { forecastData, colSpan, rowSpan, panelSize } = options;

  const temps = forecastData.map((d) => d.temperature);
  const avgTemp = temps.reduce((sum, t) => sum + t, 0) / temps.length;
  const actualMin = Math.min(...temps);
  const actualMax = Math.max(...temps);

  // Determine temperature offset based on panel size and orientation
  let tempOffset: number;
  if (panelSize === "xlarge") {
    tempOffset = 10; // xLarge always uses +/- 10 degrees
  } else {
    const isHorizontal = isHorizontalPanel(colSpan, rowSpan);
    tempOffset = isHorizontal ? 5 : 10; // +/- 5 for horizontal, +/- 10 for vertical
  }

  // Calculate differences from average first
  const minDiffFromAvg = Math.abs(actualMin - avgTemp);
  const maxDiffFromAvg = Math.abs(actualMax - avgTemp);
  
  // If highest or lowest temperature is more than or equal to ±5 from average, add +2 degrees padding
  // Otherwise use the standard tempOffset
  let minTemp: number;
  let maxTemp: number;
  
  // Check if we need padding: when actual temperature is >= average + 5 or <= average - 5
  // Use rounded average to avoid floating point precision issues
  const roundedAvg = Math.round(avgTemp);
  const needsMinPadding = actualMin <= roundedAvg - 5;
  const needsMaxPadding = actualMax >= roundedAvg + 5;
  
  if (needsMinPadding) {
    minTemp = Math.floor(actualMin) - 2;
  } else {
    minTemp = Math.round(avgTemp - tempOffset);
    // Still expand if actual data is below the offset range
    if (actualMin < minTemp) {
      minTemp = Math.floor(actualMin);
    }
  }
  
  if (needsMaxPadding) {
    maxTemp = Math.ceil(actualMax) + 2;
  } else {
    maxTemp = Math.round(avgTemp + tempOffset);
    // Still expand if actual data is above the offset range
    if (actualMax > maxTemp) {
      maxTemp = Math.ceil(actualMax);
    }
  }

  // Ensure minimum range (tempOffset * 2)
  const tempRange = Math.max(tempOffset * 2, maxTemp - minTemp);

  // Generate Y-axis temperature values
  const yAxisTemps: number[] = [];
  for (let temp = minTemp; temp <= maxTemp; temp++) {
    yAxisTemps.push(temp);
  }

  return {
    minTemp,
    maxTemp,
    avgTemp,
    dataMinTemp: actualMin,
    dataMaxTemp: actualMax,
    yAxisTemps,
  };
}

