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

  // Calculate panel size for responsive display based on area, ratio, and dimensions
  const panelSize = useMemo((): PanelSize => {
    const cols = colSpan ?? 1;
    const rows = rowSpan ?? 1;
    const panelArea = cols * rows;
    const isTall = rows > cols * 1.5; // Tall panels (height > 1.5x width)
    const isVeryTall = rows > cols * 2; // Very tall panels (height > 2x width)
    const isWide = cols > rows * 1.5; // Wide panels (width > 1.5x height)
    
    if (!totalGridSize || totalGridSize === 0) {
      // Absolute sizing when total grid size is unknown
      if (panelArea <= 1) return "tiny";
      if (panelArea <= 2) return "small";
      if (panelArea <= 6) {
        // Medium: use for moderately sized panels
        // Avoid medium for very tall narrow panels - use small instead for horizontal scrolling
        if (isVeryTall && cols === 1) return "small";
        // Avoid medium for tall panels with few columns - use large instead
        if (isTall && rows >= 4 && cols <= 2) return "large";
        return "medium";
      }
      if (panelArea <= 12) return "large";
      return "xlarge";
    }
    
    const fraction = panelArea / totalGridSize;
    
    // Tiny: very small panels (< 12.5% of grid)
    if (fraction < 0.125) {
      return "tiny";
    }
    
    // Small: small panels (12.5-25% of grid) OR very tall narrow panels
    if (fraction < 0.25) {
      return "small";
    }
    // Also use small for very tall narrow panels even if they're larger
    if (fraction < 0.4 && isVeryTall && cols === 1) {
      return "small";
    }
    
    // Medium: medium sized panels (25-50% of grid)
    // But avoid for very tall panels - use large instead for better vertical spacing
    if (fraction < 0.5) {
      if (isVeryTall && rows >= 4) {
        return "large"; // Very tall panels get large component for better spacing
      }
      if (isTall && rows >= 5 && cols <= 2) {
        return "large"; // Tall narrow panels get large component
      }
      return "medium";
    }
    
    // Large: larger panels (50-75% of grid)
    if (fraction < 0.75) {
      return "large";
    }
    
    // XLarge: very large panels (> 75% of grid)
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

