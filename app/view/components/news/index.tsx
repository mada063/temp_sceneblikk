"use client";

import { useEffect, useState, useMemo } from "react";
import { NewsTiny } from "./NewsTiny";
import { NewsSmall } from "./NewsSmall";
import { NewsMedium } from "./NewsMedium";
import { NewsLarge } from "./NewsLarge";
import { NewsXLarge } from "./NewsXLarge";
import { fetchRSSFeed, RSS_FEEDS, type RSSFeedKey } from "./utils";
import type { NewsProps, NewsFeed, PanelSize } from "./types";

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

  // Calculate panel size for responsive display based on fraction of grid
  const panelSize = useMemo((): PanelSize => {
    const panelArea = (colSpan ?? 1) * (rowSpan ?? 1);
    
    if (!totalGridSize || totalGridSize === 0) {
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) return "medium";
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    const fraction = panelArea / totalGridSize;
    
    if (fraction < 0.125) return "tiny";
    if (fraction < 0.25) return "small";
    if (fraction < 0.5) return "medium";
    if (fraction < 0.75) return "large";
    return "xlarge";
  }, [colSpan, rowSpan, totalGridSize]);

  // Get feed configuration
  const feedConfig = useMemo(() => {
    const feed = RSS_FEEDS[newsFeed as RSSFeedKey];
    if (!feed) {
      // Fallback to first available feed if invalid
      return RSS_FEEDS.nrk_main;
    }
    return feed;
  }, [newsFeed]);

  // Adjust max items based on panel size
  const adjustedMaxItems = useMemo(() => {
    switch (panelSize) {
      case "tiny":
        return 3; // Show 3 items for horizontal scrolling
      case "small":
        return 5; // Show 5 items for horizontal scrolling
      case "medium":
        return 5;
      case "large":
        return 8;
      case "xlarge":
        return Math.min(newsMaxItems, 15);
      default:
        return newsMaxItems;
    }
  }, [panelSize, newsMaxItems]);

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

