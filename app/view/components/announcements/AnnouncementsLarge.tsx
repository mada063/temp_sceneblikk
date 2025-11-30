"use client";

import type { AnnouncementsProps, AnnouncementItem, PanelSize } from "./types";
import { filterActiveAnnouncements, formatAnnouncementText } from "./utils";

type AnnouncementsLargeProps = AnnouncementsProps & {
  announcements: AnnouncementItem[];
  panelSize?: PanelSize;
};

export function AnnouncementsLarge({ appearance, announcements, panelSize = "large", colSpan = 1, rowSpan = 1 }: AnnouncementsLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 12 ? "0.9375rem" : "1.0625rem";
  const messageFontSize = "0.75rem";

  const activeAnnouncements = filterActiveAnnouncements(announcements);

  if (!activeAnnouncements || activeAnnouncements.length === 0) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div
          className="text-base font-medium opacity-70"
          style={{ color: primaryColor }}
        >
          Ingen meldinger
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 px-6 py-3">
      {activeAnnouncements.slice(0, 5).map((announcement) => (
        <div
          key={announcement.id}
          className="flex flex-col gap-1.5 border-b border-opacity-30 pb-3 last:border-b-0"
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

