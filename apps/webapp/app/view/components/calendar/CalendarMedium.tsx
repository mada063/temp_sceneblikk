"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import type { CalendarProps, CalendarDay, CalendarEvent } from "./types";
import {
  WEEKDAY_LABELS,
  buildSampleEvents,
  hexToRgba,
  getReadableTextColor,
  parseColorPalette,
  makeDateKey,
  getISOWeekNumber,
} from "./utils";
import { useCalendarAnimations, CALENDAR_ANIMATION } from "./useCalendarAnimations";

type CalendarMediumProps = CalendarProps & {
  isExpanded?: boolean;
};

export function CalendarMedium({
  appearance,
  isExpanded = false,
  orientation,
}: CalendarMediumProps) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

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

  const eventPalette = useMemo(
    () => parseColorPalette(appearance.calendarEventPalette),
    [appearance.calendarEventPalette],
  );

  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>(() =>
    appearance.calendarProvider === "google"
      ? {}
      : buildSampleEvents(year, month, eventPalette),
  );

  // Load weekly events from Google Calendar when configured; otherwise use demo data
  useEffect(() => {
    if (appearance.calendarProvider !== "google") {
      setEventsByDate(buildSampleEvents(year, month, eventPalette));
      return;
    }

    const abortController = new AbortController();

    const load = async (controller: AbortController = abortController) => {
      try {
        const params = new URLSearchParams({
          year: String(year),
          month: String(month),
        });
        if (appearance.calendarId && appearance.calendarId.trim() !== "") {
          params.set("calendarId", appearance.calendarId.trim());
        }

        const response = await fetch(`/api/google/calendar?${params.toString()}`, {
          signal: controller.signal,
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
        if (controller.signal.aborted) return;
        // eslint-disable-next-line no-console
        console.error("Failed to load Google Calendar events, falling back to demo data:", error);
        setEventsByDate(buildSampleEvents(year, month, eventPalette));
      }
    };

    // Load immediately on mount or when dependencies change
    load();

    // Set up polling interval: fetch every 30 minutes (30 * 60 * 1000 ms)
    const intervalId = setInterval(() => {
      // Create a new abort controller for each interval call
      const intervalAbortController = new AbortController();
      load(intervalAbortController);
    }, 30 * 60 * 1000);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [appearance.calendarProvider, appearance.calendarId, year, month, eventPalette]);

  // Calculate week key (Monday date) to detect week changes
  const weekKey = useMemo(() => {
    const today = new Date(now);
    const dayOfWeek = today.getDay() || 7; // Convert Sunday=0 to 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1); // Get Monday
    return makeDateKey(monday);
  }, [now]);

  // Get current week's days (Monday to Sunday)
  const weekDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date(now);
    const dayOfWeek = today.getDay() || 7; // Convert Sunday=0 to 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - dayOfWeek + 1); // Get Monday

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const key = makeDateKey(date);
      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        events: eventsByDate[key] ?? [],
      });
    }

    return days;
  }, [now, month, eventsByDate]);

  // Cache weekDays to use during week transition animations only
  const cachedWeekDaysRef = useRef<CalendarDay[]>(weekDays);
  const prevWeekKeyRef = useRef<string>(weekKey);
  const isWeekChangingRef = useRef(false);

  // Update cache when week changes, but keep using cached version during animations
  const { isAnimating, isInitialLoad } = useCalendarAnimations(weekDays.length, weekKey);

  // Detect week changes and manage cache appropriately
  useEffect(() => {
    const weekChanged = weekKey !== prevWeekKeyRef.current;
    
    if (weekChanged) {
      // Week is changing - preserve current cache (old week) for animation
      isWeekChangingRef.current = true;
      prevWeekKeyRef.current = weekKey;
      // Don't update cache yet - keep showing old week during animation
    } else if (!isWeekChangingRef.current) {
      // Same week, just data update - update cache immediately so new data is available
      cachedWeekDaysRef.current = weekDays;
    }
  }, [weekKey, weekDays]);

  // Update cache when week transition animation completes
  useEffect(() => {
    if (!isAnimating && isWeekChangingRef.current) {
      // Week transition animation completed - update cache with new week's data
      cachedWeekDaysRef.current = weekDays;
      isWeekChangingRef.current = false;
    }
  }, [isAnimating, weekDays]);

  // Use cached weekDays only during week transition animations
  // For data updates within the same week, always show current weekDays immediately
  const displayedWeekDays = isAnimating && isWeekChangingRef.current
    ? cachedWeekDaysRef.current
    : weekDays;

  const weekNumber = useMemo(() => {
    return getISOWeekNumber(now);
  }, [now]);
  const isPortrait = orientation === "portrait";

  const upcomingEvents = useMemo(() => {
    if (!showUpcoming) {
      return [];
    }
    const items: Array<{ date: Date; event: CalendarEvent }> = [];
    displayedWeekDays.forEach((day) => {
      day.events.forEach((event) => {
        items.push({ date: day.date, event });
      });
    });
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [displayedWeekDays, showUpcoming]);

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
          <p className="text-2xl font-semibold">Uke {weekNumber}</p>
        </div>
      </header>

      <div
        className={`flex flex-1 flex-col gap-4 ${showUpcoming ? "lg:flex-row" : ""}`}
      >
        <div
          className={`flex-1 rounded-3xl border p-4 ${isExpanded ? "flex flex-col" : ""}`}
          style={{ borderColor }}
        >
          {isPortrait ? (
            <div className="mt-3 flex flex-1 flex-col gap-2 overflow-hidden">
              {displayedWeekDays.map((day, cellIndex) => {
                const isToday =
                  day.date.getDate() === now.getDate() &&
                  day.date.getMonth() === now.getMonth() &&
                  day.date.getFullYear() === now.getFullYear();

                const eventsToShow = isExpanded ? day.events : day.events.slice(0, 2);

                const cellDelay = isInitialLoad
                  ? `${(cellIndex * CALENDAR_ANIMATION.stagger) / 1000}s`
                  : undefined;
                const cellOpacity = isInitialLoad ? 0 : undefined;

                return (
                  <div
                    key={day.date.toISOString()}
                    className={`flex min-h-0 flex-col rounded-2xl px-3 py-2 transition-opacity duration-300 ${
                      isInitialLoad ? "animate-calendar-cell-fade-in" : ""
                    }`}
                    style={{
                      borderColor,
                      backgroundColor: isToday ? todayHighlight : dayBackground,
                      opacity: cellOpacity ?? (day.isCurrentMonth ? 1 : 0.35),
                      animationDelay: cellDelay,
                    }}
                  >
                    <div className="mb-1 flex shrink-0 items-center justify-between gap-2 text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[10px] uppercase tracking-[0.3em] opacity-70"
                          style={{ color: mutedColor }}
                        >
                          {WEEKDAY_LABELS[day.date.getDay() === 0 ? 6 : day.date.getDay() - 1]}
                        </span>
                        <span className="text-sm">{day.date.getDate()}</span>
                      </div>
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
                    <div
                      className={`flex min-h-0 flex-1 flex-col gap-1 ${
                        isExpanded ? "overflow-auto" : "overflow-hidden"
                      }`}
                    >
                      {eventsToShow.map((event, index) => {
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
                            className={`rounded-xl px-2 py-1 text-[11px] font-semibold leading-tight transition-opacity duration-300 ${
                              isInitialLoad ? "animate-calendar-event-fade-in" : ""
                            } ${isExpanded ? "whitespace-normal" : "min-w-0 shrink-0"}`}
                            style={{
                              backgroundColor,
                              color: eventTextColor,
                              opacity: isInitialLoad ? 0 : 1,
                              animationDelay: eventDelay,
                            }}
                          >
                            {isExpanded ? (
                              <div>
                                {event.time && (
                                  <span className="text-[10px] font-medium opacity-75">
                                    {event.time}
                                  </span>
                                )}
                                <div className="mt-0.5">{event.title}</div>
                              </div>
                            ) : (
                              <span className="block truncate whitespace-nowrap">
                                {event.time ? `${event.time} · ` : ""}
                                {event.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {!isExpanded && day.events.length > 2 ? (
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
          ) : (
            <>
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
            className="mt-3 grid grid-cols-7 gap-2"
            style={isExpanded ? { gridAutoRows: "1fr", minHeight: 0, flex: "1 1 0" } : {}}
          >
            {displayedWeekDays.map((day, cellIndex) => {
              const isToday =
                day.date.getDate() === now.getDate() &&
                day.date.getMonth() === now.getMonth() &&
                day.date.getFullYear() === now.getFullYear();

              const eventsToShow = isExpanded ? day.events : day.events.slice(0, 2);

              const cellDelay = isInitialLoad
                ? `${(cellIndex * CALENDAR_ANIMATION.stagger) / 1000}s`
                : undefined;
              const cellOpacity = isInitialLoad ? 0 : undefined;

              return (
                <div
                  key={day.date.toISOString()}
                  className={`flex h-full min-h-0 flex-col rounded-2xl px-2 py-2 transition-opacity duration-300 ${
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
                      <div
                        className={`flex min-h-0 flex-1 flex-col gap-1 ${
                          isExpanded ? "overflow-auto" : "overflow-hidden"
                        }`}
                      >
                    {eventsToShow.map((event, index) => {
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
                          className={`rounded-xl px-2 py-1 text-[11px] font-semibold leading-tight transition-opacity duration-300 ${
                            isInitialLoad ? "animate-calendar-event-fade-in" : ""
                          } ${isExpanded ? "whitespace-normal" : "min-w-0 shrink-0"}`}
                          style={{
                            backgroundColor,
                            color: eventTextColor,
                            opacity: isInitialLoad ? 0 : 1,
                            animationDelay: eventDelay,
                          }}
                        >
                          {isExpanded ? (
                            <div>
                              {event.time && (
                                <span className="text-[10px] font-medium opacity-75">
                                  {event.time}
                                </span>
                              )}
                              <div className="mt-0.5">{event.title}</div>
                            </div>
                          ) : (
                            <span className="block truncate whitespace-nowrap">
                              {event.time ? `${event.time} · ` : ""}
                              {event.title}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {!isExpanded && day.events.length > 2 ? (
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
            </>
          )}
        </div>

        {showUpcoming && upcomingEvents.length > 0 ? (
          <div
            className="rounded-3xl border p-4 lg:w-64 lg:flex-none"
            style={{ borderColor }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-[0.3em]"
              style={{ color: mutedColor }}
            >
              Kommende hendelser
            </p>
            <div className="mt-3 space-y-2">
              {upcomingEvents.map(({ date, event }) => (
                <div
                  key={event.id}
                  className="rounded-2xl border px-3 py-2"
                  style={{ borderColor }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: mutedColor }}
                  >
                    {new Intl.DateTimeFormat("nb-NO", {
                      weekday: "short",
                      day: "numeric",
                    }).format(date)}
                  </p>
                  <p className="text-sm font-semibold">{event.title}</p>
                  {event.time && (
                    <p className="text-xs" style={{ color: mutedColor }}>
                      {event.time}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

