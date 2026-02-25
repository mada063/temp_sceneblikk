"use client";

import { PLACEHOLDER_MAP } from "../../lib/placeholders";
import type { CellAppearance, PanelEntry, Orientation } from "../../lib/layout-types";
import { FREEFORM_COMPONENT_ID } from "../../editor/utils/grid";
import { Clock } from "./Clock";
import { Weather } from "./weather";
import { News } from "./news";
import { Announcements } from "./announcements";
import { Branding } from "./branding";
import { Transport } from "./transport";
import { Media } from "./media";
import { Charts } from "./charts";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { Server } from "./server";
import { Solar } from "./solar";
import { Garbage } from "./garbage";
import { Power } from "./power";
import { useI18n } from "../../lib/i18n";

type ComponentRendererProps = {
  componentId: string;
  appearance: CellAppearance;
  panelEntries?: PanelEntry[];
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: Orientation;
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
  orientation,
}: ComponentRendererProps) {
  const { locale } = useI18n();
  // Dedicated implementation for the clock component
  if (componentId === "clock") {
    return (
      <Clock
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the weather component
  if (componentId === "weather") {
    return (
      <Weather
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the news component
  if (componentId === "news") {
    return (
      <News
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the announcements component
  if (componentId === "announcement") {
    return (
      <Announcements
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the branding component
  if (componentId === "brand") {
    return (
      <Branding
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the transport component
  if (componentId === "transport") {
    return (
      <Transport
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the calendar component
  if (componentId === "calendar") {
    return (
      <Calendar
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
        orientation={orientation}
      />
    );
  }

  // Dedicated implementation for the tasks component
  if (componentId === "tasks") {
    return (
      <Tasks
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
        orientation={orientation}
      />
    );
  }

  // Dedicated implementation for the media component
  if (componentId === "media") {
    return (
      <Media
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the charts component
  if (componentId === "charts") {
    return (
      <Charts
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
        orientation={orientation}
      />
    );
  }

  // Dedicated implementation for the server component
  if (componentId === "server") {
    return (
      <Server
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the solar component
  if (componentId === "solar") {
    return (
      <Solar
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the garbage component
  if (componentId === "garbage") {
    return (
      <Garbage
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
  }

  // Dedicated implementation for the power component
  if (componentId === "power") {
    return (
      <Power
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
      />
    );
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
          {locale === "nb" && placeholder.labelNb
            ? placeholder.labelNb
            : placeholder.label}
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

