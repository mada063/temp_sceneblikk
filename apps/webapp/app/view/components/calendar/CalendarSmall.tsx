"use client";

import { useEffect, useMemo, useState } from "react";
import type { CalendarProps, CalendarEvent } from "./types";
import {
  buildSampleEvents,
  hexToRgba,
  getReadableTextColor,
  parseColorPalette,
  makeDateKey,
  formatEventTimeLabel,
} from "./utils";
import { useI18n } from "../../../lib/i18n";

export function CalendarSmall({ appearance }: CalendarProps) {
  const { t } = useI18n();
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

  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>(() =>
    appearance.calendarProvider === "google"
      ? {}
      : buildSampleEvents(year, month, eventPalette),
  );

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

          const timeLabel = formatEventTimeLabel(
            startDate,
            rawEvent.end,
            rawEvent.allDay,
          );

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

  const todayEvents = useMemo(() => {
    const todayKey = makeDateKey(new Date(year, month, day));
    return eventsByDate[todayKey] ?? [];
  }, [year, month, day, eventsByDate]);

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
          {t("editor", "calendarHeaderLabel")}
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
              {t("editor", "calendarNoActivitiesToday")}
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
                      className="mt-2 inline-flex rounded-full px-2 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.2em]"
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

