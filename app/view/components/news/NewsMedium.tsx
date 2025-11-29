"use client";

import { useRef } from "react";
import { FiActivity } from "react-icons/fi";
import type { NewsProps, NewsFeed, PanelSize } from "./types";

type NewsMediumProps = NewsProps & {
  newsData: NewsFeed | null;
  loading: boolean;
  error: string | null;
  scrollSpeed?: number;
  maxItems?: number;
  panelSize?: PanelSize;
};

export function NewsMedium({ appearance, newsData, loading, error, scrollSpeed = 50, maxItems = 5, panelSize = "medium", colSpan = 1, rowSpan = 1 }: NewsMediumProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const tickerRef = useRef<HTMLDivElement>(null);

  // Calculate font sizes based on panel dimensions
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 6 ? "0.75rem" : "0.875rem"; // 12px or 14px
  const sourceFontSize = "0.5625rem"; // 9px

  const itemsToShow = newsData?.items.slice(0, maxItems) || [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-4xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <FiActivity />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div
          className="text-sm font-medium text-center"
          style={{ color: `${primaryColor}CC` }}
        >
          {error}
        </div>
      </div>
    );
  }

  if (!newsData || itemsToShow.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-sm font-medium"
          style={{ color: `${primaryColor}CC` }}
        >
          Ingen nyheter
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-2">
      {appearance.newsShowSource && (
        <div
          className="font-medium uppercase tracking-wider"
          style={{ color: `${primaryColor}AA`, fontSize: sourceFontSize }}
        >
          {newsData.title}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          ref={tickerRef}
          className={`flex flex-col gap-6 h-full ${itemsToShow.length > 1 ? "news-scroll-medium" : ""}`}
        >
          {itemsToShow.map((item, idx) => (
            <div
              key={`${item.link}-${idx}`}
              className="flex-shrink-0"
            >
              <div
                className="font-semibold line-clamp-2"
                style={{ color: primaryColor, fontSize: titleFontSize }}
              >
                {item.title}
              </div>
            </div>
          ))}
          {/* Duplicate items for seamless loop */}
          {itemsToShow.length > 1 && itemsToShow.map((item, idx) => (
            <div
              key={`${item.link}-${idx}-dup`}
              className="flex-shrink-0"
            >
              <div
                className="font-semibold line-clamp-2"
                style={{ color: primaryColor, fontSize: titleFontSize }}
              >
                {item.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

