"use client";

import type { AnnouncementsProps, AnnouncementItem, PanelSize } from "./types";
import { filterActiveAnnouncements, formatAnnouncementText } from "./utils";

type AnnouncementsMediumProps = AnnouncementsProps & {
  announcements: AnnouncementItem[];
  panelSize?: PanelSize;
};

export function AnnouncementsMedium({ appearance, announcements, panelSize = "medium", colSpan = 1, rowSpan = 1 }: AnnouncementsMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 6 ? "0.75rem" : "1rem";
  const messageFontSize = "0.75rem";

  const activeAnnouncements = filterActiveAnnouncements(announcements);

  if (!activeAnnouncements || activeAnnouncements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div
          className="text-sm font-medium opacity-70"
          style={{ color: primaryColor }}
        >
          Ingen meldinger
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-2">
      {activeAnnouncements.slice(0, 3).map((announcement) => (
        <div
          key={announcement.id}
          className="flex flex-col gap-1 border-b border-opacity-20 pb-2 last:border-b-0"
          style={{ borderColor: `${primaryColor}40` }}
        >
          {announcement.title && (
            <div
              className="font-semibold"
              style={{ color: primaryColor, fontSize: titleFontSize }}
            >
              {announcement.title}
            </div>
          )}
          <div
            className="opacity-90"
            style={{ color: primaryColor, fontSize: messageFontSize }}
          >
            {formatAnnouncementText(announcement.message, messageFontSize)}
          </div>
        </div>
      ))}
    </div>
  );
}

