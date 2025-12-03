"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarProps, CalendarDay, CalendarEvent } from "./types";
import {
  WEEKDAY_LABELS,
  createCalendarDays,
  buildSampleEvents,
  hexToRgba,
  getReadableTextColor,
  parseColorPalette,
  makeDateKey,
  getISOWeekNumber,
} from "./utils";
import { useCalendarAnimations, CALENDAR_ANIMATION } from "./useCalendarAnimations";

const UPCOMING_LIMIT = 4;

export function CalendarLarge({ appearance }: CalendarProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthLabel = new Intl.DateTimeFormat("nb-NO", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));

  const textColor = appearance.textColor || "#ffffff";
  const showUpcoming = appearance.calendarShowUpcoming ?? true;
  const accentOverride = appearance.calendarAccentColor?.trim() ?? "";
  const mutedOverride = appearance.calendarMutedColor?.trim() ?? "";
  const cellBackgroundOverride = appearance.calendarCellBackground?.trim() ?? "";
  const todayOverride = appearance.calendarTodayHighlight?.trim() ?? "";
  const accentColor =
    accentOverride !== "" ? accentOverride : appearance.borderColor || textColor;
  const borderColor = hexToRgba(accentColor, 0.25);
  const mutedColor =
    mutedOverride !== "" ? mutedOverride : hexToRgba(textColor, 0.65);
  const dayBackground =
    cellBackgroundOverride !== ""
      ? cellBackgroundOverride
      : hexToRgba(textColor, 0.05);
  const todayHighlight =
    todayOverride !== "" ? todayOverride : hexToRgba(accentColor, 0.2);
  const accentTextColor = getReadableTextColor(accentColor, "#0f172a");
  const upcomingBorderColor = hexToRgba(accentColor, 0.18);

  const eventPalette = useMemo(
    () => parseColorPalette(appearance.calendarEventPalette),
    [appearance.calendarEventPalette],
  );

  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>(() =>
    appearance.calendarProvider === "google"
      ? {}
      : buildSampleEvents(year, month, eventPalette),
  );

  // Load events from Google Calendar when configured, otherwise fall back to demo data
  useEffect(() => {
    if (appearance.calendarProvider !== "google") {
      // Ensure we reset to demo data if provider was switched away from Google
      setEventsByDate(buildSampleEvents(year, month, eventPalette));
      return;
    }

    const abortController = new AbortController();

    const load = async () => {
      try {
        const params = new URLSearchParams({
          year: String(year),
          month: String(month),
        });
        if (appearance.calendarId && appearance.calendarId.trim() !== "") {
          params.set("calendarId", appearance.calendarId.trim());
        }

        const response = await fetch(`/api/google/calendar?${params.toString()}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          // eslint-disable-next-line no-console
          console.warn("Google Calendar API returned non-OK response, using demo data instead.");
          setEventsByDate(buildSampleEvents(year, month, eventPalette));
          return;
        }

        const data: {
          events?: Array<{
            id: string;
            summary: string;
            start: string;
            end?: string | null;
            allDay?: boolean;
          }>;
        } = await response.json();

        const incomingEvents = data.events ?? [];
        if (incomingEvents.length === 0) {
          setEventsByDate({});
          return;
        }

        const next: Record<string, CalendarEvent[]> = {};
        incomingEvents.forEach((rawEvent, index) => {
          const startDate = new Date(rawEvent.start);
          const key = makeDateKey(startDate);

          const hours = startDate.getHours().toString().padStart(2, "0");
          const minutes = startDate.getMinutes().toString().padStart(2, "0");
          const timeLabel = rawEvent.allDay ? undefined : `${hours}:${minutes}`;

          const list = next[key] ?? [];
          const color =
            eventPalette.length > 0
              ? eventPalette[(index + list.length) % eventPalette.length]
              : undefined;

          list.push({
            id: rawEvent.id,
            title: rawEvent.summary,
            time: timeLabel,
            color,
          });

          next[key] = list;
        });

        setEventsByDate(next);
      } catch (error) {
        if (abortController.signal.aborted) return;
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Calendar events, falling back to demo data:", error);
        setEventsByDate(buildSampleEvents(year, month, eventPalette));
      }
    };

    load();

    return () => {
      abortController.abort();
    };
  }, [appearance.calendarProvider, appearance.calendarId, year, month, eventPalette]);

  const calendarDays = useMemo(
    () => createCalendarDays(year, month, eventsByDate),
    [year, month, eventsByDate],
  );

  const upcomingEvents = useMemo(() => {
    if (!showUpcoming) {
      return [];
    }
    const items: Array<{ date: Date; event: CalendarEvent }> = [];
    calendarDays.forEach((day) => {
      if (!day.isCurrentMonth) return;
      day.events.forEach((event) => {
        items.push({ date: day.date, event });
      });
    });
    return items
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, UPCOMING_LIMIT);
  }, [calendarDays, showUpcoming]);

  const weekNumbers = useMemo(() => {
    const weeks = new Set<number>();
    calendarDays.forEach((day) => {
      if (day.isCurrentMonth) {
        const weekNum = getISOWeekNumber(day.date);
        weeks.add(weekNum);
      }
    });
    return Array.from(weeks).sort((a, b) => a - b);
  }, [calendarDays]);

  const { isInitialLoad } = useCalendarAnimations(calendarDays.length);

  return (
    <div
      className="flex h-full w-full flex-col gap-4 p-4 sm:p-6"
      style={{ color: textColor }}
    >
      <header className="flex flex-wrap items-center justify-between gap-4 animate-fade-in">
        <div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.35em]"
            style={{ color: mutedColor }}
          >
            Kalender
          </p>
          <p className="text-2xl font-semibold capitalize leading-tight">
            {monthLabel}
          </p>
          <p className="text-sm font-medium" style={{ color: mutedColor }}>
            Uke {weekNumbers.join(", ")}
          </p>
        </div>
        <div
          className="rounded-2xl border px-4 py-3 text-sm text-right"
          style={{
            borderColor,
            color: textColor,
          }}
        >
          <p className="text-xs uppercase tracking-[0.2em]">I dag</p>
          <p className="text-base font-semibold">
            {new Intl.DateTimeFormat("nb-NO", {
              weekday: "long",
            }).format(now)}
          </p>
          <p style={{ color: mutedColor }}>
            {new Intl.DateTimeFormat("nb-NO").format(now)}
          </p>
        </div>
      </header>

      <div className={`flex flex-1 flex-col gap-4 ${showUpcoming ? "lg:flex-row" : ""}`}>
        <div
          className="flex-1 rounded-3xl border p-4"
          style={{ borderColor }}
        >
          <div
            className="grid grid-cols-7 gap-2 text-[10px] font-semibold uppercase tracking-[0.3em]"
            style={{ color: mutedColor }}
          >
            {WEEKDAY_LABELS.map((label) => (
              <span key={label} className="text-center">
                {label}
              </span>
            ))}
          </div>
          <div
            className="mt-3 grid flex-1 grid-cols-7 gap-2 text-sm"
            style={{ gridAutoRows: "minmax(110px, 1fr)" }}
          >
            {calendarDays.map((day, cellIndex) => {
              const isToday =
                day.isCurrentMonth &&
                day.date.getDate() === now.getDate() &&
                day.date.getMonth() === now.getMonth() &&
                day.date.getFullYear() === now.getFullYear();

              const cellDelay = isInitialLoad
                ? `${(cellIndex * CALENDAR_ANIMATION.stagger) / 1000}s`
                : undefined;
              const cellOpacity = isInitialLoad ? 0 : undefined;

              return (
                <div
                  key={day.date.toISOString()}
                  className={`flex h-full min-h-0 flex-col rounded-2xl border px-2 py-2 transition-opacity duration-300 ${
                    isInitialLoad ? "animate-calendar-cell-fade-in" : ""
                  }`}
                  style={{
                    borderColor,
                    backgroundColor: isToday ? todayHighlight : dayBackground,
                    opacity: cellOpacity ?? (day.isCurrentMonth ? 1 : 0.35),
                    animationDelay: cellDelay,
                  }}
                >
                  <div className="mb-1 flex shrink-0 items-center justify-between gap-1 text-xs font-semibold whitespace-nowrap">
                    <span className="shrink-0">{day.date.getDate()}</span>
                    {isToday ? (
                      <span
                        className="shrink-0 rounded-full px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] whitespace-nowrap animate-calendar-today-pulse"
                        style={{
                          backgroundColor: accentColor,
                          color: accentTextColor,
                        }}
                      >
                        I dag
                      </span>
                    ) : null}
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-hidden">
                    {day.events.slice(0, 2).map((event, index) => {
                      const backgroundColor =
                        event.color || hexToRgba(accentColor, 0.2);
                      const eventTextColor = getReadableTextColor(
                        event.color || backgroundColor,
                        textColor,
                      );
                      const eventDelay = isInitialLoad
                        ? `${((cellIndex * CALENDAR_ANIMATION.stagger + (index + 1) * 50) / 1000)}s`
                        : undefined;
                      return (
                        <div
                          key={event.id ?? `${day.date.toISOString()}-${index}`}
                          className={`min-w-0 shrink-0 rounded-xl px-2 py-1 text-[11px] font-semibold leading-tight ${
                            isInitialLoad ? "animate-calendar-event-fade-in" : ""
                          }`}
                          style={{
                            backgroundColor,
                            color: eventTextColor,
                            opacity: isInitialLoad ? 0 : 1,
                            animationDelay: eventDelay,
                          }}
                        >
                          <span className="block truncate whitespace-nowrap">
                            {event.time ? `${event.time} · ` : ""}
                            {event.title}
                          </span>
                        </div>
                      );
                    })}
                    {day.events.length > 2 ? (
                      <span
                        className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{ color: mutedColor }}
                      >
                        +{day.events.length - 2} more...
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {showUpcoming ? (
          <div
            className="rounded-3xl border p-4 lg:w-72 lg:flex-none"
            style={{ borderColor: upcomingBorderColor }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: mutedColor }}
            >
              Kommende hendelser
            </p>
            <div className="mt-3 space-y-3">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm" style={{ color: mutedColor }}>
                  Ingen planlagte aktiviteter denne måneden.
                </p>
              ) : (
                upcomingEvents.map(({ date, event }) => (
                  <div
                    key={event.id}
                    className="rounded-2xl border px-3 py-2"
                    style={{ borderColor: upcomingBorderColor }}
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-[0.2em]"
                      style={{ color: mutedColor }}
                    >
                      {new Intl.DateTimeFormat("nb-NO", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      }).format(date)}
                    </p>
                    <p className="text-sm font-semibold">{event.title}</p>
                    {event.time ? (
                      <p className="text-xs" style={{ color: mutedColor }}>
                        {event.time}
                      </p>
                    ) : null}
                    {event.category ? (
                      <span
                        className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em]"
                        style={{
                          backgroundColor: hexToRgba(accentColor, 0.2),
                          color: accentTextColor,
                        }}
                      >
                        {event.category}
                      </span>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

