"use client";

import { useMemo } from "react";
import { AnnouncementsTiny } from "./AnnouncementsTiny";
import { AnnouncementsSmall } from "./AnnouncementsSmall";
import { AnnouncementsMedium } from "./AnnouncementsMedium";
import { AnnouncementsLarge } from "./AnnouncementsLarge";
import { AnnouncementsXLarge } from "./AnnouncementsXLarge";
import { usePanelSize } from "../../hooks/usePanelSize";
import type { AnnouncementsProps } from "./types";

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

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "standard");

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

