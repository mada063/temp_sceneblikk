import { IconType } from "react-icons";
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
  FiType,
  FiVideo,
} from "react-icons/fi";

export type PlaceholderDefinition = {
  id: string;
  label: string;
  description: string;
  icon: IconType;
};

export const PLACEHOLDER_LIBRARY: PlaceholderDefinition[] = [
  {
    id: "announcement",
    label: "Announcements",
    description: "Text callouts and rich messaging",
    icon: FiType,
  },
  {
    id: "brand",
    label: "Branding",
    description: "Logos, identity elements, QR codes",
    icon: FiImage,
  },
  {
    id: "charts",
    label: "Charts",
    description: "Data visualizations and graphs",
    icon: FiBarChart2,
  },
  {
    id: "clock",
    label: "Clock",
    description: "Digital clocks or countdown timers",
    icon: FiClock,
  },
  {
    id: "calendar",
    label: "Calendar",
    description: "Monthly overview with key events",
    icon: FiCalendar,
  },
  {
    id: "map",
    label: "Wayfinding",
    description: "Interactive or static maps",
    icon: FiMapPin,
  },
  {
    id: "media",
    label: "Media",
    description: "Video or image carousels",
    icon: FiVideo,
  },
  {
    id: "news",
    label: "News ticker",
    description: "RSS headlines or custom tickers",
    icon: FiActivity,
  },
  {
    id: "tasks",
    label: "Tasks",
    description: "Task lists and to-do items",
    icon: FiCheckSquare,
  },
  {
    id: "transport",
    label: "Transport",
    description: "Public transport departures",
    icon: FiNavigation,
  },
  {
    id: "weather",
    label: "Weather",
    description: "Forecasts and live weather cards",
    icon: FiCloud,
  },
];

export const PLACEHOLDER_MAP: Record<string, PlaceholderDefinition> =
  PLACEHOLDER_LIBRARY.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, PlaceholderDefinition>);

