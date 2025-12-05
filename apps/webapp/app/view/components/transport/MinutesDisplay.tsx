"use client";

import type { ReactElement, CSSProperties } from "react";

type MinutesDisplayProps = {
  minutes: number | null;
  fallback: string;
  suffix?: string;
  className?: string;
  style?: CSSProperties;
  animateDigits?: boolean;
};

export function MinutesDisplay({
  minutes,
  fallback,
  suffix = "min",
  className,
  style,
  animateDigits = false,
}: MinutesDisplayProps): ReactElement {
  if (minutes === null) {
    return (
      <span className={className} style={style as React.CSSProperties}>
        {fallback}
      </span>
    );
  }

  const digits = minutes.toString().split("");

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: "0.15em",
        fontVariantNumeric: "tabular-nums",
        ...(style as React.CSSProperties),
      }}
    >
      <span className="inline-flex gap-[0.05em]">
        {digits.map((digit, idx) => (
          <span
            key={`${digit}-${idx}`}
            className={animateDigits ? "animate-clock-slide-up" : ""}
            style={{ display: "inline-block" }}
          >
            {digit}
          </span>
        ))}
      </span>
      <span>{suffix}</span>
    </span>
  );
}


