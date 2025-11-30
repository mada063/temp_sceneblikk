"use client";

import { useMemo } from "react";
import { BrandingTiny } from "./BrandingTiny";
import { BrandingSmall } from "./BrandingSmall";
import { BrandingMedium } from "./BrandingMedium";
import { BrandingLarge } from "./BrandingLarge";
import { BrandingXLarge } from "./BrandingXLarge";
import type { BrandingProps, PanelSize } from "./types";

export function Branding({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: BrandingProps) {
  const {
    brandingLogoUrl = "",
    brandingText = "",
  } = appearance;

  // Calculate panel size for responsive display
  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    
    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    const fraction = panelArea / totalGridSize;
    
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

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

