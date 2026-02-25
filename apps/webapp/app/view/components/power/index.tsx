"use client";

import { useMemo, useState, useEffect } from "react";
import { PowerTiny } from "./PowerTiny";
import { PowerSmall } from "./PowerSmall";
import { PowerMedium } from "./PowerMedium";
import { PowerLarge } from "./PowerLarge";
import { PowerXLarge } from "./PowerXLarge";
import { fetchPowerPrices, getCurrentHourIndex } from "./utils";
import type { PowerProps, PanelSize, PowerAreaId } from "./types";
import type { PowerData } from "./types";

export function Power({
  appearance,
  colSpan = 1,
  rowSpan = 1,
  totalGridSize,
}: PowerProps) {
  const {
    powerArea = "NO1",
    powerTimeFormat = "24h",
    powerShowDayChart = true,
  } = appearance;

  const [powerData, setPowerData] = useState<PowerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const now = new Date();
        const prices = await fetchPowerPrices(now, powerArea as PowerAreaId);
        if (cancelled) return;
        const currentIndex = getCurrentHourIndex(prices);
        const date = now.toISOString().slice(0, 10);
        setPowerData({
          prices,
          area: powerArea,
          currentIndex,
          date,
        });
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Kunne ikke hente strømpriser");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    const interval = setInterval(load, 60 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [powerArea]);

  // Update current index every minute without refetch
  useEffect(() => {
    if (!powerData) return;
    const t = setInterval(() => {
      setPowerData((prev) => {
        if (!prev) return prev;
        const idx = getCurrentHourIndex(prev.prices);
        if (idx === prev.currentIndex) return prev;
        return { ...prev, currentIndex: idx };
      });
    }, 60 * 1000);
    return () => clearInterval(t);
  }, [powerData]);

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
      powerTimeFormat,
      powerShowDayChart,
    },
    powerData,
    loading,
    error,
  };

  switch (panelSize) {
    case "tiny":
      return <PowerTiny {...commonProps} />;
    case "small":
      return <PowerSmall {...commonProps} />;
    case "medium":
      return <PowerMedium {...commonProps} />;
    case "large":
      return <PowerLarge {...commonProps} />;
    case "xlarge":
      return <PowerXLarge {...commonProps} />;
    default:
      return <PowerSmall {...commonProps} />;
  }
}
