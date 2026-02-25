import { FiTrash2, FiPackage, FiBox, FiLayers } from "react-icons/fi";
import type { GarbagePickup, GarbageIconKey } from "./types";

export type GarbageIconComponent = React.ComponentType<{ className?: string; style?: React.CSSProperties }>;

const ICON_MAP: Record<GarbageIconKey, GarbageIconComponent> = {
  restavfall: FiTrash2 as GarbageIconComponent,
  matavfall: FiLayers as GarbageIconComponent,
  papir: FiPackage as GarbageIconComponent,
  glass: FiBox as GarbageIconComponent,
  default: FiTrash2 as GarbageIconComponent,
};

export function getGarbageIcon(iconKey: GarbageIconKey): GarbageIconComponent {
  return ICON_MAP[iconKey] ?? ICON_MAP.default;
}

const WEEKDAY_NAMES = ["Søn", "Man", "Tir", "Ons", "Tor", "Fre", "Lør"];

/**
 * Infer icon key from label (e.g. Restavfall -> restavfall, Matavfall -> matavfall).
 */
export function getGarbageIconKey(label: string): GarbageIconKey {
  const lower = label.toLowerCase();
  if (lower.includes("restavfall") || lower.includes("bosset")) return "restavfall";
  if (lower.includes("matavfall")) return "matavfall";
  if (lower.includes("papir") || lower.includes("plast") || lower.includes("papp")) return "papir";
  if (lower.includes("glass") || lower.includes("metall") || lower.includes("emballasje")) return "glass";
  return "default";
}

/**
 * Parse garbageSchedule string: one line per type "Label:YYYY-MM-DD:frequencyWeeks".
 * frequencyWeeks: 1=weekly, 2=biweekly, 4=every 4 weeks, 10=every 10 weeks.
 */
export function parseGarbageSchedule(
  schedule: string
): Array<{ label: string; startDate: Date; frequencyWeeks: number }> {
  if (!schedule || !schedule.trim()) return [];
  const lines = schedule.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
  const result: Array<{ label: string; startDate: Date; frequencyWeeks: number }> = [];
  const seen = new Set<string>();

  for (const line of lines) {
    const parts = line.split(":");
    if (parts.length < 3) continue;
    const label = parts.slice(0, -2).join(":").trim();
    const dateStr = parts[parts.length - 2]?.trim() ?? "";
    const freq = Number(parts[parts.length - 1]?.trim());
    if (![1, 2, 4, 10].includes(freq)) continue;
    const startDate = new Date(dateStr);
    if (Number.isNaN(startDate.getTime())) continue;
    startDate.setHours(0, 0, 0, 0);
    const key = `${label}:${dateStr}:${freq}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ label, startDate, frequencyWeeks: freq });
  }

  return result;
}

/** Parse schedule string into entries with startDate as YYYY-MM-DD (for editor). */
export function parseGarbageScheduleToEntries(schedule: string): GarbageEntryInput[] {
  const parsed = parseGarbageSchedule(schedule);
  return parsed.map((p) => ({
    label: p.label,
    startDate: p.startDate.toISOString().slice(0, 10),
    frequencyWeeks: p.frequencyWeeks,
  }));
}

/**
 * Get next occurrence from start date with given frequency (in weeks).
 */
function nextOccurrenceFixed(from: Date, startDate: Date, frequencyWeeks: number): Date {
  const fromDay = new Date(from);
  fromDay.setHours(0, 0, 0, 0);
  const fromTime = fromDay.getTime();
  const startTime = startDate.getTime();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const periodMs = frequencyWeeks * weekMs;

  if (fromTime <= startTime) return new Date(startDate);

  const elapsed = fromTime - startTime;
  const periods = Math.ceil(elapsed / periodMs);
  const next = new Date(startTime + periods * periodMs);
  next.setHours(0, 0, 0, 0);
  return next;
}

export type GarbageEntryInput = { label: string; startDate: string; frequencyWeeks: number };

/** Build schedule string from structured entries (for backward compat / fallback). */
export function entriesToSchedule(entries: GarbageEntryInput[]): string {
  return entries
    .filter((e) => e.label.trim() && e.startDate && [1, 2, 4, 10].includes(e.frequencyWeeks))
    .map((e) => `${e.label}:${e.startDate}:${e.frequencyWeeks}`)
    .join("\n");
}

export function getNextPickupsFromEntries(
  entries: GarbageEntryInput[],
  from: Date = new Date(),
  maxItems: number = 10
): GarbagePickup[] {
  const schedule = entriesToSchedule(entries);
  return getNextPickups(schedule, from, maxItems);
}

export function getNextPickups(
  schedule: string,
  from: Date = new Date(),
  maxItems: number = 10
): GarbagePickup[] {
  const parsed = parseGarbageSchedule(schedule);
  const today = new Date(from);
  today.setHours(0, 0, 0, 0);
  const pickups: GarbagePickup[] = [];

  for (let i = 0; i < parsed.length; i++) {
    const { label, startDate, frequencyWeeks } = parsed[i];
    const nextDate = nextOccurrenceFixed(from, startDate, frequencyWeeks);
    const labelRelative = formatRelative(nextDate, today);
    pickups.push({
      id: `${label}-${frequencyWeeks}-${i}`,
      label,
      nextDate,
      labelRelative,
      iconKey: getGarbageIconKey(label),
    });
  }

  pickups.sort((a, b) => a.nextDate.getTime() - b.nextDate.getTime());
  return pickups.slice(0, maxItems);
}

function formatRelative(next: Date, today: Date): string {
  const nextDay = new Date(next);
  nextDay.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();
  const nextTime = nextDay.getTime();
  const diffDays = Math.round((nextTime - todayTime) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) return "I dag";
  if (diffDays === 1) return "I morgen";
  if (diffDays >= 2 && diffDays <= 6) return `Om ${diffDays} dager`;
  return WEEKDAY_NAMES[next.getDay()];
}

export function formatGarbageDate(date: Date, _format: "12h" | "24h"): string {
  return date.toLocaleDateString("nb-NO", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}
