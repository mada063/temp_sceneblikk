"use client";

import { useEffect, useState, useMemo } from "react";
import type { CellAppearance } from "../../lib/layout-types";
import { SingleClock } from "./clock/SingleClock";
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

  useEffect(() => {
    const intervalMs = showClockSeconds ? 1000 : 60000;
    const id = setInterval(() => {
      setNow(new Date());
    }, intervalMs);
    return () => clearInterval(id);
  }, [showClockSeconds]);

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
      />
    </div>
  );
}





