"use client";

import type { AnnouncementsProps, AnnouncementItem, PanelSize } from "./types";
import { formatAnnouncementText } from "./utils";

type AnnouncementsTinyProps = AnnouncementsProps & {
  announcements: AnnouncementItem[];
  panelSize?: PanelSize;
};

export function AnnouncementsTiny({ appearance, announcements, panelSize = "tiny", colSpan = 1, rowSpan = 1 }: AnnouncementsTinyProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const fontSize = panelArea <= 1 ? "0.5rem" : "0.5rem";

  if (!announcements || announcements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-2">
        <div
          className="text-[0.5rem] font-medium opacity-70"
          style={{ color: primaryColor, fontSize }}
        >
          Ingen meldinger
        </div>
      </div>
    );
  }

  const activeAnnouncement = announcements[0];

  return (
    <div className="flex h-full w-full items-center justify-center px-2 overflow-hidden">
      <div
        className="font-semibold text-center"
        style={{ color: primaryColor, fontSize }}
      >
        {formatAnnouncementText(activeAnnouncement.message || activeAnnouncement.title, fontSize)}
      </div>
    </div>
  );
}


