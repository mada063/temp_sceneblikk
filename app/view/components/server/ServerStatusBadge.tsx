"use client";

import type { CellAppearance } from "../../../lib/layout-types";
import type { ServerInfo } from "./types";
import type { ServerLabels } from "./labels";
import { getServerStatusBadgeStyle, isBadgeTransparent } from "./badge-styles";

type BadgeSizeVariant = "compact" | "default" | "large";

const BADGE_SIZES: Record<BadgeSizeVariant, { size: string; fontSize: string }> = {
  compact: { size: "1.5rem", fontSize: "0.5rem" },
  default: { size: "1.75rem", fontSize: "0.625rem" },
  large: { size: "2rem", fontSize: "0.75rem" },
};

type ServerStatusBadgeProps = {
  status: ServerInfo["status"];
  appearance: CellAppearance;
  labels: ServerLabels;
  size?: BadgeSizeVariant;
};

export function ServerStatusBadge({
  status,
  appearance,
  labels,
  size = "default",
}: ServerStatusBadgeProps) {
  const sizeConfig = BADGE_SIZES[size] ?? BADGE_SIZES.default;
  const badgeRadius = appearance.serverStatusBadgeRadius ?? appearance.borderRadius ?? 8;
  const statusStyle = getServerStatusBadgeStyle(status, appearance, labels);
  const hasFill = !isBadgeTransparent(appearance);
  const isVisible = statusStyle.showText || statusStyle.showBorder || hasFill;

  return (
    <span
      className="inline-flex shrink-0 items-center justify-center font-bold uppercase leading-none tracking-wide"
      style={{
        backgroundColor: statusStyle.backgroundColor,
        border: statusStyle.showBorder ? `1px solid ${statusStyle.borderColor}` : "none",
        color: statusStyle.color,
        borderRadius: `${badgeRadius}px`,
        width: isVisible ? sizeConfig.size : 0,
        minWidth: isVisible ? sizeConfig.size : 0,
        height: isVisible ? sizeConfig.size : 0,
        fontSize: sizeConfig.fontSize,
        overflow: "hidden",
      }}
      aria-label={`${labels.statusColumn} ${status}`}
    >
      {statusStyle.showText ? statusStyle.label : null}
    </span>
  );
}

export type { BadgeSizeVariant };
