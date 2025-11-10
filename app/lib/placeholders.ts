import { IconType } from "react-icons";
import {
  FiActivity,
  FiCloud,
  FiClock,
  FiImage,
  FiMapPin,
  FiType,
  FiVideo,
  FiZap,
} from "react-icons/fi";

export type PlaceholderDefinition = {
  id: string;
  label: string;
  description: string;
  icon: IconType;
};

export const PLACEHOLDER_LIBRARY: PlaceholderDefinition[] = [
  {
    id: "clock",
    label: "Clock",
    description: "Digital clocks or countdown timers",
    icon: FiClock,
  },
  {
    id: "weather",
    label: "Weather",
    description: "Forecasts and live weather cards",
    icon: FiCloud,
  },
  {
    id: "news",
    label: "News ticker",
    description: "RSS headlines or custom tickers",
    icon: FiActivity,
  },
  {
    id: "media",
    label: "Media",
    description: "Video or image carousels",
    icon: FiVideo,
  },
  {
    id: "announcement",
    label: "Announcements",
    description: "Text callouts and rich messaging",
    icon: FiType,
  },
  {
    id: "map",
    label: "Wayfinding",
    description: "Interactive or static maps",
    icon: FiMapPin,
  },
  {
    id: "metrics",
    label: "Metrics",
    description: "KPIs and live dashboards",
    icon: FiZap,
  },
  {
    id: "brand",
    label: "Branding",
    description: "Logos, identity elements, QR codes",
    icon: FiImage,
  },
];

export const PLACEHOLDER_MAP: Record<string, PlaceholderDefinition> =
  PLACEHOLDER_LIBRARY.reduce((acc, item) => {
    acc[item.id] = item;
    return acc;
  }, {} as Record<string, PlaceholderDefinition>);

