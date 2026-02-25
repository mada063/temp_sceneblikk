import type { CellAppearance } from "../../../lib/layout-types";

export type GarbageProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: "landscape" | "portrait";
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

/** Icon key for mapping to react-icons (restavfall, matavfall, papir, glass, default) */
export type GarbageIconKey = "restavfall" | "matavfall" | "papir" | "glass" | "default";

export type GarbagePickup = {
  id: string;
  label: string;
  /** Next occurrence (start of day) */
  nextDate: Date;
  /** "today" | "tomorrow" | "in N days" | weekday name */
  labelRelative: string;
  /** Icon type for display */
  iconKey: GarbageIconKey;
};
