"use client";

import { useMemo } from "react";
import { MediaTiny } from "./MediaTiny";
import { MediaSmall } from "./MediaSmall";
import { MediaMedium } from "./MediaMedium";
import { MediaLarge } from "./MediaLarge";
import { MediaXLarge } from "./MediaXLarge";
import type { MediaProps, PanelSize } from "./types";
import { parseMediaItems } from "./utils";

export function Media({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: MediaProps) {
  const {
    mediaType = "image",
    mediaUrls = "",
    mediaAutoPlay = true,
    mediaTransitionDuration = 5,
  } = appearance;

  // Parse media items from URLs
  const items = useMemo(() => {
    if (mediaUrls) {
      return parseMediaItems(mediaUrls, mediaType);
    }
    return [];
  }, [mediaUrls, mediaType]);

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
    items,
    autoPlay: mediaAutoPlay,
    transitionDuration: mediaTransitionDuration,
    panelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  switch (panelSize) {
    case "tiny":
      return <MediaTiny {...commonProps} />;
    case "small":
      return <MediaSmall {...commonProps} />;
    case "medium":
      return <MediaMedium {...commonProps} />;
    case "large":
      return <MediaLarge {...commonProps} />;
    case "xlarge":
      return <MediaXLarge {...commonProps} />;
    default:
      return <MediaSmall {...commonProps} />;
  }
}

