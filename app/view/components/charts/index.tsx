"use client";

import { useMemo } from "react";
import { ChartsTiny } from "./ChartsTiny";
import { ChartsSmall } from "./ChartsSmall";
import { ChartsMedium } from "./ChartsMedium";
import { ChartsLarge } from "./ChartsLarge";
import { ChartsXLarge } from "./ChartsXLarge";
import { usePanelSize, type PanelSize } from "../../hooks/usePanelSize";
import type { ChartsProps } from "./types";
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

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");

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


