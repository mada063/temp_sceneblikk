"use client";

import { useMemo } from "react";
import { CalendarSmall } from "./CalendarSmall";
import { CalendarMedium } from "./CalendarMedium";
import { CalendarLarge } from "./CalendarLarge";
import { CalendarXLarge } from "./CalendarXLarge";
import type { CalendarProps, PanelSize } from "./types";

export function Calendar({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
  orientation,
}: CalendarProps) {
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

    if (fraction < 0.25) return "small"; // Tiny/small use day view
    if (fraction < 0.5) return "medium"; // Medium starts at 1/4 (0.25) and goes to 1/2
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  // Calculate if medium should use expanded mode (between 1/4 and 1/2)
  const isExpandedMedium = useMemo(() => {
    if (!totalGridSize || totalGridSize === 0) return false;
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    const fraction = panelArea / totalGridSize;
    return fraction >= 0.25 && fraction < 0.5;
  }, [colSpan, rowSpan, totalGridSize]);

  const commonProps = {
    appearance,
    colSpan,
    rowSpan,
    totalGridSize,
    orientation,
  };

  switch (panelSize) {
    case "tiny":
    case "small":
      return <CalendarSmall {...commonProps} />;
    case "medium":
      return <CalendarMedium {...commonProps} isExpanded={isExpandedMedium} />;
    case "large":
      return <CalendarLarge {...commonProps} />;
    case "xlarge":
      return <CalendarXLarge {...commonProps} />;
    default:
      return <CalendarMedium {...commonProps} isExpanded={isExpandedMedium} />;
  }
}
