"use client";

import { useMemo, useState, useEffect } from "react";
import { SolarTiny } from "./SolarTiny";
import { SolarSmall } from "./SolarSmall";
import { SolarMedium } from "./SolarMedium";
import { SolarLarge } from "./SolarLarge";
import { SolarXLarge } from "./SolarXLarge";
import { getSolarTimes } from "./utils";
import type { SolarProps, PanelSize } from "./types";
import type { SolarData } from "./types";

export function Solar({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
}: SolarProps) {
  const {
    solarLocation = "59.9139,10.7522",
    solarTimeFormat = "24h",
    solarShowDayLength = true,
    solarShowSolarNoon = false,
  } = appearance;

  const [solarData, setSolarData] = useState<SolarData | null>(null);

  const [lat, lon] = useMemo(() => {
    const parts = solarLocation.split(",").map(Number);
    return [parts[0] ?? 59.91, parts[1] ?? 10.75];
  }, [solarLocation]);

  useEffect(() => {
    const now = new Date();
    const data = getSolarTimes(lat, lon, now);
    setSolarData(data);
    const interval = setInterval(() => {
      const next = new Date();
      setSolarData(getSolarTimes(lat, lon, next));
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [lat, lon]);

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

  const commonProps = {
    appearance: {
      ...appearance,
      solarTimeFormat,
      solarShowDayLength,
      solarShowSolarNoon,
    },
    solarData,
  };

  switch (panelSize) {
    case "tiny":
      return <SolarTiny {...commonProps} />;
    case "small":
      return <SolarSmall {...commonProps} />;
    case "medium":
      return <SolarMedium {...commonProps} />;
    case "large":
      return <SolarLarge {...commonProps} />;
    case "xlarge":
      return <SolarXLarge {...commonProps} />;
    default:
      return <SolarSmall {...commonProps} />;
  }
}
