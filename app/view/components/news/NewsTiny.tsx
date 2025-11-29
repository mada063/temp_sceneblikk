"use client";

import { useRef } from "react";
import { FiActivity } from "react-icons/fi";
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

  // Calculate font size based on panel dimensions
  const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
  const fontSize = panelArea <= 1 ? "0.5625rem" : "0.625rem"; // 9px or 10px

  const itemsToShow = newsData?.items.slice(0, 3) || [];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="text-xl opacity-50 animate-pulse"
          style={{ color: primaryColor }}
        >
          <FiActivity />
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
    <div className="flex h-full w-full items-center overflow-hidden px-2">
      <div
        ref={tickerRef}
        className={`flex items-center gap-16 whitespace-nowrap ${itemsToShow.length > 1 ? "news-scroll-horizontal-tiny" : ""}`}
      >
        {itemsToShow.map((item, idx) => (
          <div
            key={`${item.link}-${idx}`}
            className="flex-shrink-0"
          >
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
            className="flex-shrink-0"
          >
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
  );
}

