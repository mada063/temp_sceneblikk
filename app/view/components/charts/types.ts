import type { CellAppearance, Orientation } from "../../../lib/layout-types";

export type ChartsProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
  orientation?: Orientation;
};

export type ChartDataPoint = {
  label: string;
  value: number;
};

export type ChartConfig = {
  type: string; // Chart type from dallastek-ui (e.g., "LineChart", "BarChart", "DoughnutChart", "RadarChart")
  data: ChartDataPoint[]; // Array of data points
  xAxisLabel?: string;
  yAxisLabel?: string;
  title?: string;
  // BarChart colors
  barColor?: string;
  barMaxColor?: string;
  barMinColor?: string;
  averageLineColor?: string;
  axisColor?: string;
  gridColor?: string;
  labelColor?: string;
  labelSecondaryColor?: string;
  // LineChart colors
  seriesColors?: string[];
  showAverage?: boolean;
  showDots?: boolean;
  showArea?: boolean;
  lineType?: 'linear' | 'curved' | 'step';
  // DoughnutChart colors
  segmentOutlineColor?: string;
  centerTextColor?: string;
  centerValueColor?: string;
  centerPercentageColor?: string;
  tooltipBackgroundColor?: string;
  tooltipBorderColor?: string;
  tooltipTextColor?: string;
  gapDegrees?: number;
  // RadarChart colors
  centerTextColorRadar?: string;
  tooltipBackgroundColorRadar?: string;
  tooltipBorderColorRadar?: string;
  tooltipTextColorRadar?: string;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

