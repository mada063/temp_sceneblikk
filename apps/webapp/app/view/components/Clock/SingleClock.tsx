"use client";

import { useEffect, useRef, useState } from "react";
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
  animateChanges?: boolean;
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
  animateChanges = true,
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
  
  // Parse time into parts
  const timeInTimezone = new Date(
    time.toLocaleString("en-US", { timeZone: timezone })
  );
  const hours = timeInTimezone.getHours();
  const minutes = timeInTimezone.getMinutes();
  const seconds = timeInTimezone.getSeconds();
  
  const formatPart = (value: number, pad: number = 2) => 
    format === "12h" && pad === 2 
      ? (value % 12 || 12).toString().padStart(pad, '0')
      : value.toString().padStart(pad, '0');
  
  const hourText = formatPart(format === "12h" ? (hours % 12 || 12) : hours);
  const minuteText = formatPart(minutes);
  const secondText = showSeconds ? formatPart(seconds) : null;
  const amPm = format === "12h" ? (hours >= 12 ? "PM" : "AM") : null;
  type DigitKey = string;
  const prevPartsRef = useRef({ hour: hourText, minute: minuteText, second: secondText || "" });
  const [animatingDigits, setAnimatingDigits] = useState<Set<DigitKey>>(new Set());

  // Detect which digits changed and animate only those (per character)
  useEffect(() => {
    if (!animateChanges) {
      prevPartsRef.current = { hour: hourText, minute: minuteText, second: secondText || "" };
      return;
    }

    const prev = prevPartsRef.current;
    const next = { hour: hourText, minute: minuteText, second: secondText || "" };
    const changedDigitKeys = new Set<DigitKey>();

    const addChangedDigits = (partName: "hour" | "minute" | "second") => {
      const prevStr = (prev as any)[partName] as string;
      const nextStr = (next as any)[partName] as string;
      const maxLen = Math.max(prevStr.length, nextStr.length);
      for (let i = 0; i < maxLen; i++) {
        if (prevStr[i] !== nextStr[i]) {
          changedDigitKeys.add(`${partName}-${i}`);
        }
      }
    };

    addChangedDigits("hour");
    addChangedDigits("minute");
    if (showSeconds) {
      addChangedDigits("second");
    }

    if (changedDigitKeys.size > 0) {
      setAnimatingDigits(changedDigitKeys);
      prevPartsRef.current = next;

      const clearTimer = setTimeout(() => {
        setAnimatingDigits(new Set());
      }, 250);

      return () => {
        clearTimeout(clearTimer);
      };
    }
  }, [hourText, minuteText, secondText, animateChanges, showSeconds]);

  const textSizeClass =
    size === "small"
      ? "text-xl sm:text-2xl"
      : size === "large"
        ? "text-4xl sm:text-5xl"
        : "text-3xl sm:text-4xl";

  if (style === "analog") {
    // Smaller sizes for analog clocks to prevent overflow in small cells
    const clockSize = size === "small" ? 80 : size === "large" ? 200 : 160;
    return (
      <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 max-w-full max-h-full">
        <div className="flex-shrink-0" style={{ maxWidth: '100%', maxHeight: '100%' }}>
        <AnalogClock
          time={time}
          timezone={timezone}
          size={clockSize}
          color={color}
          showSeconds={showSeconds}
        />
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

  return (
    <div className="flex flex-col items-center justify-center gap-1 sm:gap-2 max-w-full max-h-full">
      <div
        className={`font-semibold tracking-[0.22em] ${textSizeClass}`}
        style={{ 
          color,
          fontVariantNumeric: 'tabular-nums',
          minWidth: size === "small" ? "6ch" : size === "large" ? "10ch" : "8ch",
          textAlign: 'center',
          display: 'inline-flex',
          gap: '0.1em',
          maxWidth: '100%',
          overflow: 'hidden'
        }}
      >
        {/* Hours digits */}
        {hourText.split("").map((ch, idx) => (
          <span
            key={`h-${idx}-${ch}`}
            className={animatingDigits.has(`hour-${idx}`) ? "animate-clock-slide-up" : ""}
            style={{ display: "inline-block" }}
          >
            {ch}
          </span>
        ))}
        <span>:</span>
        {/* Minutes digits */}
        {minuteText.split("").map((ch, idx) => (
          <span
            key={`m-${idx}-${ch}`}
            className={animatingDigits.has(`minute-${idx}`) ? "animate-clock-slide-up" : ""}
            style={{ display: "inline-block" }}
          >
            {ch}
          </span>
        ))}
        {showSeconds && secondText && (
          <>
            <span>:</span>
            {secondText.split("").map((ch, idx) => (
              <span
                key={`s-${idx}-${ch}`}
                className={animatingDigits.has(`second-${idx}`) ? "animate-clock-slide-up" : ""}
                style={{ display: "inline-block" }}
              >
                {ch}
              </span>
            ))}
          </>
        )}
        {amPm && (
          <span style={{ fontSize: '0.6em', marginLeft: '0.2em' }}>{amPm}</span>
        )}
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

