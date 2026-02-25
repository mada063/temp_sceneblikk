import type { CellAppearance } from "../../../lib/layout-types";

export type SolarProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  orientation?: "landscape" | "portrait";
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type SolarData = {
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  dawn: Date;
  dusk: Date;
  dayLengthMinutes: number;
  /** Next notable event after now: "sunrise" | "sunset" | "dawn" | "dusk" | null (night) */
  nextEvent: "sunrise" | "sunset" | "dawn" | "dusk" | null;
  nextEventTime: Date | null;
};
