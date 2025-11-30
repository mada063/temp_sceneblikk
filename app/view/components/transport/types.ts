import type { CellAppearance } from "../../../lib/layout-types";

export type TransportProps = {
  appearance: CellAppearance;
  colSpan?: number;
  rowSpan?: number;
  totalGridSize?: number;
  panelSize?: PanelSize;
};

export type PanelSize = "tiny" | "small" | "medium" | "large" | "xlarge";

export type Departure = {
  id: string;
  line: string;
  destination: string;
  scheduledDeparture: string;
  expectedDeparture?: string;
  delay?: number;
  platform?: string;
  serviceType?: string;
};

export type StopPlace = {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
};

export type TransportData = {
  stopPlace: StopPlace | null;
  departures: Departure[];
  lastUpdated: Date;
};



