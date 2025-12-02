"use client";

import { useMemo } from "react";
import type { CalendarProps, CalendarEvent } from "./types";
import {
  buildSampleEvents,
  hexToRgba,
  getReadableTextColor,
  parseColorPalette,
  makeDateKey,
} from "./utils";

export function CalendarSmall({ appearance }: CalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const textColor = appearance.textColor || "#ffffff";
  const accentOverride = appearance.calendarAccentColor?.trim() ?? "";
  const mutedOverride = appearance.calendarMutedColor?.trim() ?? "";
  const todayOverride = appearance.calendarTodayHighlight?.trim() ?? "";
  const accentColor =
    accentOverride !== "" ? accentOverride : appearance.borderColor || textColor;
  const borderColor = hexToRgba(accentColor, 0.25);
  const mutedColor =
    mutedOverride !== "" ? mutedOverride : hexToRgba(textColor, 0.65);
  const todayHighlight =
    todayOverride !== "" ? todayOverride : hexToRgba(accentColor, 0.2);
  const accentTextColor = getReadableTextColor(accentColor, "#0f172a");

  const eventPalette = useMemo(
    () => parseColorPalette(appearance.calendarEventPalette),
    [appearance.calendarEventPalette],
  );

  const todayEvents = useMemo(() => {
    const eventsByDate = buildSampleEvents(year, month, eventPalette);
    const todayKey = makeDateKey(new Date(year, month, day));
    return eventsByDate[todayKey] ?? [];
  }, [year, month, day, eventPalette]);

  const dayLabel = new Intl.DateTimeFormat("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);

  return (
    <div
      className="flex h-full w-full flex-col gap-4 p-4 sm:p-6 animate-fade-in"
      style={{ color: textColor }}
    >
      <header className="animate-fade-in">
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: mutedColor }}
        >
          Kalender
        </p>
        <p className="text-2xl font-semibold capitalize leading-tight">
          {dayLabel}
        </p>
      </header>

      <div
        className="flex flex-1 flex-col gap-3 rounded-3xl border p-4 animate-calendar-cell-fade-in"
        style={{ borderColor, animationDelay: "0.2s" }}
      >
        {todayEvents.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <p className="text-sm animate-fade-in" style={{ color: mutedColor, animationDelay: "0.4s" }}>
              Ingen planlagte aktiviteter i dag.
            </p>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-2">
            {todayEvents.map((event, index) => {
              const backgroundColor =
                event.color || hexToRgba(accentColor, 0.2);
              const eventTextColor = getReadableTextColor(
                event.color || backgroundColor,
                textColor,
              );
              const eventDelay = `${(0.4 + index * 0.1)}s`;
              return (
                <div
                  key={event.id ?? `event-${index}`}
                  className="rounded-2xl border px-4 py-3 animate-calendar-event-fade-in"
                  style={{
                    borderColor,
                    backgroundColor,
                    color: eventTextColor,
                    opacity: 0,
                    animationDelay: eventDelay,
                  }}
                >
                  {event.time && (
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: mutedColor }}
                    >
                      {event.time}
                    </p>
                  )}
                  <p className="mt-1 text-base font-semibold">{event.title}</p>
                  {event.category && (
                    <span
                      className="mt-2 inline-flex rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
                      style={{
                        backgroundColor: hexToRgba(accentColor, 0.2),
                        color: accentTextColor,
                      }}
                    >
                      {event.category}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

