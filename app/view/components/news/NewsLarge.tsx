"use client";

import { useRef } from "react";
import { FiActivity } from "react-icons/fi";
import type { NewsProps, NewsFeed, PanelSize } from "./types";

type NewsLargeProps = NewsProps & {
  newsData: NewsFeed | null;
  loading: boolean;
  error: string | null;
  scrollSpeed?: number;
  maxItems?: number;
  panelSize?: PanelSize;
};

export function NewsLarge({ appearance, newsData, loading, error, scrollSpeed = 50, maxItems = 8, panelSize = "large", colSpan = 1, rowSpan = 1 }: NewsLargeProps) {
  const primaryColor = appearance.textColor || "#ffffff";
  const tickerRef = useRef<HTMLDivElement>(null);

  // Calculate font sizes based on panel dimensions
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 12 ? "0.875rem" : "1rem"; // 14px or 16px
  const descFontSize = "0.625rem"; // 10px
  const sourceFontSize = "0.625rem"; // 10px

  const itemsToShow = newsData?.items.slice(0, maxItems) || [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-5xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <FiActivity />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <div
          className="text-base font-medium text-center"
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
          className="text-base font-medium"
          style={{ color: `${primaryColor}CC` }}
        >
          Ingen nyheter
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-3 px-6 py-3">
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
          className={`flex flex-col gap-8 h-full ${itemsToShow.length > 1 ? "news-scroll-large" : ""}`}
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
              {item.description && (
                <div
                  className="mt-1 line-clamp-1"
                  style={{ color: `${primaryColor}CC`, fontSize: descFontSize }}
                >
                  {item.description}
                </div>
              )}
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
              {item.description && (
                <div
                  className="mt-1 line-clamp-1"
                  style={{ color: `${primaryColor}CC`, fontSize: descFontSize }}
                >
                  {item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

