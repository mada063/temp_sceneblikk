import type { SolarData } from "./types";
import { getTimes as getSunCalcTimes } from "suncalc";

/**
 * Get solar times for a given date at lat/lon.
 */
export function getSolarTimes(
  lat: number,
  lon: number,
  date: Date
): SolarData {
  const times = getSunCalcTimes(date, lat, lon);
  const sunrise = times.sunrise;
  const sunset = times.sunset;
  const solarNoon = times.solarNoon;
  const dawn = times.dawn;
  const dusk = times.dusk;

  const dayLengthMinutes = Math.round(
    (sunset.getTime() - sunrise.getTime()) / (60 * 1000)
  );

  const now = date.getTime();
  let nextEvent: SolarData["nextEvent"] = null;
  let nextEventTime: Date | null = null;

  const candidates: Array<{ time: Date; event: SolarData["nextEvent"] }> = [
    { time: dawn, event: "dawn" },
    { time: sunrise, event: "sunrise" },
    { time: sunset, event: "sunset" },
    { time: dusk, event: "dusk" },
  ];

  for (const { time, event } of candidates) {
    if (time.getTime() > now) {
      nextEvent = event;
      nextEventTime = time;
      break;
    }
  }

  return {
    sunrise,
    sunset,
    solarNoon,
    dawn,
    dusk,
    dayLengthMinutes,
    nextEvent,
    nextEventTime,
  };
}

export function formatSolarTime(
  date: Date,
  format: "12h" | "24h"
): string {
  if (format === "12h") {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  return date.toLocaleTimeString("nb-NO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function formatDayLength(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}t`;
  return `${h}t ${m}m`;
}
