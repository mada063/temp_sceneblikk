import { useMemo } from "react";

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type PanelSizeStrategy = "standard" | "calendar" | "news";

export type PanelDimensions = {
  cols: number;
  rows: number;
  panelArea: number;
  fraction: number;
  isTall: boolean;
  isVeryTall: boolean;
  isWide: boolean;
};

export function getPanelDimensions(
  colSpan = 1,
  rowSpan = 1,
  totalGridSize = 0,
): PanelDimensions {
  const cols = colSpan ?? 1;
  const rows = rowSpan ?? 1;
  const panelArea = cols * rows;
  const fraction =
    totalGridSize && totalGridSize > 0 ? panelArea / totalGridSize : 0;

  return {
    cols,
    rows,
    panelArea,
    fraction,
    isTall: rows > cols * 1.5,
    isVeryTall: rows > cols * 2,
    isWide: cols > rows * 1.5,
  };
}

export function computePanelSize(
  colSpan = 1,
  rowSpan = 1,
  totalGridSize = 0,
  strategy: PanelSizeStrategy = "standard",
): PanelSize {
  const { cols, rows, panelArea, fraction, isTall, isVeryTall } =
    getPanelDimensions(colSpan, rowSpan, totalGridSize);

  if (!totalGridSize || totalGridSize === 0) {
    if (panelArea <= 1) return "tiny";
    if (panelArea <= 2) return "small";
    if (panelArea <= 6) {
      if (strategy === "news") {
        if (isVeryTall && cols === 1) return "small";
        if (isTall && rows >= 4 && cols <= 2) return "large";
      }
      return "medium";
    }
    if (panelArea <= 12) return "large";
    return "xlarge";
  }

  if (strategy === "calendar") {
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }

  if (strategy === "news") {
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.4 && isVeryTall && cols === 1) return "small";
    if (fraction < 0.5) {
      if (isVeryTall && rows >= 4) return "large";
      if (isTall && rows >= 5 && cols <= 2) return "large";
      return "medium";
    }
    if (fraction < 0.75) return "large";
    return "xlarge";
  }

  if (fraction < 0.125) return "tiny";
  if (fraction < 0.25) return "small";
  if (fraction < 0.5) return "medium";
  if (fraction < 0.75) return "large";
  return "xlarge";
}

export function computePanelFraction(
  colSpan = 1,
  rowSpan = 1,
  totalGridSize = 0,
): number {
  return getPanelDimensions(colSpan, rowSpan, totalGridSize).fraction;
}

export function usePanelSize(
  colSpan = 1,
  rowSpan = 1,
  totalGridSize = 0,
  strategy: PanelSizeStrategy = "standard",
): PanelSize {
  return useMemo(
    () => computePanelSize(colSpan, rowSpan, totalGridSize, strategy),
    [colSpan, rowSpan, totalGridSize, strategy],
  );
}

export function usePanelDimensions(
  colSpan = 1,
  rowSpan = 1,
  totalGridSize = 0,
) {
  return useMemo(
    () => getPanelDimensions(colSpan, rowSpan, totalGridSize),
    [colSpan, rowSpan, totalGridSize],
  );
}
