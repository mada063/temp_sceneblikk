"use client";

import { useMemo } from "react";
import type { CalendarProps } from "./types";
import { hexToRgba, getReadableTextColor, makeDateKey } from "./utils";
import { useCalendarAppearanceColors } from "../../hooks/useAppearanceColors";
import { useI18n } from "../../../lib/i18n";

export function CalendarSmall({ appearance, eventsByDate }: CalendarProps) {
  const { t } = useI18n();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  const {
    textColor,
    accentColor,
    borderColor,
    mutedColor,
    highlightColor: todayHighlight,
    accentTextColor,
  } = useCalendarAppearanceColors(appearance);

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

