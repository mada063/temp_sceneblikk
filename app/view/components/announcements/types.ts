import type { CellAppearance } from "../../../lib/layout-types";

export type AnnouncementsProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
};

export type AnnouncementItem = {
  id: string;
  title: string;
  message: string;
  type?: "info" | "warning" | "error" | "success";
  icon?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";



