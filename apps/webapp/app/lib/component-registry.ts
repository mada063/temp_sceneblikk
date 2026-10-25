import {
  FiActivity,
  FiBarChart2,
  FiCalendar,
  FiCheckSquare,
  FiCloud,
  FiClock,
  FiImage,
  FiMapPin,
  FiNavigation,
  FiServer,
  FiSun,
  FiTrash2,
  FiType,
  FiVideo,
  FiZap,
} from "react-icons/fi";

import type { GridCell } from "./layout-types";

export type ComponentDefinition = {
  id: string;
  label: string;
  description: string;
  icon: any;
  labelNb?: string;
  descriptionNb?: string;
  /** When true, the view player renders a live component instead of a placeholder. */
  implemented: boolean;
  /** When true, orientation is passed from layout config to the view component. */
  supportsOrientation?: boolean;
};

export const COMPONENT_LIBRARY: ComponentDefinition[] = [
  {
    id: "announcement",
    label: "Announcements",
    description: "Text callouts and rich messaging",
    labelNb: "Kunngjøringer",
    descriptionNb: "Tekstfelt og rike meldinger",
    icon: FiType,
    implemented: true,
  },
  {
    id: "brand",
    label: "Branding",
    description: "Logos, identity elements, QR codes",
    labelNb: "Profilering",
    descriptionNb: "Logoer, profilelementer og QR-koder",
    icon: FiImage,
    implemented: true,
  },
  {
    id: "charts",
    label: "Charts",
    description: "Data visualizations and graphs",
    labelNb: "Diagrammer",
    descriptionNb: "Datavisualisering og grafer",
    icon: FiBarChart2,
    implemented: true,
    supportsOrientation: true,
  },
  {
    id: "clock",
    label: "Clock",
    description: "Digital clocks or countdown timers",
    labelNb: "Klokke",
    descriptionNb: "Digitale klokker eller nedtellere",
    icon: FiClock,
    implemented: true,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Monthly overview with key events",
    labelNb: "Kalender",
    descriptionNb: "Månedsoversikt med nøkkelhendelser",
    icon: FiCalendar,
    implemented: true,
    supportsOrientation: true,
  },
  {
    id: "map",
    label: "Wayfinding",
    description: "Interactive or static maps",
    labelNb: "Veifinning",
    descriptionNb: "Interaktive eller statiske kart",
    icon: FiMapPin,
    implemented: false,
  },
  {
    id: "media",
    label: "Media",
    description: "Video or image carousels",
    labelNb: "Media",
    descriptionNb: "Video- eller bildekarruseller",
    icon: FiVideo,
    implemented: true,
  },
  {
    id: "news",
    label: "News ticker",
    description: "RSS headlines or custom tickers",
    labelNb: "Nyhetsticker",
    descriptionNb: "RSS-overskrifter eller egendefinerte tickere",
    icon: FiActivity,
    implemented: true,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Task lists and to-do items",
    labelNb: "Oppgaver",
    descriptionNb: "Oppgavelister og gjøremål",
    icon: FiCheckSquare,
    implemented: true,
    supportsOrientation: true,
  },
  {
    id: "transport",
    label: "Transport",
    description: "Public transport departures",
    labelNb: "Transport",
    descriptionNb: "Avganger for kollektivtrafikk",
    icon: FiNavigation,
    implemented: true,
  },
  {
    id: "weather",
    label: "Weather",
    description: "Forecasts and live weather cards",
    labelNb: "Vær",
    descriptionNb: "Værvarsel og sanntidsværkort",
    icon: FiCloud,
    implemented: true,
  },
  {
    id: "server",
    label: "Server",
    description: "Server status and monitoring",
    labelNb: "Server",
    descriptionNb: "Serverstatus og overvåking",
    icon: FiServer,
    implemented: true,
  },
  {
    id: "solar",
    label: "Solar",
    description: "Sunrise, sunset and day length",
    labelNb: "Sol",
    descriptionNb: "Soloppgang, solnedgang og dagslengde",
    icon: FiSun,
    implemented: true,
  },
  {
    id: "garbage",
    label: "Garbage",
    description: "Garbage and recycling pickup schedule",
    labelNb: "Søppel",
    descriptionNb: "Tømmedager for avfall og gjenvinning",
    icon: FiTrash2,
    implemented: true,
  },
  {
    id: "power",
    label: "Power",
    description: "Electricity spot price (Norway)",
    labelNb: "Strøm",
    descriptionNb: "Strømpris spot (Norge)",
    icon: FiZap,
    implemented: true,
  },
];

export const COMPONENT_MAP: Record<string, ComponentDefinition> =
  COMPONENT_LIBRARY.reduce(
    (acc, item) => {
      acc[item.id] = item;
      return acc;
    },
    {} as Record<string, ComponentDefinition>,
  );

export const IMPLEMENTED_COMPONENT_IDS = COMPONENT_LIBRARY.filter(
  (item) => item.implemented,
).map((item) => item.id);

export type ComponentSelectionContext = {
  canShowComponentOptions: boolean;
  effectiveComponentId: string | null;
  isFreeformSelected: boolean;
  componentId: string | null;
  allHaveSameComponent: boolean;
  panelEntries?: GridCell["panelEntries"];
};

/** Whether a component is selected directly or present inside a panel playlist. */
export function isComponentSelected(
  componentId: string,
  ctx: ComponentSelectionContext,
): boolean {
  const isDirect =
    ctx.canShowComponentOptions && ctx.effectiveComponentId === componentId;
  const hasInPanel =
    (ctx.isFreeformSelected ||
      (ctx.componentId === "freeform-region" && ctx.allHaveSameComponent)) &&
    !!ctx.panelEntries?.some((entry) => entry.componentId === componentId);
  return isDirect || hasInPanel;
}

export function buildComponentSelectionFlags(
  ctx: ComponentSelectionContext,
): Record<string, boolean> {
  return COMPONENT_LIBRARY.reduce(
    (acc, { id }) => {
      acc[id] = isComponentSelected(id, ctx);
      return acc;
    },
    {} as Record<string, boolean>,
  );
}

export function getComponentLabel(
  componentId: string,
  locale: "nb" | "en",
): string {
  const definition = COMPONENT_MAP[componentId];
  if (!definition) {
    return componentId;
  }
  return locale === "nb" && definition.labelNb
    ? definition.labelNb
    : definition.label;
}
