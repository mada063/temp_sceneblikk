import type { CalendarEvent, CalendarDay } from "./types";

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const DEFAULT_EVENT_COLORS = [
  "#d8b4fe",
  "#bfdbfe",
  "#fecdd3",
  "#fde68a",
  "#bbf7d0",
];

export function createCalendarDays(
  year: number,
  month: number,
  eventsByDate: Record<string, CalendarEvent[]>,
): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const leadingOffset = (firstOfMonth.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: CalendarDay[] = [];

  for (let offset = leadingOffset; offset > 0; offset -= 1) {
    const date = new Date(year, month, 1 - offset);
    days.push({
      date,
      isCurrentMonth: false,
      events: [],
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const key = makeDateKey(date);
    days.push({
      date,
      isCurrentMonth: true,
      events: eventsByDate[key] ?? [],
    });
  }

  return days;
}

export function buildSampleEvents(
  year: number,
  month: number,
  palette: string[],
): Record<string, CalendarEvent[]> {
  const colors = palette.length > 0 ? palette : DEFAULT_EVENT_COLORS;
  const blueprint: Array<{
    day: number;
    events: Array<Omit<CalendarEvent, "id" | "color">>;
  }> = [
    {
      day: 3,
      events: [
        { title: "Frokostmøte", time: "08:30", category: "Team" },
        { title: "Sprintplan", time: "13:00", category: "Prosjekt" },
      ],
    },
    {
      day: 7,
      events: [
        { title: "Workshop med kunde", time: "10:00", category: "Kunde" },
        { title: "Statusrunde", time: "14:30", category: "Team" },
        { title: "Lanseringsmøte", time: "19:00", category: "Lansering" },
      ],
    },
    {
      day: 12,
      events: [
        { title: "Innholdssprint", time: "09:00", category: "Innhold" },
        { title: "Design review", time: "15:00", category: "Design" },
      ],
    },
    {
      day: 18,
      events: [{ title: "All-hands", time: "11:00", category: "Team" }],
    },
    {
      day: 23,
      events: [
        { title: "Photoshoot", time: "09:30", category: "Produksjon" },
        { title: "Ettermiddagskaffe", time: "15:15", category: "Sosialt" },
      ],
    },
    {
      day: 28,
      events: [
        { title: "Månedsrapport", time: "08:00", category: "Rapport" },
        { title: "Afterwork", time: "17:00", category: "Sosialt" },
        { title: "Kundemiddag", time: "19:30", category: "Kunde" },
      ],
    },
  ];

  const eventsByDate: Record<string, CalendarEvent[]> = {};
  blueprint.forEach(({ day, events }) => {
    const date = new Date(year, month, day);
    if (date.getMonth() !== month) return;

    const key = makeDateKey(date);
    eventsByDate[key] = events.map((event, index) => ({
      ...event,
      id: `${key}-${index}`,
      color: colors[(day + index) % colors.length],
    }));
  });

  return eventsByDate;
}

export function makeDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatClockTime(date: Date) {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function formatEventTimeLabel(
  start: Date,
  end?: Date | string | null,
  allDay?: boolean,
): string | undefined {
  if (allDay) {
    return undefined;
  }

  const startLabel = formatClockTime(start);
  if (!end) {
    return startLabel;
  }

  const endDate = end instanceof Date ? end : new Date(end);
  if (Number.isNaN(endDate.getTime())) {
    return startLabel;
  }

  return `${startLabel} – ${formatClockTime(endDate)}`;
}

export function hexToRgba(color: string | undefined, alpha: number) {
  if (!color) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  let hex = color.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6 || Number.isNaN(Number(`0x${hex}`))) {
    return `rgba(255, 255, 255, ${alpha})`;
  }
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function parseColorPalette(input?: string): string[] {
  if (!input) {
    return DEFAULT_EVENT_COLORS;
  }
  return input
    .split(/[\s,]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
}

export function hexToRgb(color: string | undefined) {
  if (!color) {
    return null;
  }
  let hex = color.trim();
  if (hex.startsWith("#")) {
    hex = hex.slice(1);
  }
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  if (hex.length !== 6 || Number.isNaN(Number(`0x${hex}`))) {
    return null;
  }
  const value = Number.parseInt(hex, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function getReadableTextColor(color: string | undefined, fallback: string) {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return fallback;
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? "#0f172a" : "#ffffff";
}

/**
 * Get ISO week number for a date.
 * ISO week 1 is the first week with a Thursday (or equivalently, the week containing Jan 4).
 * Weeks start on Monday.
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}





