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
  // For analog clocks, start from 12:00:00 instead
  useEffect(() => {
    if (hasInitialized.current) return;
    
    const animationStartTime = Date.now();
    const totalDuration = 4000; // 4 seconds total
    
    // Calculate target end time: current time + animation duration
    // This ensures the clock lands on the correct time when animation completes
    const targetEndTime = new Date(animationStartTime + totalDuration);
    
    // Start from 00:00:00 (today) for digital, or 12:00:00 for analog
    const startTime = new Date(targetEndTime);
    if (clockStyle === "analog") {
      startTime.setHours(12);
    } else {
      startTime.setHours(0);
    }
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);
    
    // Calculate time 60 minutes before target end time
    const sixtyMinutesBefore = new Date(targetEndTime);
    sixtyMinutesBefore.setMinutes(sixtyMinutesBefore.getMinutes() - 60);
    sixtyMinutesBefore.setSeconds(0);
    sixtyMinutesBefore.setMilliseconds(0);
    
    // Make sure we don't go before midnight
    const phase1End = sixtyMinutesBefore.getTime() > startTime.getTime() 
      ? sixtyMinutesBefore 
      : startTime;
    
    setNow(startTime);
    
    // Two-phase animation: fast to 60 min before, then slow to current
    const phase1Duration = totalDuration * 0.25; // 25% of time for fast phase
    const phase2Duration = totalDuration * 0.75; // 75% of time for slow phase
    
    const start = startTime.getTime();
    const midPoint = phase1End.getTime();
    const end = targetEndTime.getTime();
    
    const scrollInterval = setInterval(() => {
      const elapsed = Date.now() - animationStartTime;
      
      let current: Date;
      
      if (elapsed < phase1Duration) {
        // Phase 1: Fast animation from 00:00:00 to 60 minutes before
        const phase1Progress = Math.min(elapsed / phase1Duration, 1);
        // Use ease-out for smooth transition into phase 2
        const eased = 1 - Math.pow(1 - phase1Progress, 2);
        const phase1Time = start + (midPoint - start) * eased;
        current = new Date(phase1Time);
      } else {
        // Phase 2: Slow animation from 60 minutes before to current time
        const phase2Elapsed = elapsed - phase1Duration;
        const phase2Progress = Math.min(phase2Elapsed / phase2Duration, 1);
        // Use a very smooth ease-out for the slow trickle
        const eased = 1 - Math.pow(1 - phase2Progress, 5); // High power for very smooth deceleration
        const phase2Time = midPoint + (end - midPoint) * eased;
        current = new Date(phase2Time);
      }
      
      setNow(current);
      
      if (elapsed >= totalDuration) {
        clearInterval(scrollInterval);
        setIsInitializing(false);
        hasInitialized.current = true;
        // Set to actual current time at completion
        setNow(new Date());
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

  // Calculate appropriate clock size based on cell dimensions
  const clockSize = useMemo((): "small" | "medium" | "large" => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    
    if (!totalGridSize || totalGridSize === 0) {
      // Absolute sizing when total grid size is unknown
      if (panelArea <= 1) return "small";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      return "large";
    }
    
    const fraction = panelArea / totalGridSize;
    
    // Small: very small panels (< 12.5% of grid) or single cell
    if (fraction < 0.125 || panelArea === 1) {
      return "small";
    }
    
    // Medium: small to medium panels (12.5-50% of grid)
    if (fraction < 0.5) {
      return "medium";
    }
    
    // Large: larger panels (50%+ of grid)
    return "large";
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-2 sm:px-4 text-center overflow-hidden">
      <SingleClock
        time={now}
        timezone={clockTimezone}
        style={clockStyle}
        showSeconds={showClockSeconds}
        showDate={showClockDate}
        format={clockFormat}
        color={primaryColor}
        size={clockSize}
        animateChanges={!isInitializing}
      />
    </div>
  );
}





