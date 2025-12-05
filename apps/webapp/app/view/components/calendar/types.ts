import type { CellAppearance } from "../../../lib/layout-types";

export type CalendarProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: "portrait" | "landscape";
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type CalendarEvent = {
  id: string;
  title: string;
  time?: string;
  category?: string;
  color?: string;
};

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  events: CalendarEvent[];
};

