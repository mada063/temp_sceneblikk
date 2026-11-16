export type GarbageAppearance = {
  garbageEntries?: Array<{
    label: string;
    startDate: string;
    frequencyWeeks: number;
  }>;
  garbageSchedule?: string;
  garbageTimeFormat?: "12h" | "24h";
};

export const garbageAppearanceDefaults: Required<
  Pick<GarbageAppearance, "garbageEntries" | "garbageSchedule" | "garbageTimeFormat">
> = {
  garbageEntries: [
    { label: "Restavfall", startDate: "2024-01-03", frequencyWeeks: 1 },
    { label: "Matavfall", startDate: "2024-01-05", frequencyWeeks: 2 },
    { label: "Papir og plast", startDate: "2024-01-10", frequencyWeeks: 4 },
    { label: "Glass og metall", startDate: "2024-01-15", frequencyWeeks: 10 },
  ],
  garbageSchedule: "",
  garbageTimeFormat: "24h",
};
