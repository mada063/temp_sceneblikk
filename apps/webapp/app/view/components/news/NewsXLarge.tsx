"use client";

import { useRef, useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";
import type { NewsProps, NewsFeed, NewsItem, PanelSize } from "./types";

type NewsXLargeProps = NewsProps & {
  newsData: NewsFeed | null;
  loading: boolean;
  error: string | null;
  scrollSpeed?: number;
  maxItems?: number;
  panelSize?: PanelSize;
};

export function NewsXLarge({ appearance, newsData, loading, error, scrollSpeed = 50, maxItems = 15, panelSize = "xlarge", colSpan = 1, rowSpan = 1 }: NewsXLargeProps) {
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

  // Calculate font sizes based on panel dimensions - XLarge container
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 24 ? "1.5rem" : "1.75rem";
  const descFontSize = "1.25rem";
  const dateFontSize = "1.25rem";
  const sourceFontSize = "1.25rem";
  const dateTimeFontSize = "1rem";

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
          className="text-6xl opacity-50 animate-pulse"
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
          className="text-lg font-medium text-center"
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
          className="text-lg font-medium"
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
  const itemGap = "2.5rem"; // gap-10 = 2.5rem

  return (
    <div className="flex h-full w-full flex-col gap-4 px-6 py-4 relative">
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
      <div className="flex-1 min-h-0 overflow-hidden relative">
        <div
          ref={tickerRef}
          className={`flex flex-col ${itemsToShow.length > 1 ? "news-scroll-xlarge" : ""}`}
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
                className="flex-shrink-0 flex flex-col gap-2 border-b border-opacity-30"
                style={{ 
                  borderColor: `${primaryColor}50`,
                  borderWidth: isLastInCopy ? 0 : undefined,
                  paddingBottom: "2rem"
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
                    className="line-clamp-2 opacity-85"
                    style={{ color: primaryColor, fontSize: descFontSize }}
                  >
                    {newsItem.description}
                  </div>
                )}
                {newsItem.pubDate && (
                  <div
                    className="opacity-70"
                    style={{ color: primaryColor, fontSize: dateFontSize }}
                  >
                    {new Date(newsItem.pubDate).toLocaleDateString("no-NO", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
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

