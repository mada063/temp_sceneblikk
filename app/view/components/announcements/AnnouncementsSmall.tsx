"use client";

import type { AnnouncementsProps, AnnouncementItem, PanelSize } from "./types";
import { formatAnnouncementText } from "./utils";

type AnnouncementsSmallProps = AnnouncementsProps & {
  announcements: AnnouncementItem[];
  panelSize?: PanelSize;
};

export function AnnouncementsSmall({ appearance, announcements, panelSize = "small", colSpan = 1, rowSpan = 1 }: AnnouncementsSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 2 ? "0.625rem" : "0.6875rem";
  const messageFontSize = "0.5625rem";

  if (!announcements || announcements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div
          className="text-[9px] font-medium opacity-70"
          style={{ color: primaryColor, fontSize: titleFontSize }}
        >
          Ingen meldinger
        </div>
      </div>
    );
  }

  const activeAnnouncement = announcements[0];

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1 px-3">
      {activeAnnouncement.title && (
        <div
          className="font-semibold uppercase tracking-wider"
          style={{ color: primaryColor, fontSize: titleFontSize }}
        >
          {activeAnnouncement.title}
        </div>
      )}
      <div
        style={{ color: primaryColor, fontSize: messageFontSize, opacity: 0.9 }}
      >
        {formatAnnouncementText(activeAnnouncement.message, messageFontSize)}
      </div>
    </div>
  );
}


