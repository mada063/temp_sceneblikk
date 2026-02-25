"use client";

import { useMemo, useState, useEffect } from "react";
import { GarbageTiny } from "./GarbageTiny";
import { GarbageSmall } from "./GarbageSmall";
import { GarbageMedium } from "./GarbageMedium";
import { GarbageLarge } from "./GarbageLarge";
import { GarbageXLarge } from "./GarbageXLarge";
import { getNextPickups, getNextPickupsFromEntries } from "./utils";
import type { GarbageProps, PanelSize } from "./types";
import type { GarbagePickup } from "./types";

const DEFAULT_SCHEDULE = "Restavfall:2024-01-03:1\nMatavfall:2024-01-05:2\nPapir og plast:2024-01-10:4\nGlass og metall:2024-01-15:10";

export function Garbage({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
}: GarbageProps) {
  const entries = appearance.garbageEntries;
  const schedule = appearance.garbageSchedule || DEFAULT_SCHEDULE;

  const [pickups, setPickups] = useState<GarbagePickup[]>([]);

  useEffect(() => {
    const next = entries?.length
      ? getNextPickupsFromEntries(entries, new Date(), 10)
      : getNextPickups(schedule, new Date(), 10);
    setPickups(next);
    const interval = setInterval(() => {
      const n = entries?.length
        ? getNextPickupsFromEntries(entries, new Date(), 10)
        : getNextPickups(schedule, new Date(), 10);
      setPickups(n);
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [appearance.garbageEntries, appearance.garbageSchedule]);

  const panelSize = useMemo((): PanelSize => {
    const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
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

  const commonProps = { appearance, pickups };

  switch (panelSize) {
    case "tiny":
      return <GarbageTiny {...commonProps} />;
    case "small":
      return <GarbageSmall {...commonProps} />;
    case "medium":
      return <GarbageMedium {...commonProps} />;
    case "large":
      return <GarbageLarge {...commonProps} />;
    case "xlarge":
      return <GarbageXLarge {...commonProps} />;
    default:
      return <GarbageSmall {...commonProps} />;
  }
}
