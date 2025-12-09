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
  FiType,
  FiVideo,
} from "react-icons/fi";

export type PlaceholderDefinition = {
  id: string;
  label: string;
  description: string;
  // Loosely typed to avoid react-icons vs local React type incompatibilities
  icon: any;
  // Optional Norwegian variants for labels/descriptions
  labelNb?: string;
  descriptionNb?: string;
};

export const PLACEHOLDER_LIBRARY: PlaceholderDefinition[] = [
  {
    id: "announcement",
    label: "Announcements",
    description: "Text callouts and rich messaging",
    labelNb: "Kunngjøringer",
    descriptionNb: "Tekstfelt og rike meldinger",
    icon: FiType,
  },
  {
    id: "brand",
    label: "Branding",
    description: "Logos, identity elements, QR codes",
    labelNb: "Profilering",
    descriptionNb: "Logoer, profilelementer og QR-koder",
    icon: FiImage,
  },
  {
    id: "charts",
    label: "Charts",
    description: "Data visualizations and graphs",
    labelNb: "Diagrammer",
    descriptionNb: "Datavisualisering og grafer",
    icon: FiBarChart2,
  },
  {
    id: "clock",
    label: "Clock",
    description: "Digital clocks or countdown timers",
    labelNb: "Klokke",
    descriptionNb: "Digitale klokker eller nedtellere",
    icon: FiClock,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Monthly overview with key events",
    labelNb: "Kalender",
    descriptionNb: "Månedsoversikt med nøkkelhendelser",
    icon: FiCalendar,
  },
  {
    id: "map",
    label: "Wayfinding",
    description: "Interactive or static maps",
    labelNb: "Veifinning",
    descriptionNb: "Interaktive eller statiske kart",
    icon: FiMapPin,
  },
  {
    id: "media",
    label: "Media",
    description: "Video or image carousels",
    labelNb: "Media",
    descriptionNb: "Video- eller bildekarruseller",
    icon: FiVideo,
  },
  {
    id: "news",
    label: "News ticker",
    description: "RSS headlines or custom tickers",
    labelNb: "Nyhetsticker",
    descriptionNb: "RSS-overskrifter eller egendefinerte tickere",
    icon: FiActivity,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Task lists and to-do items",
    labelNb: "Oppgaver",
    descriptionNb: "Oppgavelister og gjøremål",
    icon: FiCheckSquare,
  },
  {
    id: "transport",
    label: "Transport",
    description: "Public transport departures",
    labelNb: "Transport",
    descriptionNb: "Avganger for kollektivtrafikk",
    icon: FiNavigation,
  },
  {
    id: "weather",
    label: "Weather",
    description: "Forecasts and live weather cards",
    labelNb: "Vær",
    descriptionNb: "Værvarsel og sanntidsværkort",
    icon: FiCloud,
  },
  {
    id: "server",
    label: "Server",
    description: "Server status and monitoring",
    labelNb: "Server",
    descriptionNb: "Serverstatus og overvåking",
    icon: FiServer,
  },
];

export const PLACEHOLDER_MAP: Record<string, PlaceholderDefinition> =
  PLACEHOLDER_LIBRARY.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, PlaceholderDefinition>);

