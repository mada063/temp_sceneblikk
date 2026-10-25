"use client";

import { usePanelSize } from "../../hooks/usePanelSize";
import { BrandingTiny } from "./BrandingTiny";
import { BrandingSmall } from "./BrandingSmall";
import { BrandingMedium } from "./BrandingMedium";
import { BrandingLarge } from "./BrandingLarge";
import { BrandingXLarge } from "./BrandingXLarge";
import type { BrandingProps } from "./types";

export function Branding({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: BrandingProps) {
  const {
    brandingLogoUrl = "",
    brandingText = "",
  } = appearance;

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");

  const commonProps = {
    appearance,
    logoUrl: brandingLogoUrl,
    text: brandingText,
    panelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  switch (panelSize) {
    case "tiny":
      return <BrandingTiny {...commonProps} />;
    case "small":
      return <BrandingSmall {...commonProps} />;
    case "medium":
      return <BrandingMedium {...commonProps} />;
    case "large":
      return <BrandingLarge {...commonProps} />;
    case "xlarge":
      return <BrandingXLarge {...commonProps} />;
    default:
      return <BrandingSmall {...commonProps} />;
  }
}

