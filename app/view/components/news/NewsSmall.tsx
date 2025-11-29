"use client";

import { useRef } from "react";
import { FiActivity } from "react-icons/fi";
import type { NewsProps, NewsFeed, PanelSize } from "./types";

type NewsSmallProps = NewsProps & {
  newsData: NewsFeed | null;
  loading: boolean;
  error: string | null;
  scrollSpeed?: number;
  panelSize?: PanelSize;
};

export function NewsSmall({ appearance, newsData, loading, error, scrollSpeed = 50, panelSize = "small", colSpan = 1, rowSpan = 1 }: NewsSmallProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const tickerRef = useRef<HTMLDivElement>(null);

  // Calculate font sizes based on panel dimensions
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 2 ? "0.625rem" : "0.6875rem"; // 10px or 11px
  const sourceFontSize = "0.5rem"; // 8px

  const itemsToShow = newsData?.items.slice(0, 5) || [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-2xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <FiActivity />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div
          className="text-[9px] font-medium text-center"
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
          className="text-[9px] font-medium"
          style={{ color: `${primaryColor}CC` }}
        >
          Ingen nyheter
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1 px-3 overflow-hidden">
      {appearance.newsShowSource && (
        <div
          className="font-medium uppercase tracking-wider"
          style={{ color: `${primaryColor}AA`, fontSize: sourceFontSize }}
        >
          {newsData.title}
        </div>
      )}
      <div className="flex h-full items-center overflow-hidden">
        <div
          ref={tickerRef}
          className={`flex items-center gap-20 whitespace-nowrap ${itemsToShow.length > 1 ? "news-scroll-horizontal-small" : ""}`}
        >
          {itemsToShow.map((item, idx) => (
            <div
              key={`${item.link}-${idx}`}
              className="flex-shrink-0"
            >
              <div
                className="font-semibold"
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
                className="font-semibold"
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

