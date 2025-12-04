"use client";

import { useRef, useState, useEffect } from "react";
import { FiActivity } from "react-icons/fi";

// Loosely typed icon components to avoid react-icons vs local React type incompatibilities
const ActivityIcon = FiActivity as React.ComponentType<{ className?: string }>;
import type { NewsProps, NewsFeed, PanelSize } from "./types";

type NewsTinyProps = NewsProps & {
  newsData: NewsFeed | null;
  loading: boolean;
  error: string | null;
  scrollSpeed?: number;
  panelSize?: PanelSize;
};

export function NewsTiny({ appearance, newsData, loading, error, scrollSpeed = 50, panelSize = "tiny", colSpan = 1, rowSpan = 1 }: NewsTinyProps) {
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

  // Calculate font size based on panel dimensions - Tiny container
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const fontSize = panelArea <= 1 ? "0.5rem" : "0.5625rem"; // 8px or 9px - smallest for tiny containers
  const dateTimeFontSize = "0.375rem"; // 6px - very small for tiny

  const itemsToShow = newsData?.items.slice(0, 3) || [];
  
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
          className="text-xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <ActivityIcon />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-2">
        <div
          className="text-[8px] font-medium text-center"
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
          className="text-[8px] font-medium"
          style={{ color: `${primaryColor}CC` }}
        >
          Ingen nyheter
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col justify-center gap-0.5 px-2 overflow-hidden relative">
      <div className="flex items-start justify-between gap-1">
        {newsData && (
          <div
            className="font-medium uppercase tracking-wider opacity-70 px-1"
            style={{ color: primaryColor, fontSize: "0.4375rem" }} // 7px - very small for tiny
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
          className={`flex items-center gap-12 whitespace-nowrap ${itemsToShow.length > 1 ? "news-scroll-horizontal-tiny" : ""}`}
        >
        {itemsToShow.map((item, idx) => (
          <div
            key={`${item.link}-${idx}`}
            className="flex items-center gap-3 flex-shrink-0"
          >
            {idx > 0 && (
              <div
                className="h-3 opacity-30"
                style={{ backgroundColor: primaryColor, width: "1px" }}
              />
            )}
            <div
              className="font-semibold"
              style={{ color: primaryColor, fontSize }}
            >
              {item.title}
            </div>
          </div>
        ))}
        {/* Duplicate items for seamless loop */}
        {itemsToShow.length > 1 && itemsToShow.map((item, idx) => (
          <div
            key={`${item.link}-${idx}-dup`}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div
              className="h-3 opacity-30"
              style={{ backgroundColor: primaryColor, width: "1px" }}
            />
            <div
              className="font-semibold"
              style={{ color: primaryColor, fontSize }}
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

