"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TransportTiny } from "./TransportTiny";
import { TransportSmall } from "./TransportSmall";
import { TransportMedium } from "./TransportMedium";
import { TransportLarge } from "./TransportLarge";
import { TransportXLarge } from "./TransportXLarge";
import { fetchTransportData } from "./utils";
import type { TransportProps, PanelSize, TransportData } from "./types";
import { FiActivity } from "react-icons/fi";

export function Transport({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: TransportProps) {
  const {
    transportStopPlace = "62356",
    transportStopPlace2,
    transportShowDualStops = false,
    transportTimeFormat = "24h",
    transportMaxDepartures = 10,
  } = appearance;

  const [transportData, setTransportData] = useState<TransportData | null>(null);
  const [secondaryTransportData, setSecondaryTransportData] = useState<TransportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const isInitialLoadRef = useRef(true);

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

  useEffect(() => {
    let isMounted = true;
    isInitialLoadRef.current = true;
    setTransportData(null);
    setSecondaryTransportData(null);
    setLoading(true);
    setError(null);

    const loadTransportData = async () => {
      try {
        if (isInitialLoadRef.current) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }
        setError(null);

        const [primaryData, secondaryData] = await Promise.all([
          fetchTransportData(transportStopPlace, transportMaxDepartures),
          transportShowDualStops && transportStopPlace2
            ? fetchTransportData(transportStopPlace2, transportMaxDepartures).catch((secondaryErr) => {
                console.error("Error loading secondary transport data:", secondaryErr);
                return null;
              })
            : Promise.resolve(null),
        ]);

        if (isMounted) {
          setTransportData(primaryData);
          setSecondaryTransportData(
            transportShowDualStops && transportStopPlace2 ? secondaryData : null
          );
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load transport data");
        }
        console.error("Error loading transport data:", err);
      } finally {
        if (isMounted) {
          if (isInitialLoadRef.current) {
            setLoading(false);
            isInitialLoadRef.current = false;
          }
          setRefreshing(false);
        }
      }
    };

    loadTransportData();

    // Refresh every 30 seconds
    const interval = setInterval(loadTransportData, 30 * 1000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [transportStopPlace, transportStopPlace2, transportShowDualStops, transportMaxDepartures]);

  const dualStopsEnabled = Boolean(transportShowDualStops && transportStopPlace2);

  const commonProps = {
    appearance,
    transportData,
    secondaryTransportData: dualStopsEnabled ? secondaryTransportData : null,
    dualStopEnabled: dualStopsEnabled,
    loading,
    error,
    timeFormat: transportTimeFormat,
    maxDepartures: transportMaxDepartures,
    panelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  if (loading) {
    const primaryColor = appearance.textColor || "#ffffff";
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-4xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <FiActivity />
        </div>
      </div>
    );
  }

  // Map panel sizes one step up: tiny->small, small->medium, medium->large, large->xlarge, xlarge->xlarge
  const actualSize: PanelSize = 
    panelSize === "tiny" ? "small" :
    panelSize === "small" ? "medium" :
    panelSize === "medium" ? "large" :
    panelSize === "large" ? "xlarge" :
    "xlarge";

  switch (actualSize) {
    case "tiny":
      return <TransportTiny {...commonProps} />;
    case "small":
      return <TransportSmall {...commonProps} />;
    case "medium":
      return <TransportMedium {...commonProps} />;
    case "large":
      return <TransportLarge {...commonProps} />;
    case "xlarge":
      return <TransportXLarge {...commonProps} />;
    default:
      return <TransportSmall {...commonProps} />;
  }
}

