"use client";

import type { ReactElement } from "react";
import {
  RiBusFill,
  RiPlaneFill,
  RiShipFill,
  RiSubwayFill,
  RiTrainFill,
} from "react-icons/ri";

// Loosely typed to avoid react-icons vs local React type incompatibilities
const ICON_MAP: Record<string, any> = {
  airplane: RiPlaneFill,
  air: RiPlaneFill,
  flight: RiPlaneFill,
  bus: RiBusFill,
  coach: RiBusFill,
  tram: RiTrainFill,
  rail: RiTrainFill,
  train: RiTrainFill,
  subway: RiSubwayFill,
  metro: RiSubwayFill,
  light_rail: RiSubwayFill,
  water: RiShipFill,
  ferry: RiShipFill,
};

type BadgeSizeVariant = "compact" | "default" | "large";

const BADGE_SIZES: Record<
  BadgeSizeVariant,
  { width: string; height: string; fontSize: string; iconSize: number }
> = {
  compact: { width: "2.75rem", height: "1.5rem", fontSize: "0.5rem", iconSize: 12 },
  default: { width: "3.5rem", height: "1.75rem", fontSize: "0.75rem", iconSize: 14 },
  large: { width: "4rem", height: "2rem", fontSize: "0.75rem", iconSize: 16 },
};

type TransportBadgeProps = {
  line: string;
  serviceType?: string;
  badgeColor: string;
  badgeBorder: string;
  badgeTextColor: string;
  badgeRadius: number;
  size?: BadgeSizeVariant;
};

// Return type loosened to avoid react-icons vs local React type incompatibilities
function getTransportIcon(mode?: string): any {
  const normalized = mode?.toLowerCase() ?? "";
  return ICON_MAP[normalized] ?? RiBusFill;
}

export function TransportBadge({
  line,
  serviceType,
  badgeColor,
  badgeBorder,
  badgeTextColor,
  badgeRadius,
  size = "default",
}: TransportBadgeProps): ReactElement {
  const Icon = getTransportIcon(serviceType);
  const sizeConfig = BADGE_SIZES[size] ?? BADGE_SIZES.default;

  return (
    <span
      className="inline-flex items-center justify-center gap-1 font-bold uppercase tracking-wide"
      style={{
        backgroundColor: badgeColor,
        border: `1px solid ${badgeBorder}`,
        color: badgeTextColor,
        borderRadius: `${badgeRadius}px`,
        width: sizeConfig.width,
        minWidth: sizeConfig.width,
        height: sizeConfig.height,
        fontSize: sizeConfig.fontSize,
      }}
    >
      <Icon size={sizeConfig.iconSize} />
      <span
        className="leading-none"
        style={{
          fontSize: sizeConfig.fontSize,
          lineHeight: 1,
          maxWidth: "100%",
        }}
      >
        {line || "—"}
      </span>
    </span>
  );
}

export type { BadgeSizeVariant };

