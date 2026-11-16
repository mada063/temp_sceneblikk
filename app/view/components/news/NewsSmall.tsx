"use client";

import { useRef, useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const ActivityIcon = FiActivity as React.ComponentType<{ className?: string }>;
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

  // Current date/time state
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Calculate font sizes based on panel dimensions - Small container (large for readability)
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const titleFontSize = panelArea <= 2 ? "1.25rem" : "1.25rem";
  const sourceFontSize = "0.75rem";
  const dateTimeFontSize = "0.75rem";

  const itemsToShow = newsData?.items.slice(0, 5) || [];
  
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
          className="text-2xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <ActivityIcon />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-3">
        <div
          className="text-[0.5rem] font-medium text-center"
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
          className="text-[0.5rem] font-medium"
          style={{ color: `${primaryColor}CC` }}
        >
          Ingen nyheter
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-1 px-3 overflow-hidden relative">
      <div className="flex items-start justify-between gap-1">
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
      <div className="flex h-full items-center overflow-hidden">
        <div
          ref={tickerRef}
          className={`flex items-center gap-16 whitespace-nowrap ${itemsToShow.length > 1 ? "news-scroll-horizontal-small" : ""}`}
        >
          {itemsToShow.map((item, idx) => (
            <div
              key={`${item.link}-${idx}`}
              className="flex items-center gap-4 flex-shrink-0"
            >
              {idx > 0 && (
                <div
                  className="h-4 opacity-30"
                  style={{ backgroundColor: primaryColor, width: "1px" }}
                />
              )}
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
              className="flex items-center gap-4 flex-shrink-0"
            >
              <div
                className="h-4 opacity-30"
                style={{ backgroundColor: primaryColor, width: "1px" }}
              />
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

