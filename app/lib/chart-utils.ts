/**
 * Standardized chart sizing utilities for responsive components
 * Can be used by any component that needs to render charts or data visualizations
 */

export type ChartDimensions = {
  width: number;
  height: number;
  graphWidth: number;
  graphHeight: number;
  padding: { top: number; right: number; bottom: number; left: number };
};

export type ChartSizingOptions = {
  dataPointCount: number;
  colSpan: number;
  rowSpan: number;
  containerWidth?: number;
  containerHeight?: number;
  minSpacingHorizontal?: number;
  minSpacingVertical?: number;
  baseHeight?: number;
  padding?: { top?: number; right?: number; bottom?: number; left?: number };
};

/**
 * Determines if a panel is horizontal (wider) or vertical (taller)
 */
export function isHorizontalPanel(colSpan: number, rowSpan: number): boolean {
  // Panel is horizontal if width (colSpan) is greater than or equal to height (rowSpan)
  // Panel is vertical if height (rowSpan) is greater than width (colSpan)
  return colSpan >= rowSpan;
}

/**
 * Calculates optimal chart dimensions based on panel orientation and data points
 * Always fits within container - no scrolling
 */
export function calculateChartDimensions(options: ChartSizingOptions): ChartDimensions {
  const {
    dataPointCount,
    colSpan = 1,
    rowSpan = 1,
    containerWidth = 0,
    containerHeight = 0,
    minSpacingHorizontal = 30,
    minSpacingVertical = 20,
    baseHeight = 300,
    padding = {},
  } = options;

  const isHorizontal = isHorizontalPanel(colSpan, rowSpan);
  
  // Default padding
  const defaultPadding = {
    top: 50,
    right: 20,
    bottom: 50,
    left: 55,
  };
  
  const finalPadding = {
    top: padding.top ?? defaultPadding.top,
    right: padding.right ?? defaultPadding.right,
    bottom: padding.bottom ?? defaultPadding.bottom,
    left: padding.left ?? defaultPadding.left,
  };

  // Always use container width (no scrolling) - fit all data points within available space
  // Calculate spacing based on available width
  let chartWidth: number;
  let actualSpacing: number;
  
  if (containerWidth > 0) {
    chartWidth = containerWidth;
    // Calculate actual spacing based on container width
    // Leave room for padding
    const availableWidth = chartWidth - finalPadding.left - finalPadding.right;
    actualSpacing = dataPointCount > 1 ? availableWidth / (dataPointCount - 1) : availableWidth;
    
    // Ensure minimum spacing is respected
    const minSpacing = isHorizontal ? minSpacingHorizontal : minSpacingVertical;
    if (actualSpacing < minSpacing && dataPointCount > 1) {
      // If spacing is too tight, we still use container width but data will be closer
      // This ensures no scrolling while fitting all points
      actualSpacing = minSpacing;
    }
  } else {
    // Fallback: use minimum required width
    const minSpacing = isHorizontal ? minSpacingHorizontal : minSpacingVertical;
    const minRequiredWidth = dataPointCount * minSpacing;
    chartWidth = Math.max(minRequiredWidth, isHorizontal ? 600 : 400);
    actualSpacing = minSpacing;
  }

  // For vertical panels, use container height to fill the panel better
  // For horizontal panels, use base height
  let chartHeight: number;
  if (isHorizontal) {
    chartHeight = baseHeight;
  } else {
    // Vertical panels: calculate height based on container, but maintain good aspect ratio
    if (containerHeight > 0) {
      // Use most of the container height, leaving minimal space for header
      // For vertical panels, use 85% of available height to make it much larger
      const targetHeight = containerHeight * 0.85;
      // But ensure we maintain a reasonable aspect ratio with the width
      // For vertical panels, we want a taller aspect ratio (height > width)
      const minHeight = baseHeight * 2;
      chartHeight = Math.max(targetHeight, minHeight);
    } else {
      chartHeight = baseHeight * 2.5; // Taller for vertical panels
    }
  }
  
  // Adjust width to maintain better aspect ratio with calculated height
  // For vertical panels, ensure width matches the aspect ratio of the container
  if (!isHorizontal && containerHeight > 0 && containerWidth > 0) {
    // For vertical panels, calculate width based on container aspect ratio
    // This ensures the chart aspect ratio matches the panel aspect ratio
    const containerAspectRatio = containerWidth / containerHeight;
    const idealWidth = chartHeight * containerAspectRatio;
    
    // Only adjust if the ideal width is smaller than current width
    // and we can still fit all data points with minimum spacing
    const minSpacing = minSpacingVertical;
    const minRequiredWidth = dataPointCount > 1 
      ? (dataPointCount - 1) * minSpacing + finalPadding.left + finalPadding.right
      : finalPadding.left + finalPadding.right + 100;
    
    if (idealWidth >= minRequiredWidth && idealWidth < chartWidth) {
      // Use ideal width that matches container aspect ratio
      chartWidth = idealWidth;
      // Recalculate spacing based on new width
      const availableWidth = chartWidth - finalPadding.left - finalPadding.right;
      actualSpacing = dataPointCount > 1 ? availableWidth / (dataPointCount - 1) : availableWidth;
    }
  }

  // Calculate graph dimensions (excluding padding)
  const graphWidth = chartWidth - finalPadding.left - finalPadding.right;
  const graphHeight = chartHeight - finalPadding.top - finalPadding.bottom;

  return {
    width: chartWidth,
    height: chartHeight,
    graphWidth: Math.max(0, graphWidth),
    graphHeight: Math.max(0, graphHeight),
    padding: finalPadding,
  };
}

/**
 * Calculates the X position for a data point in a chart
 */
export function calculateDataPointX(
  index: number,
  totalPoints: number,
  graphWidth: number,
  paddingLeft: number
): number {
  if (totalPoints <= 1) {
    return paddingLeft + graphWidth / 2;
  }
  return paddingLeft + (index / (totalPoints - 1)) * graphWidth;
}

/**
 * Calculates the Y position for a value in a chart
 */
export function calculateDataPointY(
  value: number,
  minValue: number,
  maxValue: number,
  graphHeight: number,
  paddingTop: number
): number {
  const range = maxValue - minValue;
  if (range === 0) {
    return paddingTop + graphHeight / 2;
  }
  const normalizedValue = (value - minValue) / range;
  return paddingTop + (1 - normalizedValue) * graphHeight;
}

