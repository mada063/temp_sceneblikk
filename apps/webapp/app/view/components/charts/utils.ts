import type { ChartConfig, ChartDataPoint } from "./types";

/**
 * Parse chart configuration from JSON string
 */
export function parseChartConfig(configString: string): ChartConfig | null {
  try {
    if (!configString || !configString.trim()) {
      return null;
    }

    const parsed = JSON.parse(configString);
    
    return {
      type: parsed.type || "LineChart",
      data: parsed.data || [],
      xAxisLabel: parsed.xAxisLabel,
      yAxisLabel: parsed.yAxisLabel,
      title: parsed.title,
    };
  } catch {
    return null;
  }
}

/**
 * Format chart data point
 */
export function formatDataPoint(point: { label: string; value: string | number }): ChartDataPoint {
  return {
    label: String(point.label || ""),
    value: typeof point.value === "number" ? point.value : Number(point.value) || 0,
  };
}


