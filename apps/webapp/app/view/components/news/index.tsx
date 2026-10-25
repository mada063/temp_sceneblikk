"use client";

import { useEffect, useState, useMemo } from "react";
import { NewsTiny } from "./NewsTiny";
import { NewsSmall } from "./NewsSmall";
import { NewsMedium } from "./NewsMedium";
import { NewsLarge } from "./NewsLarge";
import { NewsXLarge } from "./NewsXLarge";
import { fetchRSSFeed, RSS_FEEDS, type RSSFeedKey } from "./utils";
import { usePanelSize } from "../../hooks/usePanelSize";
import type { NewsProps, NewsFeed } from "./types";

export function News({ appearance, colSpan = 1, rowSpan = 1, totalGridSize }: NewsProps) {
  const {
    newsFeed = "nrk_main",
    newsScrollSpeed = 50,
    newsMaxItems = 10,
    newsShowSource = true,
  } = appearance;

  const [newsData, setNewsData] = useState<NewsFeed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const panelSize = usePanelSize(colSpan, rowSpan, totalGridSize, "news");

  // Get feed configuration
  const feedConfig = useMemo(() => {
    const feed = RSS_FEEDS[newsFeed as RSSFeedKey];
    if (!feed) {
      // Fallback to first available feed if invalid
      return RSS_FEEDS.nrk_main;
    }
    return feed;
  }, [newsFeed]);

  // Adjust max items based on panel size and dimensions
  const adjustedMaxItems = useMemo(() => {
    const rows = rowSpan ?? 1;
    const cols = colSpan ?? 1;
    const isTall = rows > cols * 1.5;
    
    switch (panelSize) {
      case "tiny":
        return 3; // Show 3 items for horizontal scrolling
      case "small":
        return 5; // Show 5 items for horizontal scrolling
      case "medium":
        // For tall medium panels, show more items to fill the vertical space
        if (isTall && rows >= 4) {
          return Math.min(8, newsMaxItems);
        }
        return 5;
      case "large":
        // For tall large panels, adjust item count
        if (isTall && rows >= 5) {
          return Math.min(12, newsMaxItems);
        }
        return 8;
      case "xlarge":
        return Math.min(newsMaxItems, 15);
      default:
        return newsMaxItems;
    }
  }, [panelSize, newsMaxItems, rowSpan, colSpan]);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        setError(null);

        const feed = await fetchRSSFeed(feedConfig.url, feedConfig.name);
        setNewsData(feed);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load news");
        console.error("Error loading news:", err);
      } finally {
        setLoading(false);
      }
    };

    loadNews();

    // Refresh every 15 minutes
    const interval = setInterval(loadNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [feedConfig.url, feedConfig.name]);

  const commonProps = {
    appearance,
    newsData,
    loading,
    error,
    scrollSpeed: newsScrollSpeed,
    maxItems: adjustedMaxItems,
    panelSize,
    colSpan,
    rowSpan,
    totalGridSize,
  };

  switch (panelSize) {
    case "tiny":
      return <NewsTiny {...commonProps} />;
    case "small":
      return <NewsSmall {...commonProps} />;
    case "medium":
      return <NewsMedium {...commonProps} />;
    case "large":
      return <NewsLarge {...commonProps} />;
    case "xlarge":
      return <NewsXLarge {...commonProps} />;
    default:
      return <NewsSmall {...commonProps} />;
  }
}

