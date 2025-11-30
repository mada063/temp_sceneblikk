import type { CellAppearance } from "../../../lib/layout-types";

export type WeatherProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  locationName?: string;
};

