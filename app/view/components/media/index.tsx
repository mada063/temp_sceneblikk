"use client";

import { useMemo } from "react";
import { MediaTiny } from "./MediaTiny";
import { MediaSmall } from "./MediaSmall";
import { MediaMedium } from "./MediaMedium";
import { MediaLarge } from "./MediaLarge";
import { MediaXLarge } from "./MediaXLarge";
import { usePanelSize } from "../../hooks/usePanelSize";
import type { MediaProps } from "./types";
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

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");

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

