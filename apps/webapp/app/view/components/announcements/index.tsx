"use client";

import { useMemo } from "react";
import { AnnouncementsTiny } from "./AnnouncementsTiny";
import { AnnouncementsSmall } from "./AnnouncementsSmall";
import { AnnouncementsMedium } from "./AnnouncementsMedium";
import { AnnouncementsLarge } from "./AnnouncementsLarge";
import { AnnouncementsXLarge } from "./AnnouncementsXLarge";
import type { AnnouncementsProps, PanelSize } from "./types";

export function Announcements({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: AnnouncementsProps) {
  const {
    announcementText = "",
  } = appearance;

  // Parse announcements from text
  const announcements = useMemo(() => {
    if (announcementText) {
      return [{ id: "1", title: "", message: announcementText }];
    }
    return [];
  }, [announcementText]);

  // Calculate panel size for responsive display
  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    const isTall = rows > cols * 1.5;
    const isVeryTall = rows > cols * 2;
    
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
    announcements,
    panelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  switch (panelSize) {
    case "tiny":
      return <AnnouncementsTiny {...commonProps} />;
    case "small":
      return <AnnouncementsSmall {...commonProps} />;
    case "medium":
      return <AnnouncementsMedium {...commonProps} />;
    case "large":
      return <AnnouncementsLarge {...commonProps} />;
    case "xlarge":
      return <AnnouncementsXLarge {...commonProps} />;
    default:
      return <AnnouncementsSmall {...commonProps} />;
  }
}

