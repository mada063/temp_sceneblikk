"use client";

import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import type { CellAppearance, PanelEntry } from "../../lib/layout-types";
import { FREEFORM_COMPONENT_ID } from "../../editor/utils/grid";
import { Clock } from "./Clock";
import { Weather } from "./Weather";

type ComponentRendererProps = {
  componentId: string;
  appearance: CellAppearance;
  panelEntries?: PanelEntry[];
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
};

/**
 * Renders components based on componentId.
 * Currently shows placeholders and a live clock, but can be extended to render
 * actual components like weather forecasts, bus routes, etc.
 */
export function ComponentRenderer({
  componentId,
  appearance,
  panelEntries,
  colSpan,
  rowSpan,
  totalGridSize,
}: ComponentRendererProps) {
  // Dedicated implementation for the clock component
  if (componentId === "clock") {
    return <Clock appearance={appearance} />;
  }

  // Dedicated implementation for the weather component
  if (componentId === "weather") {
    return <Weather appearance={appearance} colSpan={colSpan} rowSpan={rowSpan} totalGridSize={totalGridSize} />;
  }

  // Handle panels (freeform regions) that cycle through entries
  // This should only be called when rendering a panel with multiple entries
  if (componentId === FREEFORM_COMPONENT_ID && panelEntries && panelEntries.length > 1) {
    // Show indicator that this is a panel with multiple entries
    // The actual rendering will be handled by PanelCell
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
          {panelEntries.length} items
        </span>
      </div>
    );
  }

  // Render regular components (single components) as placeholders
  const placeholder = PLACEHOLDER_MAP[componentId];
  if (placeholder) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
        <placeholder.icon
          className="h-10 w-10"
          style={{ color: appearance.textColor }}
        />
        <span
          className="text-sm font-semibold uppercase tracking-[0.24em]"
          style={{ color: appearance.textColor }}
        >
          {placeholder.label}
        </span>
      </div>
    );
  }

  // Fallback for unknown components
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-center">
      <span
        className="text-sm font-semibold uppercase tracking-[0.24em]"
        style={{ color: appearance.textColor }}
      >
        {componentId}
      </span>
    </div>
  );
}

