import type { NewsItem, NewsFeed } from "./types";

/**
 * Parse RSS XML string into NewsFeed object
 * Handles both RSS 2.0 and Atom feeds
 */
export function parseRSSFeed(xmlText: string, sourceName: string): NewsFeed {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Check for parsing errors
  const parserError = xmlDoc.querySelector("parsererror");
  if (parserError) {
    const errorText = parserError.textContent || "Unknown parsing error";
    throw new Error(`Failed to parse RSS feed: ${errorText}`);
  }

  // Try RSS 2.0 format first
  const rssChannel = xmlDoc.querySelector("channel");
  if (rssChannel) {
    const channelTitle = rssChannel.querySelector("title")?.textContent?.trim() || sourceName;

    // Get all items
    const items = Array.from(xmlDoc.querySelectorAll("item")).map((item) => {
      const title = item.querySelector("title")?.textContent?.trim() || "";
      // Handle link - can be text content or CDATA
      let link = item.querySelector("link")?.textContent?.trim() || "";
      // If link is empty, try guid
      if (!link) {
        link = item.querySelector("guid")?.textContent?.trim() || "";
      }
      const description = item.querySelector("description")?.textContent?.trim() || "";
      const pubDate = item.querySelector("pubDate")?.textContent?.trim() || "";

      return {
        title,
        link,
        description,
        pubDate,
        source: sourceName,
      } as NewsItem;
    });

    return {
      title: channelTitle,
      items: items.filter((item) => item.title && item.link), // Filter out invalid items
      lastUpdated: new Date(),
    };
  }

  // Try Atom format
  const atomFeed = xmlDoc.querySelector("feed");
  if (atomFeed) {
    const feedTitle = atomFeed.querySelector("title")?.textContent?.trim() || sourceName;

    const items = Array.from(xmlDoc.querySelectorAll("entry")).map((entry) => {
      const title = entry.querySelector("title")?.textContent?.trim() || "";
      // Atom uses link with href attribute
      const linkElement = entry.querySelector("link");
      const link = linkElement?.getAttribute("href") || linkElement?.textContent?.trim() || "";
      const summary = entry.querySelector("summary") || entry.querySelector("content");
      const description = summary?.textContent?.trim() || "";
      const pubDate = entry.querySelector("published")?.textContent?.trim() || 
                     entry.querySelector("updated")?.textContent?.trim() || "";

      return {
        title,
        link,
        description,
        pubDate,
        source: sourceName,
      } as NewsItem;
    });

    return {
      title: feedTitle,
      items: items.filter((item) => item.title && item.link),
      lastUpdated: new Date(),
    };
  }

  throw new Error("Unsupported RSS feed format");
}

/**
 * Fetch RSS feed from URL
 * Note: Some RSS feeds may have CORS restrictions. In production, consider using a backend proxy.
 */
export async function fetchRSSFeed(url: string, sourceName: string): Promise<NewsFeed> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "sceneblikk-app/1.0 (contact@example.com)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      // Some RSS feeds may require credentials or have CORS restrictions
      mode: "cors",
      cache: "no-cache",
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xmlText = await response.text();
    
    if (!xmlText || xmlText.trim().length === 0) {
      throw new Error("Empty response from RSS feed");
    }

    return parseRSSFeed(xmlText, sourceName);
  } catch (error) {
    // Provide more helpful error messages
    if (error instanceof TypeError && error.message.includes("fetch")) {
      throw new Error(`Network error: Unable to fetch RSS feed. This may be due to CORS restrictions.`);
    }
    throw new Error(`Error fetching RSS feed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Available RSS feed sources
 */
export const RSS_FEEDS = {
  // NRK feeds
  nrk_main: {
    url: "https://www.nrk.no/toppsaker.rss",
    name: "NRK Nyheter",
  },
  nrk_nyheter: {
    url: "https://www.nrk.no/nyheter/siste.rss",
    name: "NRK Nyheter",
  },
  nrk_sport: {
    url: "https://www.nrk.no/sport/toppsaker.rss",
    name: "NRK Sport",
  },
  nrk_kultur: {
    url: "https://www.nrk.no/kultur/toppsaker.rss",
    name: "NRK Kultur",
  },
  nrk_innenriks: {
    url: "https://www.nrk.no/norge/toppsaker.rss",
    name: "NRK Innenriks",
  },
  nrk_urix: {
    url: "https://www.nrk.no/urix/toppsaker.rss",
    name: "NRK Urix",
  },
  // TV2 feeds
  tv2_nyheter: {
    url: "https://www.tv2.no/rss/nyheter",
    name: "TV2 Nyheter",
  },
  tv2_sport: {
    url: "https://www.tv2.no/rss/sport",
    name: "TV2 Sport",
  },
  tv2_innenriks: {
    url: "https://www.tv2.no/rss/nyheter/innenriks",
    name: "TV2 Innenriks",
  },
  tv2_utenriks: {
    url: "https://www.tv2.no/rss/nyheter/utenriks",
    name: "TV2 Utenriks",
  },
  tv2_fotball: {
    url: "https://www.tv2.no/rss/sport/fotball",
    name: "TV2 Fotball",
  },
  // DN feeds - using the services URL from the web search
  dn_main: {
    url: "https://www.dn.no/rss",
    name: "Dagens Næringsliv",
  },
} as const;

export type RSSFeedKey = keyof typeof RSS_FEEDS;

