"use client";

import { useEffect, useState } from "react";
import type { CellAppearance } from "../../lib/layout-types";

type ClockProps = {
  appearance: CellAppearance;
};

export function Clock({ appearance }: ClockProps) {
  const {
    showClockSeconds = true,
    showClockDate = false,
    clockFormat = "24h",
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

  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: showClockSeconds ? "2-digit" : undefined,
    hour12: clockFormat === "12h",
  });

  const dateFormatter = showClockDate
    ? new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  const timeText = timeFormatter.format(now);
  const dateText = dateFormatter ? dateFormatter.format(now) : null;

  const primaryColor = textColor || "#ffffff";

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
      <div
        className="text-3xl font-semibold tracking-[0.22em] sm:text-4xl"
        style={{ color: primaryColor }}
      >
        {timeText}
      </div>
      {dateText ? (
        <div
          className="text-xs font-medium uppercase tracking-[0.24em]"
          style={{ color: `${primaryColor}CC` }}
        >
          {dateText}
        </div>
      ) : null}
    </div>
  );
}



