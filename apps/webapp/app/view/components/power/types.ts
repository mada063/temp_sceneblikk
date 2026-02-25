import type { CellAppearance } from "../../../lib/layout-types";

export type PowerProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: "landscape" | "portrait";
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type PowerHourPrice = {
  timeStart: string;
  timeEnd: string;
  NOK_per_kWh: number;
  EUR_per_kWh: number;
};

export type PowerData = {
  prices: PowerHourPrice[];
  area: string;
  /** Current or next hour index in prices */
  currentIndex: number;
  /** ISO date string for the day (YYYY-MM-DD) */
  date: string;
};

export type PowerAreaId = "NO1" | "NO2" | "NO3" | "NO4" | "NO5";

export const POWER_AREA_LABELS: Record<PowerAreaId, string> = {
  NO1: "Oslo / Øst-Norge",
  NO2: "Kristiansand / Sør-Norge",
  NO3: "Trondheim / Midt-Norge",
  NO4: "Tromsø / Nord-Norge",
  NO5: "Bergen / Vest-Norge",
};
