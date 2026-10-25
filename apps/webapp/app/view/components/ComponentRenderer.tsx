"use client";

import { COMPONENT_MAP, getComponentLabel } from "../../lib/component-registry";
import type { CellAppearance, PanelEntry, Orientation } from "../../lib/layout-types";
import { FREEFORM_COMPONENT_ID } from "../../editor/utils/grid";
import { VIEW_COMPONENT_REGISTRY } from "./view-registry";
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

  const viewEntry = VIEW_COMPONENT_REGISTRY[componentId];
  if (viewEntry) {
    const ViewComponent = viewEntry.component;
    return (
      <ViewComponent
        appearance={appearance}
        colSpan={colSpan}
        rowSpan={rowSpan}
        totalGridSize={totalGridSize}
        orientation={viewEntry.supportsOrientation ? orientation : undefined}
      />
    );
  }

  if (componentId === FREEFORM_COMPONENT_ID && panelEntries && panelEntries.length > 1) {
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

  const placeholder = COMPONENT_MAP[componentId];
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
          {getComponentLabel(componentId, locale)}
        </span>
      </div>
    );
  }

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
