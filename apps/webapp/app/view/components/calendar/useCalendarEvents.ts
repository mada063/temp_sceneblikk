"use client";

import { useEffect, useMemo, useState } from "react";

import type { CellAppearance } from "../../../lib/layout-types";
import type { CalendarEvent } from "./types";
import {
  buildSampleEvents,
  formatEventTimeLabel,
  makeDateKey,
  parseColorPalette,
} from "./utils";

const POLL_INTERVAL_MS = 30 * 60 * 1000;

export type CalendarMonth = {
  year: number;
  month: number;
};

type GoogleCalendarEvent = {
  id: string;
  summary: string;
  start: string;
  end?: string | null;
  allDay?: boolean;
};

function mergeDemoEvents(
  months: CalendarMonth[],
  eventPalette: string[],
): Record<string, CalendarEvent[]> {
  return months.reduce<Record<string, CalendarEvent[]>>(
    (acc, { year, month }) => ({
      ...acc,
      ...buildSampleEvents(year, month, eventPalette),
    }),
    {},
  );
}

function mapGoogleEvents(
  incomingEvents: GoogleCalendarEvent[],
  eventPalette: string[],
): Record<string, CalendarEvent[]> {
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

  return next;
}

async function fetchGoogleCalendarMonth(
  year: number,
  month: number,
  calendarId: string | undefined,
  signal: AbortSignal,
): Promise<GoogleCalendarEvent[]> {
  const params = new URLSearchParams({
    year: String(year),
    month: String(month),
  });
  if (calendarId && calendarId.trim() !== "") {
    params.set("calendarId", calendarId.trim());
  }

  const response = await fetch(`/api/google/calendar?${params.toString()}`, {
    signal,
  });

  if (!response.ok) {
    throw new Error("Google Calendar API returned non-OK response");
  }

  const data: { events?: GoogleCalendarEvent[] } = await response.json();
  return data.events ?? [];
}

export function useCalendarEvents(
  appearance: CellAppearance,
  months: CalendarMonth[],
) {
  const primaryMonth = months[0];
  const eventPalette = useMemo(
    () => parseColorPalette(appearance.calendarEventPalette),
    [appearance.calendarEventPalette],
  );

  const [eventsByDate, setEventsByDate] = useState<Record<string, CalendarEvent[]>>(
    () =>
      appearance.calendarProvider === "google"
        ? {}
        : mergeDemoEvents(months, eventPalette),
  );

  const monthsKey = months
    .map(({ year, month }) => `${year}-${month}`)
    .join(",");

  useEffect(() => {
    if (!primaryMonth) {
      return;
    }

    if (appearance.calendarProvider !== "google") {
      setEventsByDate(mergeDemoEvents(months, eventPalette));
      return;
    }

    const abortController = new AbortController();

    const load = async (controller: AbortController = abortController) => {
      try {
        const results = await Promise.all(
          months.map(({ year, month }) =>
            fetchGoogleCalendarMonth(
              year,
              month,
              appearance.calendarId,
              controller.signal,
            ),
          ),
        );

        const incomingEvents = results.flat();
        if (incomingEvents.length === 0) {
          setEventsByDate({});
          return;
        }

        setEventsByDate(mapGoogleEvents(incomingEvents, eventPalette));
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        // eslint-disable-next-line no-console
        console.error(
          "Failed to load Google Calendar events, falling back to demo data:",
          error,
        );
        setEventsByDate(mergeDemoEvents(months, eventPalette));
      }
    };

    load();

    const intervalId = setInterval(() => {
      const intervalAbortController = new AbortController();
      load(intervalAbortController);
    }, POLL_INTERVAL_MS);

    return () => {
      abortController.abort();
      clearInterval(intervalId);
    };
  }, [
    appearance.calendarProvider,
    appearance.calendarId,
    eventPalette,
    months,
    monthsKey,
    primaryMonth,
  ]);

  return eventsByDate;
}
