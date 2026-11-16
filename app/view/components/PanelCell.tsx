"use client";

import { ComponentRenderer } from "./ComponentRenderer";
import { usePanelCycle } from "../hooks/usePanelCycle";
import type { PanelEntry, CellAppearance, Orientation } from "../../lib/layout-types";
import { cloneAppearance } from "../../lib/layout-types";
import { mergeServerAppearance } from "./server/appearance-merge";

type PanelCellProps = {
  panelEntries: PanelEntry[];
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: Orientation;
};

/**
 * Cell component for panels that cycles through multiple entries.
 */
export function PanelCell({
  panelEntries,
  appearance,
  colSpan,
  rowSpan,
  totalGridSize,
  orientation,
}: PanelCellProps) {
  const { activeEntry } = usePanelCycle(
    panelEntries.length > 1 ? panelEntries : undefined,
  );

  // If there's only one entry or no active entry, render the first one
  const entryToRender = panelEntries.length > 1 && activeEntry
    ? activeEntry
    : panelEntries[0];

  if (!entryToRender) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <span
          className="text-sm font-semibold uppercase tracking-[0.24em]"
          style={{ color: appearance.textColor }}
        >
          Panel
        </span>
        <span
          className="text-xs"
          style={{ color: appearance.textColor, opacity: 0.6 }}
        >
          Empty
        </span>
      </div>
    );
  }

  // Use entry's appearance if it exists, otherwise fall back to panel's appearance
  // If entry has appearance, merge it with panel appearance as base (entry settings override panel settings)
  // We clone the entry's appearance to ensure we have a complete object, falling back to panel appearance if cloning fails
  const entryAppearance: CellAppearance =
    entryToRender.componentId === "server"
      ? mergeServerAppearance(appearance, entryToRender.appearance)
      : entryToRender.appearance
        ? (() => {
            const cloned = cloneAppearance(entryToRender.appearance);
            return cloned ? { ...appearance, ...cloned } : appearance;
          })()
        : appearance;

  return (
    <ComponentRenderer
      componentId={entryToRender.componentId}
      appearance={entryAppearance}
      panelEntries={panelEntries.length > 1 ? panelEntries : undefined}
      colSpan={colSpan}
      rowSpan={rowSpan}
      totalGridSize={totalGridSize}
      orientation={orientation}
    />
  );
}



