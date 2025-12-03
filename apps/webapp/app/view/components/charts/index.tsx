"use client";

import { useMemo } from "react";
import { ChartsTiny } from "./ChartsTiny";
import { ChartsSmall } from "./ChartsSmall";
import { ChartsMedium } from "./ChartsMedium";
import { ChartsLarge } from "./ChartsLarge";
import { ChartsXLarge } from "./ChartsXLarge";
import type { ChartsProps, PanelSize } from "./types";
import { parseChartConfig } from "./utils";

export function Charts({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
  orientation,
}: ChartsProps) {
  const {
    chartsConfig = "",
  } = appearance;

  // Parse chart configuration
  const chartConfig = useMemo(() => {
    if (chartsConfig) {
      return parseChartConfig(chartsConfig);
    }
    return null;
  }, [chartsConfig]);

  // Calculate panel size for responsive display
  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    
    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    const fraction = panelArea / totalGridSize;
    
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  // In portrait orientation the screen is taller, so we can use a richer layout
  // by stepping each logical size up one level (S → M, M → L, L → XL, etc.).
  const effectivePanelSize: PanelSize = (() => {
    if (orientation !== "portrait") return panelSize;
    switch (panelSize) {
      case "tiny":
        return "small";
      case "small":
        return "medium";
      case "medium":
        return "large";
      case "xlarge":
        return "xlarge";
      case "large":
      default:
        return panelSize;
    }
  })();

  const commonProps = {
    appearance,
    chartConfig,
    panelSize: effectivePanelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  switch (effectivePanelSize) {
    case "tiny":
      return <ChartsTiny {...commonProps} />;
    case "small":
      return <ChartsSmall {...commonProps} />;
    case "medium":
      return <ChartsMedium {...commonProps} />;
    case "large":
      return <ChartsLarge {...commonProps} />;
    case "xlarge":
      return <ChartsXLarge {...commonProps} />;
    default:
      return <ChartsSmall {...commonProps} />;
  }
}


