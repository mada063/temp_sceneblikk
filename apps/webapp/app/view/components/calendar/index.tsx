"use client";

import { useMemo } from "react";
import { CalendarSmall } from "./CalendarSmall";
import { CalendarMedium } from "./CalendarMedium";
import { CalendarLarge } from "./CalendarLarge";
import { CalendarXLarge } from "./CalendarXLarge";
import { useCalendarEvents } from "./useCalendarEvents";
import { computePanelFraction, usePanelSize } from "../../hooks/usePanelSize";
import type { CalendarProps } from "./types";

export function Calendar({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
  orientation,
}: Omit<CalendarProps, "eventsByDate">) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "calendar");

  const fraction = computePanelFraction(colSpan, rowSpan, totalGridSize);
  const isExpandedMedium =
    Boolean(totalGridSize && totalGridSize > 0) &&
    fraction >= 0.25 &&
    fraction < 0.5;

  const eventMonths = useMemo(() => {
    if (panelSize === "xlarge") {
      const nextMonth = month + 1;
      return [
        { year, month },
        {
          year: nextMonth > 11 ? year + 1 : year,
          month: nextMonth % 12,
        },
      ];
    }
    return [{ year, month }];
  }, [panelSize, year, month]);

  const eventsByDate = useCalendarEvents(appearance, eventMonths);

  const commonProps = {
    appearance,
    eventsByDate,
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
