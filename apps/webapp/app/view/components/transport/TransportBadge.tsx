"use client";

import type { ReactElement } from "react";
import type { IconType } from "react-icons";
import {
  RiBusFill,
  RiPlaneFill,
  RiShipFill,
  RiSubwayFill,
  RiTrainFill,
} from "react-icons/ri";

const ICON_MAP: Record<string, IconType> = {
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
  { width: number; height: number; fontSize: string; iconSize: number }
> = {
  compact: { width: 44, height: 24, fontSize: "0.6rem", iconSize: 12 },
  default: { width: 56, height: 28, fontSize: "0.7rem", iconSize: 14 },
  large: { width: 64, height: 32, fontSize: "0.85rem", iconSize: 16 },
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

function getTransportIcon(mode?: string): IconType {
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
        width: `${sizeConfig.width}px`,
        minWidth: `${sizeConfig.width}px`,
        height: `${sizeConfig.height}px`,
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

