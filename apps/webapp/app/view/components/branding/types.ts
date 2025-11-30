import type { CellAppearance } from "../../../lib/layout-types";

export type BrandingProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";



