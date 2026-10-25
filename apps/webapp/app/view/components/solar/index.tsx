"use client";

import { useMemo, useState, useEffect } from "react";
import { SolarTiny } from "./SolarTiny";
import { SolarSmall } from "./SolarSmall";
import { SolarMedium } from "./SolarMedium";
import { SolarLarge } from "./SolarLarge";
import { SolarXLarge } from "./SolarXLarge";
import { getSolarTimes } from "./utils";
import { usePanelSize } from "../../hooks/usePanelSize";
import type { SolarProps } from "./types";
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

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");

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
