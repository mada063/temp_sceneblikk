"use client";

import type { ChangeEvent } from "react";

import { FiTrash2 } from "react-icons/fi";

import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import type { PanelEntry } from "../../lib/layout-types";

type PanelPlaybackPanelProps = {
  entries: PanelEntry[];
  totalDuration: number;
  onDurationChange: (
    entryId: string,
  ) => (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveEntry: (entryId: string) => void;
};

export function PanelPlaybackPanel({
  entries,
  totalDuration,
  onDurationChange,
  onRemoveEntry,
}: PanelPlaybackPanelProps) {
  if (entries.length <= 1) {
    return null;
  }

  return (
    <div className="glass-surface rounded-3xl border border-white/40 p-6 shadow-lg dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-custom-color-600 dark:text-custom-color-200">
          Panel playback
        </h3>
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-800 dark:bg-custom-color-700/60 dark:text-custom-color-50">
          Cycle · {totalDuration}s
        </span>
      </div>
      <p className="mt-2 text-xs text-custom-color-700/80 dark:text-custom-color-100/70">
        Adjust each componentʼs duration. The panel loops through this order continuously.
      </p>
      <div className="mt-4 space-y-3">
        {entries.map((entry, index) => {
          const definition = PLACEHOLDER_MAP[entry.componentId];
          const label = definition?.label ?? entry.componentId;
          return (
            <div
              key={entry.id}
              className="flex flex-col gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white shadow-sm transition dark:border-white/10 dark:bg-custom-color-800/60 sm:flex-row sm:items-center sm:gap-4"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-semibold uppercase tracking-[0.16em] text-custom-color-900 dark:bg-custom-color-700/70 dark:text-custom-color-50">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-custom-color-900 dark:text-custom-color-50">
                    {label}
                  </p>
                  <p className="text-xs uppercase tracking-[0.18em] text-custom-color-700/70 dark:text-custom-color-200/60">
                    {entry.duration}s display
                  </p>
                </div>
              </div>
              <div className="flex flex-1 flex-wrap items-center gap-3 sm:justify-end">
                <label className="flex items-center gap-2 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white shadow dark:bg-black/50">
                  Duration (s)
                  <input
                    type="number"
                    min={1}
                    max={86400}
                    value={entry.duration}
                    onChange={onDurationChange(entry.id)}
                    className="w-20 rounded-md border border-white/30 bg-black/20 px-2 py-1 text-sm text-white focus:border-custom-color-400 focus:outline-none dark:border-white/20 dark:bg-black/40"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => onRemoveEntry(entry.id)}
                  className="inline-flex items-center gap-1 rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/50 dark:bg-black/50 dark:hover:bg-black/70"
                >
                  <FiTrash2 className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

