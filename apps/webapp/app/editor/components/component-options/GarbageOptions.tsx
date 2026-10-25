"use client";

import { useI18n } from "../../../lib/i18n";
import { FiPlus, FiX } from "react-icons/fi";
import { parseGarbageScheduleToEntries } from "../../../view/components/garbage/utils";

const PlusIcon = FiPlus as React.ComponentType<{ className?: string }>;
const XIcon = FiX as React.ComponentType<{ className?: string }>;
import type { ComponentOptionsContext } from "./types";

export function GarbageOptions({ appearance, onAppearanceChange
}: ComponentOptionsContext
) {
  const { t } = useI18n();
  return (
  <div className="mt-4 space-y-3 border-t border-custom-color-300/40 pt-3 text-[0.6875rem]">
    <p className="font-semibold uppercase tracking-[0.16em] text-custom-color-600 dark:text-custom-color-200">
      Søppel
    </p>
    {(() => {
      const defaultEntries = [
        { label: "Restavfall", startDate: "2024-01-03", frequencyWeeks: 1 },
        { label: "Matavfall", startDate: "2024-01-05", frequencyWeeks: 2 },
        { label: "Papir og plast", startDate: "2024-01-10", frequencyWeeks: 4 },
        { label: "Glass og metall", startDate: "2024-01-15", frequencyWeeks: 10 },
      ];
      const effectiveEntries =
        appearance.garbageEntries?.length
          ? appearance.garbageEntries
          : appearance.garbageSchedule
            ? parseGarbageScheduleToEntries(appearance.garbageSchedule)
            : defaultEntries;
      const frequencyOptions = [
        { value: 1, label: "Ukentlig" },
        { value: 2, label: "Hver 14. dag" },
        { value: 4, label: "Hver 4. uke" },
        { value: 10, label: "Hver 10. uke" },
      ];
      const labelOptions = ["Restavfall", "Matavfall", "Papir og plast", "Glass og metall"];
      return (
        <div className="space-y-3">
          {effectiveEntries.map((entry, index) => (
            <div
              key={`${entry.label}-${index}`}
              className="flex flex-wrap items-end gap-2 rounded-lg border border-custom-color-300/50 bg-white/50 p-2 dark:bg-custom-color-800/50"
            >
              <label className="flex-1 min-w-[6rem]">
                <span className="mb-1 block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-custom-color-600 dark:text-custom-color-200">
                  Type
                </span>
                <select
                  value={entry.label}
                  onChange={(e) => {
                    const next = [...effectiveEntries];
                    next[index] = { ...next[index], label: e.target.value };
                    onAppearanceChange({ garbageEntries: next });
                  }}
                  className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-2 py-1.5 text-sm font-medium text-custom-color-800 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                >
                  {labelOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex-1 min-w-[5rem]">
                <span className="mb-1 block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-custom-color-600 dark:text-custom-color-200">
                  Første dato
                </span>
                <input
                  type="date"
                  value={entry.startDate}
                  onChange={(e) => {
                    const next = [...effectiveEntries];
                    next[index] = { ...next[index], startDate: e.target.value };
                    onAppearanceChange({ garbageEntries: next });
                  }}
                  className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-2 py-1.5 text-sm font-medium text-custom-color-800 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                />
              </label>
              <label className="flex-1 min-w-[5rem]">
                <span className="mb-1 block text-[0.5625rem] font-semibold uppercase tracking-[0.12em] text-custom-color-600 dark:text-custom-color-200">
                  Frekvens
                </span>
                <select
                  value={entry.frequencyWeeks}
                  onChange={(e) => {
                    const next = [...effectiveEntries];
                    next[index] = { ...next[index], frequencyWeeks: Number(e.target.value) };
                    onAppearanceChange({ garbageEntries: next });
                  }}
                  className="w-full rounded-lg border border-custom-color-300/50 bg-white/80 px-2 py-1.5 text-sm font-medium text-custom-color-800 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-50"
                >
                  {frequencyOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => {
                  const next = effectiveEntries.filter((_, i) => i !== index);
                  onAppearanceChange({
                    garbageEntries: next.length ? next : undefined,
                    garbageSchedule: next.length ? undefined : "",
                  });
                }}
                className="rounded-lg border border-custom-color-300/50 bg-white/80 p-1.5 text-custom-color-600 hover:bg-custom-color-100 dark:border-white/10 dark:bg-custom-color-800/80 dark:text-custom-color-200 dark:hover:bg-custom-color-700"
                aria-label="Fjern"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const next = [
                ...effectiveEntries,
                { label: "Restavfall", startDate: new Date().toISOString().slice(0, 10), frequencyWeeks: 1 },
              ];
              onAppearanceChange({ garbageEntries: next });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-custom-color-300/50 bg-white/50 py-2 text-sm font-medium text-custom-color-600 hover:bg-custom-color-100 dark:border-white/10 dark:bg-custom-color-800/50 dark:text-custom-color-200 dark:hover:bg-custom-color-700"
          >
            <PlusIcon className="h-4 w-4" />
            Legg til tømmedag
          </button>
        </div>
      );
    })()}
  </div>
  );
}
