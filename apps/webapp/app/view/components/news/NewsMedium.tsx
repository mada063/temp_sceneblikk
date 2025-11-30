"use client";

import { useRef, useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";
import type { NewsProps, NewsFeed, NewsItem, PanelSize } from "./types";

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

  // Current date/time state
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate font sizes based on panel dimensions - Medium container
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 6 ? "0.8125rem" : "0.9375rem"; // 13px or 15px - medium size
  const descFontSize = "0.6875rem"; // 11px
  const sourceFontSize = "0.625rem"; // 10px
  const dateTimeFontSize = "0.5625rem"; // 9px

  const itemsToShow = newsData?.items.slice(0, maxItems) || [];
  
  // Format date/time for display
  const dateTimeString = now.toLocaleDateString("no-NO", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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

  // Create multiple duplicates for seamless scrolling (4 copies total) with gaps between copies
  const createDuplicatedItemsWithGaps = () => {
    if (itemsToShow.length <= 1) return itemsToShow;
    
    const copies = [];
    for (let i = 0; i < 4; i++) {
      copies.push(...itemsToShow.map((item, idx) => ({ ...item, copyIndex: i, originalIndex: idx })));
      // Add gap spacer between copies (except after last copy)
      if (i < 3) {
        copies.push({ isSpacer: true, copyIndex: i });
      }
    }
    return copies;
  };

  const duplicatedItems = createDuplicatedItemsWithGaps();
  const itemGap = (rowSpan ?? 1) > 3 ? "1rem" : "1.5rem";

  return (
    <div className="flex h-full w-full flex-col gap-2 px-4 py-2 relative">
      <div className="flex items-start justify-between gap-2">
        {newsData && (
          <div
            className="font-medium uppercase tracking-wider opacity-70 px-1"
            style={{ color: primaryColor, fontSize: sourceFontSize }}
          >
            {newsData.title}
          </div>
        )}
        <div
          className="opacity-60 whitespace-nowrap"
          style={{ color: primaryColor, fontSize: dateTimeFontSize }}
        >
          {dateTimeString}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-hidden">
        <div
          ref={tickerRef}
          className={`flex flex-col ${itemsToShow.length > 1 ? "news-scroll-medium" : ""}`}
          style={{ gap: itemGap }}
        >
          {duplicatedItems.map((item, idx) => {
            if ('isSpacer' in item && item.isSpacer) {
              // Gap spacer between copy sets
              return (
                <div
                  key={`spacer-${item.copyIndex}`}
                  className="flex-shrink-0"
                  style={{ height: itemGap }}
                />
              );
            }
            const newsItem = item as NewsItem & { copyIndex: number; originalIndex: number };
            const isLastInCopy = newsItem.originalIndex === itemsToShow.length - 1;
            return (
              <div
                key={`${newsItem.link}-${newsItem.copyIndex}-${newsItem.originalIndex}`}
                className="flex-shrink-0 flex flex-col gap-1 border-b border-opacity-20"
                style={{ 
                  borderColor: `${primaryColor}40`, 
                  paddingBottom: (rowSpan ?? 1) > 3 ? "0.75rem" : "1rem",
                  borderWidth: isLastInCopy ? 0 : undefined
                }}
              >
                <div
                  className="font-semibold line-clamp-2"
                  style={{ color: primaryColor, fontSize: titleFontSize }}
                >
                  {newsItem.title}
                </div>
                {newsItem.description && (
                  <div
                    className="line-clamp-1 opacity-80"
                    style={{ color: primaryColor, fontSize: descFontSize }}
                  >
                    {newsItem.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

