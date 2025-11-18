"use client";

import { AnalogClock } from "./AnalogClock";

type SingleClockProps = {
  time: Date;
  timezone: string;
  style: "digital" | "analog";
  showSeconds: boolean;
  showDate: boolean;
  format: "12h" | "24h";
  color: string;
  size?: "small" | "medium" | "large";
};

export function SingleClock({
  time,
  timezone,
  style,
  showSeconds,
  showDate,
  format,
  color,
  size = "medium",
}: SingleClockProps) {
  const timeFormatter = new Intl.DateTimeFormat(undefined, {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    second: showSeconds ? "2-digit" : undefined,
    hour12: format === "12h",
  });

  const dateFormatter = showDate
    ? new Intl.DateTimeFormat(undefined, {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    : null;

  const timeText = timeFormatter.format(time);
  const dateText = dateFormatter ? dateFormatter.format(time) : null;

  const textSizeClass =
    size === "small"
      ? "text-xl sm:text-2xl"
      : size === "large"
        ? "text-4xl sm:text-5xl"
        : "text-3xl sm:text-4xl";

  if (style === "analog") {
    const clockSize = size === "small" ? 120 : size === "large" ? 200 : 160;
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <AnalogClock
          time={time}
          timezone={timezone}
          size={clockSize}
          color={color}
          showSeconds={showSeconds}
        />
        {dateText && (
          <div
            className="text-xs font-medium uppercase tracking-[0.24em]"
            style={{ color: `${color}CC` }}
          >
            {dateText}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className={`font-semibold tracking-[0.22em] ${textSizeClass}`}
        style={{ color }}
      >
        {timeText}
      </div>
      {dateText && (
        <div
          className="text-xs font-medium uppercase tracking-[0.24em]"
          style={{ color: `${color}CC` }}
        >
          {dateText}
        </div>
      )}
    </div>
  );
}

