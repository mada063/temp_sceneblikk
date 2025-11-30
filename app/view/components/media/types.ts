import type { CellAppearance } from "../../../lib/layout-types";

export type MediaProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
};

export type MediaItem = {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  duration?: number; // Duration for video in seconds, or slide duration for images
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";


