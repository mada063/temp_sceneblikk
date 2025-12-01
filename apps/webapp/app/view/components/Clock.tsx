"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import type { CellAppearance } from "../../lib/layout-types";
import { SingleClock } from "./Clock/SingleClock";
// @ts-ignore - JSON import
import timezones from "../../lib/timezones.json";

type ClockProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
};

export function Clock({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: ClockProps) {
  const {
    showClockSeconds = true,
    showClockDate = false,
    clockFormat = "24h",
    clockStyle = "digital",
    clockTimezone = "Europe/Oslo",
    showMultipleClocks = false,
    clockTimezone2,
    clockTimezone3,
    clockTimezone4,
    textColor,
  } = appearance;

  const [now, setNow] = useState<Date>(() => new Date());
  const [isInitializing, setIsInitializing] = useState(true);
  const hasInitialized = useRef(false);

  // On load, scroll up from 00:00:00 to current time (iPhone-style)
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const currentTime = new Date();
    
    // Start from 00:00:00
    const startTime = new Date(currentTime);
    startTime.setHours(0);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    setNow(startTime);
    
    // Animate scrolling up to current time
    const duration = 2000; // 2 seconds
    const start = startTime.getTime();
    const end = currentTime.getTime();
    const startTimeMs = Date.now();
    
    const scrollInterval = setInterval(() => {
      const elapsed = Date.now() - startTimeMs;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = new Date(start + (end - start) * eased);
      setNow(current);
      
      if (progress >= 1) {
        clearInterval(scrollInterval);
        setIsInitializing(false);
        hasInitialized.current = true;
        setNow(currentTime);
      }
    }, 16); // ~60fps
    
    return () => clearInterval(scrollInterval);
  }, []);

  // Update clock every second/minute after initialization
  useEffect(() => {
    if (!hasInitialized.current) return;
    
    const intervalMs = showClockSeconds ? 1000 : 60000;
    const id = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    
    return () => clearInterval(id);
  }, [showClockSeconds, isInitializing]);

  // Check if panel is 1/4 or more of the grid
  const isQuarterOrMore = useMemo(() => {
    if (!totalGridSize || totalGridSize === 0) {
      const panelArea = colSpan * rowSpan;
      return panelArea >= 4; // At least 4 grid cells
    }
    const panelArea = colSpan * rowSpan;
    const fraction = panelArea / totalGridSize;
    return fraction >= 0.25; // 1/4 or more
  }, [colSpan, rowSpan, totalGridSize]);

  // Get all active timezones
  const activeTimezones = useMemo(() => {
    const timezones = [clockTimezone];
    if (showMultipleClocks && isQuarterOrMore) {
      if (clockTimezone2) timezones.push(clockTimezone2);
      if (clockTimezone3) timezones.push(clockTimezone3);
      if (clockTimezone4) timezones.push(clockTimezone4);
    }
    return timezones;
  }, [clockTimezone, clockTimezone2, clockTimezone3, clockTimezone4, showMultipleClocks, isQuarterOrMore]);

  // Get timezone labels
  const getTimezoneLabel = (tz: string) => {
    const tzData = timezones.find((t: { value: string; label: string }) => t.value === tz);
    return tzData?.label || tz;
  };

  const primaryColor = textColor || "#ffffff";

  // Render multiple clocks if enabled and panel is large enough
  if (showMultipleClocks && isQuarterOrMore && activeTimezones.length > 1) {
    const clockCount = activeTimezones.length;
    const gridCols = clockCount <= 2 ? 2 : clockCount <= 4 ? 2 : 3;
    const gridRows = clockCount <= 2 ? 1 : clockCount <= 4 ? 2 : Math.ceil(clockCount / 3);
    const clockSize = clockCount <= 2 ? "large" : clockCount <= 4 ? "medium" : "small";

    return (
      <div
        className="grid h-full w-full gap-4 p-4"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gridTemplateRows: `repeat(${gridRows}, 1fr)`,
        }}
      >
        {activeTimezones.map((tz, index) => (
          <div
            key={tz}
            className="flex flex-col items-center justify-center gap-1"
          >
            <SingleClock
              time={now}
              timezone={tz}
              style={clockStyle}
              showSeconds={showClockSeconds}
              showDate={showClockDate}
              format={clockFormat}
              color={primaryColor}
              size={clockSize}
              animateChanges={!isInitializing}
            />
            <div
              className="text-[10px] font-medium uppercase tracking-wider"
              style={{ color: `${primaryColor}AA` }}
            >
              {getTimezoneLabel(tz)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render single clock
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
      <SingleClock
        time={now}
        timezone={clockTimezone}
        style={clockStyle}
        showSeconds={showClockSeconds}
        showDate={showClockDate}
        format={clockFormat}
        color={primaryColor}
        size="large"
        animateChanges={!isInitializing}
      />
    </div>
  );
}





