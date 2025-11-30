"use client";

import type { AnnouncementsProps, AnnouncementItem, PanelSize } from "./types";
import { filterActiveAnnouncements, formatAnnouncementText } from "./utils";

type AnnouncementsXLargeProps = AnnouncementsProps & {
  announcements: AnnouncementItem[];
  panelSize?: PanelSize;
};

export function AnnouncementsXLarge({ appearance, announcements, panelSize = "xlarge", colSpan = 1, rowSpan = 1 }: AnnouncementsXLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 24 ? "1.125rem" : "1.25rem";
  const messageFontSize = "0.875rem";

  const activeAnnouncements = filterActiveAnnouncements(announcements);

  if (!activeAnnouncements || activeAnnouncements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div
          className="text-lg font-medium opacity-70"
          style={{ color: primaryColor }}
        >
          Ingen meldinger
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-4 px-6 py-4">
      {activeAnnouncements.slice(0, 8).map((announcement) => (
        <div
          key={announcement.id}
          className="flex flex-col gap-2 border-b border-opacity-30 pb-4 last:border-b-0"
          style={{ borderColor: `${primaryColor}50` }}
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


